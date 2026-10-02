import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
	{
		recipientId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		type: {
			type: String,
			enum: [
				"INVESTMENT_REQUEST",
				"INVESTMENT_ACCEPTED",
				"INVESTMENT_REJECTED",
				"MENTOR_REQUEST",
				"MENTOR_ACCEPTED",
				"MENTOR_REJECTED",
				"MENTOR_CANCELLED",
			],
			required: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
		},
		message: {
			type: String,
			required: true,
			trim: true,
		},
		relatedId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Investment",
		},
		isRead: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

notificationSchema.index(
	{ recipientId: 1, type: 1, relatedId: 1 },
	{
		unique: true,
		partialFilterExpression: { relatedId: { $type: "objectId" } },
	}
);

export default mongoose.model("Notification", notificationSchema);