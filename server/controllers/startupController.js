import mongoose from "mongoose";
import Startup from "../models/Startup.js";

const editableFields = [
  "startupName",
  "tagline",
  "description",
  "industry",
  "stage",
  "fundingGoal",
  "website",
  "location",
  "logo",
  "teamSize",
  "foundedYear",
  "status",
];

const pickStartupFields = (body = {}) => {
  body = body || {};
  const fields = Object.fromEntries(
    editableFields
      .filter((field) => Object.hasOwn(body, field))
      .map((field) => [field, body[field]])
  );
  const textFields = ["startupName", "tagline", "description", "industry", "website", "location", "logo", "stage", "status"];

  if (textFields.some((field) => Object.hasOwn(fields, field) && typeof fields[field] !== "string")) {
    return null;
  }

  if (Object.hasOwn(fields, "website")) {
    const website = fields.website.trim();
    if (!website) {
      fields.website = "";
    } else {
      try {
        const url = new URL(/^https?:\/\//i.test(website) ? website : `https://${website}`);
        if (!["http:", "https:"].includes(url.protocol)) return null;
        fields.website = url.toString();
      } catch {
        return null;
      }
    }
  }

  for (const field of ["fundingGoal", "teamSize", "foundedYear"]) {
    if (Object.hasOwn(fields, field)) {
      const value = Number(fields[field]);
      if (!Number.isFinite(value) || value <= 0) return null;
      fields[field] = value;
    }
  }

  return fields;
};

const isInvalidInputError = (error) =>
  error.name === "ValidationError" || error.name === "CastError";

const validateFundingGoal = (fields) => {
  if (!Object.hasOwn(fields, "fundingGoal")) return true;
  const value = Number(fields.fundingGoal);
  return Number.isFinite(value) && value > 0;
};

// ==============================
// Create Startup
// ==============================
export const createStartup = async (req, res) => {
  try {
    const fields = pickStartupFields(req.body);

    if (!fields || !validateFundingGoal(fields)) {
      return res.status(400).json({
        success: false,
        message: "Startup fields or funding goal are invalid.",
      });
    }

    const startup = await Startup.create({
      ...fields,
      founderId: req.authenticatedUser._id,
    });

    return res.status(201).json({
      success: true,
      message: "Startup created successfully",
      startup,
    });
  } catch (error) {
    console.error("CREATE STARTUP ERROR:", error);
    return res.status(isInvalidInputError(error) ? 400 : 500).json({
      success: false,
      message: isInvalidInputError(error)
        ? "Startup details are invalid."
        : "Unable to create startup.",
    });
  }
};


// ==============================
// Get All Startups
// ==============================
export const getAllStartups = async (req, res) => {
  try {

    const startups = await Startup.find().sort({ createdAt: -1 }).lean();

    return res.status(200).json(startups);

  } catch {

    return res.status(500).json({
      success: false,
      message: "Unable to load startups.",
    });

  }
};


// ==============================
// Get Startup By ID
// ==============================
export const getStartupById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid startup ID.",
      });
    }

    const startup = await Startup.findById(id).lean();

    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found",
      });
    }

    return res.status(200).json({
      success: true,
      startup: startup,
    });
  } catch (error) {
    console.error("GET STARTUP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load startup.",
    });
  }
};


// ==============================
// Update Startup
// ==============================
export const updateStartup = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid startup ID.",
      });
    }

    if (Object.hasOwn(req.body || {}, "founderId")) {
      return res.status(400).json({
        success: false,
        message: "Startup ownership cannot be changed.",
      });
    }

    const fields = pickStartupFields(req.body);

    if (!fields || Object.keys(fields).length === 0 || !validateFundingGoal(fields)) {
      return res.status(400).json({
        success: false,
        message: "Provide valid startup fields to update.",
      });
    }

    const startup = await Startup.findOneAndUpdate(
      { _id: id, founderId: req.authenticatedUser._id },
      { $set: fields },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found.",
      });
    }

    return res.status(200).json(startup);
  } catch (error) {
    console.error("UPDATE STARTUP ERROR:", error);
    return res.status(isInvalidInputError(error) ? 400 : 500).json({
      success: false,
      message: isInvalidInputError(error)
        ? "Startup details are invalid."
        : "Unable to update startup.",
    });
  }
};


// ==============================
// Delete Startup
// ==============================
export const deleteStartup = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid startup ID.",
      });
    }

    const startup = await Startup.findOneAndDelete({
      _id: id,
      founderId: req.authenticatedUser._id,
    });

    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Startup deleted successfully",
    });
  } catch (error) {
    console.error("DELETE STARTUP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete startup.",
    });
  }
};