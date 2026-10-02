import mongoose from "mongoose";
import User from "../models/User.js";

export const getAllMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: "Mentor" })
      .select(
        "_id name role profileImage expertise bio experience skills location availability"
      )
      .sort({ createdAt: -1 });

    return res.json(mentors);
  } catch (error) {
    console.error("GET ALL MENTORS ERROR:", error);
    return res.status(500).json({ message: "Unable to load mentors." });
  }
};

export const getMentorById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid mentor ID." });
    }

    const mentor = await User.findOne({ _id: id, role: "Mentor" }).select(
      "_id name role profileImage expertise bio experience skills location availability"
    );

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found." });
    }

    return res.json(mentor);
  } catch (error) {
    console.error("GET MENTOR BY ID ERROR:", error);
    return res.status(500).json({ message: "Unable to load mentor profile." });
  }
};
