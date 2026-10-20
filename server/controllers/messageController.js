import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import Startup from "../models/Startup.js";
import User from "../models/User.js";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || ""));
const messageFields = "name role profileImage";

const isParticipant = (conversation, userId) =>
	String(conversation.founderId) === String(userId) ||
	String(conversation.investorId) === String(userId);

const unreadFieldFor = (conversation, userId) =>
	String(conversation.founderId) === String(userId)
		? "founderUnreadCount"
		: "investorUnreadCount";

const serializeMessage = (message) => ({
	_id: message._id,
	conversationId: message.conversationId,
	senderId: message.senderId,
	text: message.text,
	readAt: message.readAt,
	createdAt: message.createdAt,
});

export const listConversations = async (req, res) => {
	try {
		const userId = req.authenticatedUser._id;
		const conversations = await Conversation.find({
			$or: [{ founderId: userId }, { investorId: userId }],
		})
			.sort({ latestMessageAt: -1, updatedAt: -1 })
			.populate("founderId", messageFields)
			.populate("investorId", messageFields)
			.populate("startupId", "startupName logo")
			.lean();

		return res.json(
			conversations.map((conversation) => ({
				...conversation,
				unreadCount: conversation[unreadFieldFor(conversation, userId)] || 0,
			}))
		);
	} catch (error) {
		console.error("LIST CONVERSATIONS ERROR:", error);
		return res.status(500).json({ message: "Unable to load conversations." });
	}
};

export const createOrGetConversation = async (req, res) => {
	try {
		if (req.authenticatedUser.role !== "Investor") {
			return res.status(403).json({ message: "Only investors can start a conversation." });
		}

		const { startupId } = req.body || {};
		if (!isValidObjectId(startupId)) {
			return res.status(400).json({ message: "A valid startup is required." });
		}

		const startup = await Startup.findById(startupId).select("founderId startupName");
		if (!startup) return res.status(404).json({ message: "Startup not found." });

		const founder = await User.findById(startup.founderId).select("_id role");
		if (!founder || founder.role !== "Founder") {
			return res.status(409).json({ message: "This startup does not have a valid founder." });
		}
		if (String(founder._id) === String(req.authenticatedUser._id)) {
			return res.status(400).json({ message: "You cannot message yourself." });
		}

		const filter = {
			founderId: founder._id,
			investorId: req.authenticatedUser._id,
			startupId: startup._id,
		};
		let conversation;
		try {
			conversation = await Conversation.findOneAndUpdate(
				filter,
				{ $setOnInsert: filter },
				{ new: true, upsert: true, setDefaultsOnInsert: true }
			);
		} catch (error) {
			if (error.code !== 11000) throw error;
			conversation = await Conversation.findOne(filter);
		}

		return res.status(200).json({ conversation });
	} catch (error) {
		console.error("CREATE CONVERSATION ERROR:", error);
		return res.status(500).json({ message: "Unable to start this conversation." });
	}
};

export const listMessages = async (req, res) => {
	try {
		const { conversationId } = req.params;
		if (!isValidObjectId(conversationId)) {
			return res.status(400).json({ message: "Invalid conversation ID." });
		}

		const conversation = await Conversation.findById(conversationId);
		if (!conversation) return res.status(404).json({ message: "Conversation not found." });
		if (!isParticipant(conversation, req.authenticatedUser._id)) {
			return res.status(403).json({ message: "You cannot view this conversation." });
		}

		const limitValue = Number.parseInt(req.query.limit, 10);
		const limit = Number.isFinite(limitValue) ? Math.min(Math.max(limitValue, 1), 50) : 30;
		const filter = { conversationId };
		if (req.query.before) {
			if (!isValidObjectId(req.query.before)) {
				return res.status(400).json({ message: "Invalid message cursor." });
			}
			const cursor = await Message.findOne({
				_id: req.query.before,
				conversationId,
			}).select("createdAt").lean();
			if (!cursor) return res.status(400).json({ message: "Invalid message cursor." });
			filter.$or = [
				{ createdAt: { $lt: cursor.createdAt } },
				{ createdAt: cursor.createdAt, _id: { $lt: cursor._id } },
			];
		}

		const results = await Message.find(filter)
			.sort({ createdAt: -1, _id: -1 })
			.limit(limit + 1)
			.lean();
		const hasMore = results.length > limit;
		const messages = results.slice(0, limit).reverse().map(serializeMessage);

		return res.json({ messages, hasMore });
	} catch (error) {
		console.error("LIST MESSAGES ERROR:", error);
		return res.status(500).json({ message: "Unable to load messages." });
	}
};

export const sendMessage = async (req, res) => {
	try {
		const { conversationId } = req.params;
		const { text, clientMessageId } = req.body || {};
		if (!isValidObjectId(conversationId)) {
			return res.status(400).json({ message: "Invalid conversation ID." });
		}
		if (typeof text !== "string" || !text.trim() || text.trim().length > 4000) {
			return res.status(400).json({ message: "Messages must contain 1 to 4000 characters." });
		}
		if (
			clientMessageId !== undefined &&
			(typeof clientMessageId !== "string" || !clientMessageId.trim() || clientMessageId.length > 100)
		) {
			return res.status(400).json({ message: "Invalid message request ID." });
		}

		const conversation = await Conversation.findById(conversationId);
		if (!conversation) return res.status(404).json({ message: "Conversation not found." });
		if (!isParticipant(conversation, req.authenticatedUser._id)) {
			return res.status(403).json({ message: "You cannot send messages in this conversation." });
		}
		if (!new Set(["Founder", "Investor"]).has(req.authenticatedUser.role)) {
			return res.status(403).json({ message: "Your role cannot send messages here." });
		}

		const senderId = req.authenticatedUser._id;
		if (clientMessageId) {
			const existingMessage = await Message.findOne({
				senderId,
				conversationId,
				clientMessageId,
			}).lean();
			if (existingMessage) return res.status(200).json({ message: serializeMessage(existingMessage) });
		}

		let message;
		try {
			message = await Message.create({
				conversationId,
				senderId,
				text: text.trim(),
				clientMessageId,
			});
		} catch (error) {
			if (error.code !== 11000 || !clientMessageId) throw error;
			const existingMessage = await Message.findOne({
				senderId,
				conversationId,
				clientMessageId,
			}).lean();
			if (existingMessage) return res.status(200).json({ message: serializeMessage(existingMessage) });
			throw error;
		}

		const senderIsFounder = String(senderId) === String(conversation.founderId);
		const recipientId = senderIsFounder ? conversation.investorId : conversation.founderId;
		const unreadField = senderIsFounder ? "investorUnreadCount" : "founderUnreadCount";
		await Conversation.updateOne(
			{ _id: conversation._id },
			{
				$set: { latestMessage: message.text, latestMessageAt: message.createdAt },
				$inc: { [unreadField]: 1 },
			}
		);

		try {
			const sender = await User.findById(senderId).select("name").lean();
			const startup = await Startup.findById(conversation.startupId).select("startupName").lean();
			const notificationFilter = {
				recipientId,
				type: "MESSAGE_RECEIVED",
				relatedMessageId: message._id,
			};
			await Notification.findOneAndUpdate(
				notificationFilter,
				{
					$setOnInsert: {
						title: "New message",
						message: `${sender?.name || "A participant"} sent you a message about ${startup?.startupName || "a startup"}.`,
						relatedMessageId: message._id,
						conversationId: conversation._id,
						isRead: false,
					},
				},
				{ upsert: true, setDefaultsOnInsert: true }
			);
		} catch (notificationError) {
			console.error("MESSAGE NOTIFICATION ERROR:", notificationError);
		}

		return res.status(201).json({ message: serializeMessage(message) });
	} catch (error) {
		console.error("SEND MESSAGE ERROR:", error);
		return res.status(error.name === "ValidationError" ? 400 : 500).json({
			message: error.name === "ValidationError" ? "Message is invalid." : "Unable to send message.",
		});
	}
};

export const markConversationRead = async (req, res) => {
	try {
		const { conversationId } = req.params;
		if (!isValidObjectId(conversationId)) {
			return res.status(400).json({ message: "Invalid conversation ID." });
		}

		const conversation = await Conversation.findById(conversationId);
		if (!conversation) return res.status(404).json({ message: "Conversation not found." });
		if (!isParticipant(conversation, req.authenticatedUser._id)) {
			return res.status(403).json({ message: "You cannot update this conversation." });
		}

		const userId = req.authenticatedUser._id;
		const result = await Message.updateMany(
			{ conversationId, senderId: { $ne: userId }, readAt: null },
			{ $set: { readAt: new Date() } }
		);
		const unreadField = unreadFieldFor(conversation, userId);
		await Conversation.updateOne(
			{ _id: conversationId },
			{ $set: { [unreadField]: 0 } }
		);
		await Notification.updateMany(
			{
				recipientId: userId,
				conversationId,
				type: "MESSAGE_RECEIVED",
				isRead: false,
			},
			{ $set: { isRead: true } }
		);

		return res.json({ markedRead: result.modifiedCount });
	} catch (error) {
		console.error("MARK MESSAGES READ ERROR:", error);
		return res.status(500).json({ message: "Unable to update message read status." });
	}
};

export const getUnreadMessageCount = async (req, res) => {
	try {
		const userId = req.authenticatedUser._id;
		const field = req.authenticatedUser.role === "Founder" ? "founderUnreadCount" : "investorUnreadCount";
		const result = await Conversation.aggregate([
			{ $match: { $or: [{ founderId: userId }, { investorId: userId }] } },
			{ $group: { _id: null, count: { $sum: `$${field}` } } },
		]);
		return res.json({ count: result[0]?.count || 0 });
	} catch (error) {
		console.error("UNREAD MESSAGE COUNT ERROR:", error);
		return res.status(500).json({ message: "Unable to load unread message count." });
	}
};