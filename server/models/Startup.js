import mongoose from "mongoose";

const startupSchema = new mongoose.Schema(
  {
    founderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    startupName: {
      type: String,
      required: true,
      trim: true,
    },

    tagline: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    industry: {
      type: String,
      required: true,
    },

    stage: {
      type: String,
      enum: ["Idea", "MVP", "Seed", "Series A"],
      default: "Idea",
    },

    fundingGoal: {
      type: Number,
      required: true,
    },

    website: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      required: true,
    },

    logo: {
      type: String,
      default: "",
    },

    teamSize: {
      type: Number,
      default: 1,
    },

    foundedYear: {
      type: Number,
      default: new Date().getFullYear(),
    },

    status: {
      type: String,
      enum: ["Active", "Closed"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

const Startup = mongoose.model("Startup", startupSchema);

export default Startup;