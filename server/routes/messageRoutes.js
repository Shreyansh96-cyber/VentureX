import express from "express";
import {
	createOrGetConversation,
	getUnreadMessageCount,
	listConversations,
	listMessages,
	markConversationRead,
	sendMessage,
} from "../controllers/messageController.js";
import { requireAuthenticatedUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuthenticatedUser);
router.get("/unread-count", getUnreadMessageCount);
router.get("/", listConversations);
router.post("/", createOrGetConversation);
router.get("/:conversationId/messages", listMessages);
router.post("/:conversationId/messages", sendMessage);
router.put("/:conversationId/read", markConversationRead);

export default router;