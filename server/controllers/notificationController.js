import mongoose from "mongoose";
import Investment from "../models/Investment.js";
import Notification from "../models/Notification.js";
import Startup from "../models/Startup.js";
import { createInvestmentNotification } from "../utils/notificationService.js";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || ""));

const notificationTypes = new Set([
	"INVESTMENT_REQUEST",
	"INVESTMENT_ACCEPTED",
	"INVESTMENT_REJECTED",
]);

export const createNotification = async (req, res) => {
	try {
		const { type, relatedId } = req.body;

		if (!notificationTypes.has(type)) {
			return res.status(400).json({ message: "Invalid notification type." });
		}

		if (!relatedId || !isValidObjectId(relatedId)) {
			return res.status(400).json({ message: "Invalid relatedId." });
		}

		const investment = await Investment.findById(relatedId);

		if (!investment) {
			return res.status(404).json({ message: "Investment request not found." });
		}

		const startup = await Startup.findById(investment.startupId).select("founderId");

		if (!startup) {
			return res.status(404).json({ message: "Startup not found." });
		}

		const authenticatedUserId = String(req.authenticatedUser._id);

		if (type === "INVESTMENT_REQUEST") {
			if (
				req.authenticatedUser.role !== "Investor" ||
				String(investment.investorId) !== authenticatedUserId ||
				String(investment.status).toLowerCase() !== "pending"
			) {
				return res.status(403).json({ message: "You cannot create this notification." });
			}
		} else {
			const expectedStatus = type === "INVESTMENT_ACCEPTED" ? "accepted" : "rejected";

			if (
				req.authenticatedUser.role !== "Founder" ||
				String(startup.founderId) !== authenticatedUserId ||
				String(investment.status).toLowerCase() !== expectedStatus
			) {
				return res.status(403).json({ message: "You cannot create this notification." });
			}
		}

		const notification = await createInvestmentNotification({ type, investment });
		return res.status(201).json(notification);
	} catch (error) {
		console.error("CREATE NOTIFICATION ERROR:", error);
		return res.status(500).json({ message: "Unable to create notification." });
	}
};

export const getNotificationsByUser = async (req, res) => {
	try {
		const { userId } = req.params;

		if (!isValidObjectId(userId)) {
			return res.status(400).json({ message: "Invalid userId." });
		}

		if (String(req.authenticatedUser._id) !== String(userId)) {
			return res.status(403).json({ message: "You can only view your own notifications." });
		}

		const notifications = await Notification.find({ recipientId: userId })
			.sort({ createdAt: -1 });

		return res.json(notifications);
	} catch (error) {
		console.error("GET NOTIFICATIONS ERROR:", error);
		return res.status(500).json({ message: "Unable to load notifications." });
	}
};

export const markNotificationAsRead = async (req, res) => {
	try {
		const { id } = req.params;

		if (!isValidObjectId(id)) {
			return res.status(400).json({ message: "Invalid notification ID." });
		}

		const notification = await Notification.findOneAndUpdate(
			{ _id: id, recipientId: req.authenticatedUser._id },
			{ $set: { isRead: true } },
			{ new: true }
		);

		if (!notification) {
			return res.status(404).json({ message: "Notification not found." });
		}

		return res.json(notification);
	} catch (error) {
		console.error("MARK NOTIFICATION READ ERROR:", error);
		return res.status(500).json({ message: "Unable to update notification." });
	}
};

export const markAllNotificationsAsRead = async (req, res) => {
	try {
		const { userId } = req.params;

		if (!isValidObjectId(userId)) {
			return res.status(400).json({ message: "Invalid userId." });
		}

		if (String(req.authenticatedUser._id) !== String(userId)) {
			return res.status(403).json({ message: "You can only update your own notifications." });
		}

		await Notification.updateMany(
			{ recipientId: userId, isRead: false },
			{ $set: { isRead: true } }
		);

		return res.json({ message: "All notifications marked as read." });
	} catch (error) {
		console.error("MARK ALL NOTIFICATIONS READ ERROR:", error);
		return res.status(500).json({ message: "Unable to update notifications." });
	}
};