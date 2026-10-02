import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: false,
    },

    role: {
      type: String,
      enum: ["Founder", "Investor", "Mentor"],
      default: "Founder",
    },

    profileImage: {
      type: String,
      default: "",
    },

    googleId: {
      type: String,
      default: "",
    },

    expertise: {
      type: String,
      default: "General Mentorship",
    },

    bio: {
      type: String,
      default: "",
    },

    website: {
      type: String,
      default: "",
      trim: true,
    },

    industries: {
      type: [String],
      default: [],
    },

    investmentInterests: {
      type: [String],
      default: [],
    },

    experience: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    location: {
      type: String,
      default: "Remote",
    },

    availability: {
      type: String,
      default: "Flexible",
    },

    otp:{
      type:String
    },

    otpExpiry:{
      type:Date
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
},
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);