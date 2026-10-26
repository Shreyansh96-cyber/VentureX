import bcrypt from "bcryptjs";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import Investment from "../models/Investment.js";
import MentorSession from "../models/MentorSession.js";
import SavedStartup from "../models/SavedStartup.js";
import Startup from "../models/Startup.js";
import User from "../models/User.js";
import { profileImageDirectory } from "../config/uploads.js";

const privateUserFields = "-password -googleId -otp -otpExpiry -otpAttempts -otpResendCount -otpResendWindowStart -otpLastSentAt -accountDeletionInProgress -resetPasswordToken -resetPasswordExpire";
const acceptedStatuses = { $in: ["Accepted", "accepted"] };
class ProfileInputError extends Error {}

const getProfileStats = async (user) => {
  if (user.role === "Founder") {
    const startups = await Startup.find({ founderId: user._id }).select("_id").lean();
    const startupIds = startups.map((startup) => startup._id);

    const [investmentRequests, acceptedInvestments, mentorshipSessions] =
      await Promise.all([
        startupIds.length
          ? Investment.countDocuments({ startupId: { $in: startupIds } })
          : 0,
        startupIds.length
          ? Investment.countDocuments({
              startupId: { $in: startupIds },
              status: acceptedStatuses,
            })
          : 0,
        MentorSession.countDocuments({ requesterId: user._id }),
      ]);

    return {
      startups: startups.length,
      investmentRequests,
      acceptedInvestments,
      mentorshipSessions,
    };
  }

  if (user.role === "Investor") {
    const [investments, acceptedInvestments, savedStartups, mentorshipSessions] =
      await Promise.all([
        Investment.countDocuments({ investorId: user._id }),
        Investment.countDocuments({ investorId: user._id, status: acceptedStatuses }),
        SavedStartup.countDocuments({
          $or: [{ userId: user._id }, { investorId: user._id }],
        }),
        MentorSession.countDocuments({ requesterId: user._id }),
      ]);

    return { investments, savedStartups, acceptedInvestments, mentorshipSessions };
  }

  const [sessions, pendingSessions, acceptedSessions, completedSessions] =
    await Promise.all([
      MentorSession.countDocuments({ mentorId: user._id }),
      MentorSession.countDocuments({ mentorId: user._id, status: "Pending" }),
      MentorSession.countDocuments({ mentorId: user._id, status: "Accepted" }),
      MentorSession.countDocuments({ mentorId: user._id, status: "Completed" }),
    ]);

  return { sessions, pendingSessions, acceptedSessions, completedSessions };
};

const getCurrentUser = (req) => User.findById(req.authenticatedUser._id).select(privateUserFields);

export const getMyProfile = async (req, res) => {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return res.status(404).json({ message: "Your account could not be found." });
    }

    const stats = await getProfileStats(user);
    const googleAccount = await User.exists({
      _id: user._id,
      googleId: { $type: "string", $ne: "" },
    });
    return res.status(200).json({
      user,
      stats,
      authProvider: googleAccount ? "google" : "password",
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    return res.status(500).json({ message: "Unable to load your profile." });
  }
};

const parseString = (value, label, maxLength) => {
  if (typeof value !== "string") {
    throw new ProfileInputError(`${label} must be text.`);
  }

  const normalized = value.trim();

  if (normalized.length > maxLength) {
    throw new ProfileInputError(`${label} must be ${maxLength} characters or fewer.`);
  }

  return normalized;
};

const parseStringList = (value, label) => {
  const values = Array.isArray(value) ? value : String(value || "").split(",");

  if (values.length > 15 || values.some((item) => typeof item !== "string")) {
    throw new ProfileInputError(`${label} must contain up to 15 text entries.`);
  }

  const normalized = values.map((item) => item.trim()).filter(Boolean);

  if (normalized.some((item) => item.length > 50)) {
    throw new ProfileInputError(`${label} entries must be 50 characters or fewer.`);
  }

  return [...new Map(normalized.map((item) => [item.toLowerCase(), item])).values()];
};

const normalizeWebsite = (value) => {
  const website = parseString(value, "Website", 200);

  if (!website) return "";

  try {
    const url = new URL(/^https?:\/\//i.test(website) ? website : `https://${website}`);

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new ProfileInputError("Website must use http or https.");
    }

    return url.toString();
  } catch {
    throw new ProfileInputError("Enter a valid website address.");
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return res.status(404).json({ message: "Your account could not be found." });
    }

    const commonFields = ["name", "bio", "location", "website", "experience", "skills"];
    const roleFields = {
      Founder: ["industries"],
      Investor: ["industries", "investmentInterests"],
      Mentor: ["expertise", "availability"],
    };
    const allowedFields = new Set([...commonFields, ...(roleFields[user.role] || [])]);
    const incomingFields = Object.keys(req.body || {});
    const disallowedField = incomingFields.find((field) => !allowedFields.has(field));

    if (disallowedField) {
      return res.status(400).json({ message: "One or more fields cannot be changed." });
    }

    const stringLimits = {
      name: 80,
      bio: 500,
      location: 120,
      experience: 120,
      expertise: 120,
      availability: 120,
    };

    for (const field of Object.keys(stringLimits)) {
      if (Object.hasOwn(req.body || {}, field)) {
        user[field] = parseString(req.body[field], field, stringLimits[field]);
      }
    }

    if (Object.hasOwn(req.body || {}, "name") && user.name.length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters." });
    }

    if (Object.hasOwn(req.body || {}, "website")) {
      user.website = normalizeWebsite(req.body.website);
    }

    for (const field of ["skills", "industries", "investmentInterests"]) {
      if (Object.hasOwn(req.body || {}, field)) {
        user[field] = parseStringList(req.body[field], field);
      }
    }

    await user.save();
    const stats = await getProfileStats(user);
    const safeUser = await User.findById(user._id).select(privateUserFields);

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: safeUser,
      stats,
    });
  } catch (error) {
    if (error instanceof ProfileInputError || error.name === "ValidationError") {
      return res.status(400).json({ message: error.message || "Profile details are invalid." });
    }

    console.error("UPDATE PROFILE ERROR:", error);
    return res.status(500).json({ message: "Unable to update your profile." });
  }
};

const getProfileImageFormat = (file) => {
  const bytes = file.buffer;

  if (
    file.mimetype === "image/jpeg" &&
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return ".jpg";
  }

  if (
    file.mimetype === "image/png" &&
    bytes.length >= 8 &&
    bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return ".png";
  }

  if (
    file.mimetype === "image/webp" &&
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return ".webp";
  }

  return null;
};

export const uploadMyProfilePhoto = async (req, res) => {
  let savedFilePath;
  let profileSaved = false;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "Choose a PNG, JPEG, or WebP image." });
    }

    const extension = getProfileImageFormat(req.file);

    if (!extension) {
      return res.status(400).json({ message: "The selected file is not a valid PNG, JPEG, or WebP image." });
    }

    const user = await getCurrentUser(req);

    if (!user) {
      return res.status(404).json({ message: "Your account could not be found." });
    }

    await mkdir(profileImageDirectory, { recursive: true });
    const filename = `${user._id}-${randomUUID()}${extension}`;
    savedFilePath = path.join(profileImageDirectory, filename);
    await writeFile(savedFilePath, req.file.buffer, { flag: "wx" });

    const previousPhoto = user.profileImage;
    user.profileImage = `/uploads/profile-images/${filename}`;
    await user.save();
    profileSaved = true;

    if (previousPhoto?.startsWith("/uploads/profile-images/")) {
      const previousFilename = path.basename(previousPhoto);
      await unlink(path.join(profileImageDirectory, previousFilename)).catch(() => {});
    }

    const safeUser = await User.findById(user._id).select(privateUserFields);
    const stats = await getProfileStats(user);

    return res.status(200).json({
      message: "Profile photo updated successfully.",
      user: safeUser,
      stats,
    });
  } catch (error) {
    if (savedFilePath && !profileSaved) {
      await unlink(savedFilePath).catch(() => {});
    }

    console.error("UPLOAD PROFILE PHOTO ERROR:", error);
    return res.status(500).json({ message: "Unable to update your profile photo." });
  }
};

export const changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Complete all password fields." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirmation do not match." });
    }

    if (
      newPassword.length < 10 ||
      !/[a-z]/.test(newPassword) ||
      !/[A-Z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      return res.status(400).json({
        message: "Use at least 10 characters with uppercase, lowercase, and a number.",
      });
    }

    const user = await User.findById(req.authenticatedUser._id).select("password");

    if (!user) {
      return res.status(404).json({ message: "Your account could not be found." });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "Password sign-in is not set up for this account. Use Forgot Password first.",
      });
    }

    const currentPasswordMatches = await bcrypt.compare(currentPassword, user.password);

    if (!currentPasswordMatches) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Unable to update your password." });
  }
};