import mongoose from "mongoose";

const savedStartupSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Startup",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

savedStartupSchema.index(
  { userId: 1, startupId: 1 },
  { unique: true }
);

savedStartupSchema.index(
  { investorId: 1, startupId: 1 },
  { unique: true, sparse: true }
);

const SavedStartup = mongoose.model(
  "SavedStartup",
  savedStartupSchema
);

export default SavedStartup;