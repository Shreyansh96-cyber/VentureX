import User from "../models/User.js";

export const getAllInvestors = async (req, res) => {
  try {
    const investors = await User.find({ role: "Investor", emailVerified: { $ne: false } })
      .select("_id name role profileImage expertise bio experience skills location availability")
      .sort({ createdAt: -1 });

    return res.json(investors);
  } catch (error) {
    console.error("GET ALL INVESTORS ERROR:", error);
    return res.status(500).json({ message: "Unable to load investors." });
  }
};
