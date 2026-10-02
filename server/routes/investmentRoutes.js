import express from "express";

import {
  createInvestment,
  getStartupInvestments,
  getInvestorInvestments,
  getFounderInvestments,
  updateInvestmentStatus,
} from "../controllers/investmentController.js";
import {
  requireAuthenticatedUser,
  requireFounderAuth,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Create investment request
router.post("/", requireAuthenticatedUser, createInvestment);

// Get investments for a specific investor via query param or route param
router.get("/", requireAuthenticatedUser, getInvestorInvestments);

// Get requests for a startup
router.get("/startup/:startupId", requireFounderAuth, getStartupInvestments);

// Get investments made by investor
router.get("/investor/:investorId", requireAuthenticatedUser, getInvestorInvestments);

// Founder investment requests and status changes
router.get("/founder/:founderId", requireFounderAuth, getFounderInvestments);
router.put("/:investmentId/status", requireFounderAuth, updateInvestmentStatus);

export default router;