import express from "express";
import {
	getFounderDashboardStats,
	getFounderFundingAnalytics,
} from "../controllers/dashboardController.js";
import { requireFounderAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/founder/stats", requireFounderAuth, getFounderDashboardStats);
router.get("/founder/funding-analytics", requireFounderAuth, getFounderFundingAnalytics);

export default router;