import express from "express";

import {
  createStartup,
  getAllStartups,
  getStartupById,
  updateStartup,
  deleteStartup,
} from "../controllers/startupController.js";
import { requireFounderAuth } from "../middleware/authMiddleware.js";

const router = express.Router();


// Create Startup
router.post("/", requireFounderAuth, createStartup);

// Get All Startups
router.get("/", getAllStartups);

// Get Startup By ID
router.get("/:id", getStartupById);

// Update Startup
router.put("/:id", requireFounderAuth, updateStartup);

// Delete Startup
router.delete("/:id", requireFounderAuth, deleteStartup);

export default router;