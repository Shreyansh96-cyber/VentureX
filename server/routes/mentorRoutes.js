import express from "express";
import { getAllMentors, getMentorById } from "../controllers/mentorController.js";

const router = express.Router();

router.get("/", getAllMentors);
router.get("/:id", getMentorById);

export default router;
