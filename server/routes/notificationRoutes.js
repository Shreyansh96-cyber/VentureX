import express from "express";
import {
	createNotification,
	getNotificationsByUser,
	markAllNotificationsAsRead,
	markNotificationAsRead,
} from "../controllers/notificationController.js";
import { requireAuthenticatedUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", requireAuthenticatedUser, createNotification);
router.get("/:userId", requireAuthenticatedUser, getNotificationsByUser);
router.put("/:userId/read-all", requireAuthenticatedUser, markAllNotificationsAsRead);
router.put("/:id/read", requireAuthenticatedUser, markNotificationAsRead);

export default router;