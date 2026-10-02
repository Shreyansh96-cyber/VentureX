import mongoose from "mongoose";

const mentorSessionSchema = new mongoose.Schema(
  {
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Startup",
      default: null,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    requestedDate: {
      type: Date,
      required: true,
    },
    requestedTime: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

mentorSessionSchema.index({ mentorId: 1, requesterId: 1, requestedDate: 1, requestedTime: 1, status: 1 });

export default mongoose.model("MentorSession", mentorSessionSchema);
