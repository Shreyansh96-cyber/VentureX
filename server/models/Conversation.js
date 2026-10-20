import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
	{
		founderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		required: true,
		},
		investorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		startupId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Startup",
			required: true,
		},
		latestMessage: {
			type: String,
			default: "",
			maxlength: 4000,
		},
		latestMessageAt: {
			type: Date,
			default: null,
		},
		founderUnreadCount: {
			type: Number,
			default: 0,
			min: 0,
		},
		investorUnreadCount: {
			type: Number,
			default: 0,
			min: 0,
		},
	},
	{ timestamps: true }
);

conversationSchema.index(
	{ founderId: 1, investorId: 1, startupId: 1 },
	{ unique: true }
);
conversationSchema.index({ founderId: 1, latestMessageAt: -1 });
conversationSchema.index({ investorId: 1, latestMessageAt: -1 });

export default mongoose.model("Conversation", conversationSchema);