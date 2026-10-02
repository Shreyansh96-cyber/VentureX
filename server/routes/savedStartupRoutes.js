import express from "express";

import {
  saveStartup,
  getSavedStartups,
  removeSavedStartup,
  checkSavedStartup,
} from "../controllers/savedStartupController.js";
import { requireAuthenticatedUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/check/:userId/:startupId", requireAuthenticatedUser, checkSavedStartup);
router.get("/user/:userId", requireAuthenticatedUser, getSavedStartups);
router.get("/", requireAuthenticatedUser, getSavedStartups);

router.post("/", requireAuthenticatedUser, saveStartup);

router.delete("/check/:userId/:startupId", requireAuthenticatedUser, removeSavedStartup);
router.delete("/:startupId", requireAuthenticatedUser, removeSavedStartup);
router.delete("/", requireAuthenticatedUser, removeSavedStartup);

export default router;