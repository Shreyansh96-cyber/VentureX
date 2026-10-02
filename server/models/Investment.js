import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema(
  {
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

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    message: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Rejected",
        "pending",
        "accepted",
        "rejected",
      ],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Investment = mongoose.model(
  "Investment",
  investmentSchema
);

export default Investment;