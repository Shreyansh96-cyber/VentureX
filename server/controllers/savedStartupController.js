import mongoose from "mongoose";

import SavedStartup from "../models/SavedStartup.js";
import User from "../models/User.js";
import Startup from "../models/Startup.js";

const normalizeId = (value) => {
  if (!value) return null;

  try {
    return new mongoose.Types.ObjectId(String(value));
  } catch {
    return String(value);
  }
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || ""));

const getRequestUserId = (req) => String(req.authenticatedUser._id);

const getRequestedUserId = (req) =>
  req.params.userId ||
  req.params.investorId ||
  req.body?.userId ||
  req.body?.investorId ||
  req.query?.userId ||
  req.query?.investorId;

const validateRequestedUser = (req, userId, res) => {
  const requestedUserId = getRequestedUserId(req);
  if (!requestedUserId) return true;

  if (!isValidObjectId(requestedUserId)) {
    res.status(400).json({ success: false, message: "Invalid user ID." });
    return false;
  }

  if (String(requestedUserId) !== String(userId)) {
    res.status(403).json({ success: false, message: "You can only manage your own saved startups." });
    return false;
  }

  return true;
};

const buildUserQuery = (userId) => {
  const normalizedUserId = normalizeId(userId);

  return {
    $or: [{ userId: normalizedUserId }, { investorId: normalizedUserId }],
  };
};

const ensureOwnership = (req, userId) => {
  if (!userId) return false;

  const currentUserId = req.authenticatedUser?._id || req.authenticatedUser?.id;

  if (!currentUserId) return true;

  return String(currentUserId) === String(userId);
};

export const saveStartup = async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    const startupId = req.body?.startupId || req.params?.startupId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required.",
      });
    }

    if (!validateRequestedUser(req, userId, res)) return;

    if (!startupId) {
      return res.status(400).json({
        success: false,
        message: "Startup ID is required.",
      });
    }

    if (!isValidObjectId(startupId)) {
      return res.status(400).json({ success: false, message: "Invalid startup ID." });
    }

    if (!ensureOwnership(req, userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only save startups for your own account.",
      });
    }

    const user = await User.findById(userId).select("_id");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const startup = await Startup.findById(startupId);

    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found.",
      });
    }

    const existing = await SavedStartup.findOne({
      ...buildUserQuery(userId),
      startupId: normalizeId(startupId),
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Startup already saved",
      });
    }

    const saved = await SavedStartup.create({
      userId: normalizeId(userId),
      investorId: normalizeId(userId),
      startupId: normalizeId(startupId),
    });

    return res.status(201).json({
      success: true,
      message: "Startup saved successfully",
      saved,
    });
  } catch (error) {
    console.error("SAVE STARTUP ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Startup already saved",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to save startup.",
    });
  }
};

export const getSavedStartups = async (req, res) => {
  try {
    const userId = getRequestUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required.",
      });
    }

    if (!validateRequestedUser(req, userId, res)) return;

    if (req.params.userId && !isValidObjectId(req.params.userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
    }

    if (!ensureOwnership(req, userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own saved startups.",
      });
    }

    const savedRecords = await SavedStartup.find({
      ...buildUserQuery(userId),
    })
      .sort({ createdAt: -1 })
      .populate("startupId");

    const startups = savedRecords
      .map((item) => item.startupId)
      .filter(Boolean);

    return res.status(200).json(startups);
  } catch (error) {
    console.error("GET SAVED STARTUPS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load saved startups.",
    });
  }
};

export const removeSavedStartup = async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    const startupId = req.body?.startupId || req.params?.startupId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required.",
      });
    }

    if (!validateRequestedUser(req, userId, res)) return;

    if (!startupId) {
      return res.status(400).json({
        success: false,
        message: "Startup ID is required.",
      });
    }

    if (!isValidObjectId(startupId)) {
      return res.status(400).json({ success: false, message: "Invalid startup ID." });
    }

    if (!ensureOwnership(req, userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only remove your own saved startups.",
      });
    }

    const deleted = await SavedStartup.findOneAndDelete({
      ...buildUserQuery(userId),
      startupId: normalizeId(startupId),
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Saved startup not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Startup removed from saved list.",
    });
  } catch (error) {
    console.error("REMOVE SAVED STARTUP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove startup.",
    });
  }
};

export const checkSavedStartup = async (req, res) => {
  try {
    const userId = req.params.userId || req.params.investorId || getRequestUserId(req);
    const startupId = req.params.startupId;

    if (!userId || !startupId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Startup ID are required.",
      });
    }

    if (!isValidObjectId(userId) || !isValidObjectId(startupId)) {
      return res.status(400).json({ success: false, message: "Invalid user or startup ID." });
    }

    if (!ensureOwnership(req, userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only check your own saved startups.",
      });
    }

    const existing = await SavedStartup.findOne({
      ...buildUserQuery(userId),
      startupId: normalizeId(startupId),
    });

    return res.status(200).json({
      success: true,
      saved: !!existing,
    });
  } catch (error) {
    console.error("CHECK SAVED STARTUP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to check saved startup.",
    });
  }
};