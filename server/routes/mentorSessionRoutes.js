import express from "express";
import {
  createMentorSession,
  getSessionsForMentor,
  getSessionsForRequester,
  updateMentorSessionStatus,
} from "../controllers/mentorSessionController.js";
import { createMentorMeetingToken } from "../controllers/mentorMeetingController.js";
import {
  requireAuthenticatedUser,
  requireMentorAuth,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/mentor/:mentorId", requireMentorAuth, getSessionsForMentor);
router.get("/requester/:requesterId", requireAuthenticatedUser, getSessionsForRequester);
router.post("/", requireAuthenticatedUser, createMentorSession);
router.post("/:id/meeting-token", requireAuthenticatedUser, createMentorMeetingToken);
router.put("/:id/status", requireAuthenticatedUser, updateMentorSessionStatus);

export default router;
