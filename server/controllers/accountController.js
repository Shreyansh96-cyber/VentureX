import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import path from "node:path";
import { unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import Conversation from "../models/Conversation.js";
import Investment from "../models/Investment.js";
import MentorSession from "../models/MentorSession.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import SavedStartup from "../models/SavedStartup.js";
import Startup from "../models/Startup.js";
import User from "../models/User.js";
import { verifyGoogleCredential } from "./authController.js";

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const isTransactionUnsupported = (error) =>
  error.code === 20 ||
  error.codeName === "IllegalOperation" ||
  /transaction numbers are only allowed|does not support transactions|replica set/i.test(error.message || "");
const profilePhotoDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../uploads/profile-images"
);

const deleteOwnedData = async (userId, session) => {
  const startups = await Startup.find({ founderId: userId })
    .select("_id")
    .session(session)
    .lean();
  const startupIds = startups.map((startup) => startup._id);

  const investments = await Investment.find({
    $or: [
      { investorId: userId },
      ...(startupIds.length ? [{ startupId: { $in: startupIds } }] : []),
    ],
  }).select("_id").session(session).lean();
  const mentorSessions = await MentorSession.find({
    $or: [
      { mentorId: userId },
      { requesterId: userId },
      ...(startupIds.length ? [{ startupId: { $in: startupIds } }] : []),
    ],
  }).select("_id").session(session).lean();
  const conversations = await Conversation.find({
    $or: [
      { founderId: userId },
      { investorId: userId },
      ...(startupIds.length ? [{ startupId: { $in: startupIds } }] : []),
    ],
  }).select("_id").session(session).lean();

  const investmentIds = investments.map((investment) => investment._id);
  const mentorSessionIds = mentorSessions.map((mentorSession) => mentorSession._id);
  const conversationIds = conversations.map((conversation) => conversation._id);
  const messageFilter = {
    $or: [
      { senderId: userId },
      ...(conversationIds.length ? [{ conversationId: { $in: conversationIds } }] : []),
    ],
  };
  const messages = await Message.find(messageFilter).select("_id").session(session).lean();
  const messageIds = messages.map((message) => message._id);

  await Notification.deleteMany({
    $or: [
      { recipientId: userId },
      ...(investmentIds.length ? [{ relatedId: { $in: investmentIds } }] : []),
      ...(mentorSessionIds.length ? [{ relatedId: { $in: mentorSessionIds } }] : []),
      ...(messageIds.length ? [{ relatedMessageId: { $in: messageIds } }] : []),
      ...(conversationIds.length ? [{ conversationId: { $in: conversationIds } }] : []),
    ],
  }, { session });

  await Message.deleteMany(messageFilter, { session });
  if (conversationIds.length) {
    await Conversation.deleteMany({ _id: { $in: conversationIds } }, { session });
  }
  await MentorSession.deleteMany({
    $or: [
      { mentorId: userId },
      { requesterId: userId },
      ...(startupIds.length ? [{ startupId: { $in: startupIds } }] : []),
    ],
  }, { session });
  await SavedStartup.deleteMany({
    $or: [
      { userId },
      { investorId: userId },
      ...(startupIds.length ? [{ startupId: { $in: startupIds } }] : []),
    ],
  }, { session });
  await Investment.deleteMany({
    $or: [
      { investorId: userId },
      ...(startupIds.length ? [{ startupId: { $in: startupIds } }] : []),
    ],
  }, { session });
  if (startupIds.length) {
    await Startup.deleteMany({ _id: { $in: startupIds }, founderId: userId }, { session });
  }
};

export const deleteMyAccount = async (req, res) => {
  const userId = req.authenticatedUser._id;
  const { password, credential } = req.body || {};

  try {
    const user = await User.findById(userId).select("password googleId profileImage email");
    if (!user) {
      return res.status(404).json({ message: "Your account could not be found." });
    }

    if (user.googleId) {
      if (typeof credential !== "string" || !credential || credential.length > 5000) {
        return res.status(400).json({ message: "Re-authenticate with Google to delete this account." });
      }

      let payload;
      try {
        payload = await verifyGoogleCredential(credential);
      } catch {
        return res.status(401).json({ message: "Google re-authentication failed. Please try again." });
      }

      if (
        !payload?.email_verified ||
        String(payload.sub) !== String(user.googleId) ||
        normalizeEmail(payload.email) !== normalizeEmail(user.email)
      ) {
        return res.status(401).json({ message: "Confirm the Google account linked to this VentureX profile." });
      }
    } else {
      if (typeof password !== "string" || !password) {
        return res.status(400).json({ message: "Enter your password to delete this account." });
      }
      if (!user.password || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "The password is incorrect." });
      }
    }

    await User.updateOne(
      { _id: user._id },
      { $set: { accountDeletionInProgress: true } }
    );

    const session = await mongoose.startSession();
    try {
      try {
        await session.withTransaction(async () => {
          await deleteOwnedData(user._id, session);
          const deletion = await User.deleteOne({ _id: user._id }, { session });
          if (deletion.deletedCount !== 1) {
            throw new Error("ACCOUNT_DELETE_NOT_COMPLETED");
          }
        });
      } catch (transactionError) {
        if (!isTransactionUnsupported(transactionError)) throw transactionError;

        await deleteOwnedData(user._id, null);
        const deletion = await User.deleteOne({ _id: user._id });
        if (deletion.deletedCount !== 1) {
          throw new Error("ACCOUNT_DELETE_NOT_COMPLETED", { cause: transactionError });
        }
      }
    } finally {
      await session.endSession();
    }

    if (user.profileImage?.startsWith("/uploads/profile-images/")) {
      const filename = path.basename(user.profileImage);
      await unlink(path.join(profilePhotoDirectory, filename)).catch((error) => {
        console.error("ACCOUNT PHOTO CLEANUP ERROR:", error.code || error.name);
      });
    }

    return res.status(200).json({
      success: true,
      message: "Your account and associated data have been deleted.",
    });
  } catch (error) {
    console.error("ACCOUNT DELETION ERROR:", error.name, error.code || "unknown");
    return res.status(503).json({
      success: false,
      message: "Your account deletion could not be completed. Your account is locked against new activity; retry deletion from Profile Settings or contact support.",
    });
  }
};