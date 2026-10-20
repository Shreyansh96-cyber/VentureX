import mongoose from "mongoose";
import MentorSession from "../models/MentorSession.js";
import User from "../models/User.js";
import { generateZegoToken04 } from "../utils/zegoToken.js";

const TOKEN_LIFETIME_SECONDS = 60 * 60;

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || ""));

export const createMentorMeetingToken = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid mentoring session ID." });
  }

  try {
    const session = await MentorSession.findById(id).select(
      "mentorId requesterId topic requestedDate requestedTime status"
    );

    if (!session) {
      return res.status(404).json({ message: "Mentoring session not found." });
    }

    const currentUserId = String(req.authenticatedUser._id);
    const mentorId = String(session.mentorId);
    const requesterId = String(session.requesterId);
    if (mentorId === requesterId) {
      return res.status(409).json({ message: "This mentoring session has invalid participants." });
    }

    const isMentor = currentUserId === mentorId;
    const isRequester = currentUserId === requesterId;

    if ((!isMentor && !isRequester) || (isMentor && req.authenticatedUser.role !== "Mentor")) {
      return res.status(403).json({ message: "You are not authorized to join this mentoring session." });
    }

    if (session.status !== "Accepted") {
      return res.status(409).json({ message: "Only accepted mentoring sessions can be joined." });
    }

    const scheduledDate = new Date(session.requestedDate);
    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(409).json({ message: "This mentoring session has an invalid schedule." });
    }
    scheduledDate.setUTCHours(0, 0, 0, 0);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (scheduledDate < today) {
      return res.status(410).json({ message: "This mentoring session has expired." });
    }

    const appId = Number(process.env.ZEGO_APP_ID);
    const secret = process.env.ZEGO_SERVER_SECRET;
    if (!Number.isSafeInteger(appId) || appId <= 0 || !secret || Buffer.byteLength(secret, "utf8") !== 32) {
      return res.status(503).json({
        message: "Video meetings are not configured yet. Please contact VentureX support.",
      });
    }

    const user = await User.findById(currentUserId).select("_id role name");
    if (!user || user.role !== req.authenticatedUser.role) {
      return res.status(401).json({ message: "Your account could not be verified. Please sign in again." });
    }
    if (isMentor && user.role !== "Mentor") {
      return res.status(403).json({ message: "Mentor access is required to join as the session mentor." });
    }

    const roomId = String(session._id);
    const token = generateZegoToken04({
      appId,
      userId: String(user._id),
      secret,
      expiresInSeconds: TOKEN_LIFETIME_SECONDS,
      payload: JSON.stringify({
        room_id: roomId,
        privilege: { 1: 1, 2: 1 },
        stream_id_list: null,
      }),
    });

    const otherParticipantId = isMentor ? requesterId : mentorId;
    const otherParticipant = await User.findById(otherParticipantId).select("name role");

    return res.json({
      appId,
      token,
      roomId,
      userId: String(user._id),
      userName: user.name,
      session: {
        topic: session.topic,
        otherParticipantName: otherParticipant?.name || "Session participant",
        otherParticipantRole: otherParticipant?.role || "Participant",
      },
    });
  } catch {
    return res.status(500).json({ message: "Unable to prepare the mentoring meeting. Please try again." });
  }
};