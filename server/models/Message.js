import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		conversationId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Conversation",
			required: true,
		},
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		text: {
			type: String,
			required: true,
			trim: true,
			minlength: 1,
			maxlength: 4000,
		},
		readAt: {
			type: Date,
			default: null,
		},
		clientMessageId: {
			type: String,
			maxlength: 100,
		},
	},
	{ timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1, _id: -1 });
messageSchema.index({ conversationId: 1, senderId: 1, readAt: 1 });
messageSchema.index(
	{ senderId: 1, conversationId: 1, clientMessageId: 1 },
	{
		unique: true,
		partialFilterExpression: { clientMessageId: { $type: "string" } },
	}
);

export default mongoose.model("Message", messageSchema);