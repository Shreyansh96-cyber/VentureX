import mongoose from "mongoose";

import Investment from "../models/Investment.js";
import Startup from "../models/Startup.js";
import User from "../models/User.js";
import { createInvestmentNotification } from "../utils/notificationService.js";

const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(String(value || ""));
};

const normalizeStatus = (status) => {
  const value = String(status || "").trim();

  if (!value) return null;

  const normalized = value.toLowerCase();

  if (normalized === "pending") return "Pending";
  if (normalized === "accepted") return "Accepted";
  if (normalized === "rejected") return "Rejected";

  return null;
};

// ==========================================
// CREATE INVESTMENT REQUEST
// ==========================================

export const createInvestment = async (req, res) => {
  try {
    const { startupId, amount, message } = req.body || {};
    const investorId = req.authenticatedUser?._id;

    if (req.authenticatedUser?.role !== "Investor") {
      return res.status(403).json({
        message: "Investor access is required to submit an investment request.",
      });
    }

    if (!startupId || amount === undefined || amount === null) {
      return res.status(400).json({
        message: "Startup and investment amount are required.",
      });
    }

    if (!isValidObjectId(startupId)) {
      return res.status(400).json({
        message: "Invalid startupId.",
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: "Investment amount must be greater than 0.",
      });
    }

    if (message !== undefined && (typeof message !== "string" || message.length > 2000)) {
      return res.status(400).json({
        message: "Investment message must be 2,000 characters or fewer.",
      });
    }

    const investor = await User.findById(investorId);

    if (!investor) {
      return res.status(404).json({
        message: "Investor not found.",
      });
    }

    const startup = await Startup.findById(startupId);

    if (!startup) {
      return res.status(404).json({
        message: "Startup not found.",
      });
    }

    const investment = await Investment.create({
      investorId,
      startupId,
      amount: numericAmount,
      message: message?.trim() || "",
      status: "Pending",
    });

    try {
      await createInvestmentNotification({
        type: "INVESTMENT_REQUEST",
        investment,
      });
    } catch (notificationError) {
      console.error("INVESTMENT REQUEST NOTIFICATION ERROR:", notificationError);
    }

    return res.status(201).json({
      message: "Investment request submitted successfully.",
      investment,
    });
  } catch (error) {
    console.error("CREATE INVESTMENT ERROR:", error.name);

    return res.status(500).json({
      message: "Unable to create investment request.",
    });
  }
};

// ==========================================
// GET INVESTMENTS FOR A STARTUP
// ==========================================

export const getStartupInvestments = async (req, res) => {
  try {
    const { startupId } = req.params;

    if (!startupId || !isValidObjectId(startupId)) {
      return res.status(400).json({
        message: "Invalid startupId.",
      });
    }

    const ownedStartup = await Startup.findOne({
      _id: startupId,
      founderId: req.authenticatedUser?._id,
    }).select("_id");

    if (!ownedStartup) {
      return res.status(404).json({
        message: "Startup not found.",
      });
    }

    const investments = await Investment.find({ startupId })
      .populate("investorId", "name email")
      .populate("startupId", "startupName industry")
      .sort({ createdAt: -1 });

    return res.json(investments);
  } catch (error) {
    console.error("GET STARTUP INVESTMENTS ERROR:", error);

    return res.status(500).json({
      message: "Unable to fetch startup investments.",
    });
  }
};

// ==========================================
// GET INVESTMENTS BY INVESTOR
// ==========================================

export const getInvestorInvestments = async (req, res) => {
  try {
    if (req.authenticatedUser?.role !== "Investor") {
      return res.status(403).json({
        message: "Investor access is required to view these investments.",
      });
    }

    const requestedInvestorId = req.query.investorId || req.params.investorId;

    if (requestedInvestorId && !isValidObjectId(requestedInvestorId)) {
      return res.status(400).json({
        message: "Invalid investorId.",
      });
    }

    if (
      requestedInvestorId &&
      String(requestedInvestorId) !== String(req.authenticatedUser._id)
    ) {
      return res.status(403).json({
        message: "You can only view your own investments.",
      });
    }

    const investorId = req.authenticatedUser._id;

    const investments = await Investment.find({ investorId })
      .populate("startupId", "startupName industry fundingGoal status")
      .sort({ createdAt: -1 });

    return res.json(investments);
  } catch (error) {
    console.error("GET INVESTOR INVESTMENTS ERROR:", error);

    return res.status(500).json({
      message: "Unable to fetch investments.",
    });
  }
};

// ==========================================
// GET INVESTMENTS FOR A FOUNDER
// ==========================================

export const getFounderInvestments = async (req, res) => {
  try {
    const { founderId } = req.params;

    if (!founderId || !isValidObjectId(founderId)) {
      return res.status(400).json({
        message: "Invalid founderId.",
      });
    }

    if (String(req.authenticatedUser?._id) !== String(founderId)) {
      return res.status(403).json({
        message: "You can only view investment requests for your own startups.",
      });
    }

    const startups = await Startup.find({ founderId }).select("_id");
    const startupIds = startups.map((startup) => startup._id);

    const investments = await Investment.find({
      startupId: { $in: startupIds },
    })
      .populate("investorId", "name email")
      .populate("startupId", "startupName industry")
      .sort({ createdAt: -1 });

    return res.json(investments);
  } catch (error) {
    console.error("GET FOUNDER INVESTMENTS ERROR:", error.name);

    return res.status(500).json({
      message: "Unable to fetch investment requests.",
    });
  }
};

// ==========================================
// UPDATE INVESTMENT STATUS
// ==========================================

export const updateInvestmentStatus = async (req, res) => {
  try {
    const { investmentId } = req.params;
    const { status } = req.body;
    const normalizedStatus = normalizeStatus(status);

    if (!investmentId || !isValidObjectId(investmentId)) {
      return res.status(400).json({
        message: "Invalid investmentId.",
      });
    }

    if (!normalizedStatus) {
      return res.status(400).json({
        message: "Invalid investment status.",
      });
    }

    let investment = await Investment.findById(investmentId);

    if (!investment) {
      return res.status(404).json({
        message: "Investment request not found.",
      });
    }

    const ownedStartup = await Startup.findOne({
      _id: investment.startupId,
      founderId: req.authenticatedUser?._id,
    }).select("_id");

    if (!ownedStartup) {
      return res.status(404).json({
        message: "Investment request not found.",
      });
    }

    const currentStatus = normalizeStatus(investment.status);

    if (currentStatus !== "Pending" && currentStatus !== normalizedStatus) {
      return res.status(409).json({
        message: "This investment request has already been decided.",
      });
    }

    if (currentStatus === "Pending") {
      const pendingInvestment = await Investment.findOneAndUpdate(
        { _id: investmentId, status: { $in: ["Pending", "pending"] } },
        { $set: { status: normalizedStatus } },
        { new: true }
      );

      if (!pendingInvestment) {
        const latestInvestment = await Investment.findById(investmentId);

        if (normalizeStatus(latestInvestment?.status) !== normalizedStatus) {
          return res.status(409).json({
            message: "This investment request has already been decided.",
          });
        }

        investment = latestInvestment;
      } else {
        investment = pendingInvestment;
      }
    }

    try {
      await createInvestmentNotification({
        type:
          normalizedStatus === "Accepted"
            ? "INVESTMENT_ACCEPTED"
            : "INVESTMENT_REJECTED",
        investment,
      });
    } catch (notificationError) {
      console.error("INVESTMENT STATUS NOTIFICATION ERROR:", notificationError);
    }

    await investment.populate("investorId", "name email");
    await investment.populate("startupId", "startupName industry");

    return res.json({
      message: `Investment request ${normalizedStatus}.`,
      investment,
    });
  } catch (error) {
    console.error("UPDATE INVESTMENT ERROR:", error.name);

    return res.status(500).json({
      message: "Unable to update investment status.",
    });
  }
};