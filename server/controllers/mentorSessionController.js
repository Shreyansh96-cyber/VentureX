import mongoose from "mongoose";
import MentorSession from "../models/MentorSession.js";
import Startup from "../models/Startup.js";
import User from "../models/User.js";
import { createMentorSessionNotification } from "../utils/notificationService.js";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || ""));

const normalizeStatusValue = (value) => {
  if (typeof value !== "string") return value;

  const trimmedValue = value.trim();
  if (!trimmedValue) return trimmedValue;

  const capitalizedStatus = {
    pending: "Pending",
    accepted: "Accepted",
    rejected: "Rejected",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return capitalizedStatus[trimmedValue.toLowerCase()] || trimmedValue;
};

const populateSession = (query) =>
  query
    .populate({
      path: "mentorId",
      select: "_id name role profileImage expertise bio experience skills location availability",
    })
    .populate({
      path: "requesterId",
      select: "_id name role profileImage",
    })
    .populate({
      path: "startupId",
      select: "_id startupName founderId",
    })
    .sort({ requestedDate: 1, requestedTime: 1, createdAt: -1 });

export const getSessionsForMentor = async (req, res) => {
  try {
    if (req.authenticatedUser.role !== "Mentor") {
      return res.status(403).json({ message: "Mentor access is required." });
    }

    const { mentorId } = req.params;

    if (!isValidObjectId(mentorId)) {
      return res.status(400).json({ message: "Invalid mentor ID." });
    }

    if (String(req.authenticatedUser._id) !== String(mentorId)) {
      return res.status(403).json({ message: "You can only view your own mentoring sessions." });
    }

    const sessions = await populateSession(
      MentorSession.find({ mentorId }).lean()
    );

    return res.json(sessions);
  } catch (error) {
    console.error("GET SESSIONS FOR MENTOR ERROR:", error);
    return res.status(500).json({ message: "Unable to load mentor sessions." });
  }
};

export const getSessionsForRequester = async (req, res) => {
  try {
    const { requesterId } = req.params;

    if (!isValidObjectId(requesterId)) {
      return res.status(400).json({ message: "Invalid requester ID." });
    }

    if (String(req.authenticatedUser._id) !== String(requesterId)) {
      return res.status(403).json({ message: "You can only view your own mentoring sessions." });
    }

    const sessions = await populateSession(
      MentorSession.find({ requesterId }).lean()
    );

    return res.json(sessions);
  } catch (error) {
    console.error("GET SESSIONS FOR REQUESTER ERROR:", error);
    return res.status(500).json({ message: "Unable to load your mentoring sessions." });
  }
};

export const createMentorSession = async (req, res) => {
  let failureStage = "validate-request";

  try {
    const requesterId = req.authenticatedUser._id;
    const {
      mentorId,
      startupId,
      topic,
      message,
      requestedDate,
      requestedTime,
    } = req.body;

    if (!mentorId || !isValidObjectId(mentorId)) {
      return res.status(400).json({ message: "Please select a mentor." });
    }

    if (!topic || !String(topic).trim()) {
      return res.status(400).json({ message: "Topic is required." });
    }

    if (!requestedDate) {
      return res.status(400).json({ message: "Preferred date is required." });
    }

    if (!requestedTime || !String(requestedTime).trim()) {
      return res.status(400).json({ message: "Preferred time is required." });
    }

    if (String(requesterId) === String(mentorId)) {
      return res.status(400).json({ message: "You cannot request a session with yourself." });
    }

    failureStage = "find-mentor";
    const mentor = await User.findById(mentorId).select("_id role name");

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found." });
    }

    if (mentor.role !== "Mentor") {
      return res.status(400).json({ message: "Selected user is not a mentor." });
    }

    failureStage = "find-requester";
    const requester = await User.findById(requesterId).select("_id role name");

    if (!requester) {
      return res.status(404).json({ message: "Requester account not found." });
    }

    let linkedStartupId = null;
    if (startupId) {
      if (!isValidObjectId(startupId)) {
        return res.status(400).json({ message: "Invalid startup ID." });
      }

      if (requester.role !== "Founder") {
        return res.status(403).json({ message: "Only founders can attach their startups to a session." });
      }

      failureStage = "find-startup";
      const startup = await Startup.findOne({
        _id: startupId,
        founderId: requesterId,
      }).select("_id");

      if (!startup) {
        return res.status(404).json({ message: "Startup not found." });
      }

      linkedStartupId = startup._id;
    }

    const dateParts = typeof requestedDate === "string"
      ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(requestedDate)
      : null;
    const normalizedDate = dateParts
      ? new Date(Date.UTC(Number(dateParts[1]), Number(dateParts[2]) - 1, Number(dateParts[3])))
      : new Date(Number.NaN);

    if (
      Number.isNaN(normalizedDate.getTime()) ||
      normalizedDate.toISOString().slice(0, 10) !== requestedDate
    ) {
      return res.status(400).json({ message: "Preferred date is invalid." });
    }

    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(String(requestedTime).trim())) {
      return res.status(400).json({ message: "Preferred time must use 24-hour HH:mm format." });
    }

    if (String(topic).trim().length > 160 || String(requestedTime).trim().length > 80) {
      return res.status(400).json({ message: "Session details are too long." });
    }

    if (message !== undefined && (typeof message !== "string" || message.length > 2000)) {
      return res.status(400).json({ message: "Session message must be 2,000 characters or fewer." });
    }

    failureStage = "check-duplicate-request";
    const duplicate = await MentorSession.findOne({
      mentorId,
      requesterId,
      requestedDate: {
        $gte: normalizedDate,
        $lt: new Date(normalizedDate.getTime() + 24 * 60 * 60 * 1000),
      },
      requestedTime: String(requestedTime).trim(),
      status: "Pending",
    });

    if (duplicate) {
      return res.status(409).json({
        message: "A similar pending mentoring session already exists for this mentor, date, and time.",
      });
    }

    failureStage = "save-session";
    const session = await MentorSession.create({
      mentorId,
      requesterId,
      startupId: linkedStartupId,
      topic: String(topic).trim(),
      message: message ? String(message).trim() : "",
      requestedDate: normalizedDate,
      requestedTime: String(requestedTime).trim(),
      status: "Pending",
    });

    failureStage = "populate-session";
    const fullSession = await populateSession(MentorSession.findById(session._id)).exec();

    // The session is already persisted at this point. A notification failure
    // must not make the client believe the request failed (and encourage a
    // retry that will then be rejected as a duplicate).
    try {
      await createMentorSessionNotification({
        type: "MENTOR_REQUEST",
        session: fullSession,
        mentor,
        requester,
      });
    } catch (notificationError) {
      console.error("MENTOR SESSION REQUEST NOTIFICATION ERROR:", {
        name: notificationError.name || "Error",
        code: typeof notificationError.code === "number" || typeof notificationError.code === "string"
          ? notificationError.code
          : undefined,
        message: notificationError.message || "Unknown notification error.",
      });
    }

    failureStage = "return-response";
    return res.status(201).json({
      message: "Mentoring session request sent successfully.",
      session: fullSession,
    });
  } catch (error) {
    console.error("CREATE MENTOR SESSION ERROR:", error);
    console.error("ERROR MESSAGE:", error.message);
    console.error("ERROR STACK:", error.stack);
    return res.status(500).json({
      message: process.env.NODE_ENV !== "production"
        ? "Failed to create mentor session"
        : "Unable to create mentoring session request.",
      ...(process.env.NODE_ENV !== "production"
        ? { error: error.message || "Unknown server error.", stage: failureStage }
        : {}),
    });
  }
};

export const updateMentorSessionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const normalizedStatus = normalizeStatusValue(status);
    const currentUserId = req.authenticatedUser._id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid session ID." });
    }

    const validStatuses = ["Pending", "Accepted", "Rejected", "Completed", "Cancelled"];

    if (!normalizedStatus || !validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ message: "Invalid session status." });
    }

    let session = await MentorSession.findById(id);

    if (!session) {
      return res.status(404).json({ message: "Mentoring session not found." });
    }

    const isMentor = String(session.mentorId) === String(currentUserId);
    const isRequester = String(session.requesterId) === String(currentUserId);

    if (!isMentor && !isRequester) {
      return res.status(403).json({ message: "You cannot modify this session." });
    }

    if (isMentor && isRequester) {
      return res.status(403).json({ message: "Session participants are invalid." });
    }

    if (isMentor) {
      if (req.authenticatedUser.role !== "Mentor") {
        return res.status(403).json({ message: "Mentor access is required." });
      }

      const validMentorTransition =
        (session.status === "Pending" && ["Accepted", "Rejected"].includes(normalizedStatus)) ||
        (session.status === "Accepted" && normalizedStatus === "Completed");

      if (!validMentorTransition) {
        return res.status(409).json({ message: "This session cannot transition to that status." });
      }
    } else {
      if (normalizedStatus !== "Cancelled" || !["Pending", "Accepted"].includes(session.status)) {
        return res.status(409).json({ message: "This session cannot be cancelled in its current state." });
      }
    }

    const updatedSessionRecord = await MentorSession.findOneAndUpdate(
      { _id: id, status: session.status },
      { $set: { status: normalizedStatus } },
      { new: true, runValidators: true }
    );

    if (!updatedSessionRecord) {
      return res.status(409).json({
        message: "The session changed before your update could be saved.",
      });
    }

    session = updatedSessionRecord;

    try {
      const mentor = await User.findById(session.mentorId).select("_id name");
      const requester = await User.findById(session.requesterId).select("_id name");
      const notificationType = {
        Accepted: "MENTOR_ACCEPTED",
        Rejected: "MENTOR_REJECTED",
        Cancelled: "MENTOR_CANCELLED",
      }[normalizedStatus];

      if (notificationType) {
        await createMentorSessionNotification({
          type: notificationType,
          session,
          mentor,
          requester,
        });
      }
    } catch (notificationError) {
      console.error("MENTOR SESSION STATUS NOTIFICATION ERROR:", {
        name: notificationError.name || "Error",
        code: typeof notificationError.code === "number" || typeof notificationError.code === "string"
          ? notificationError.code
          : undefined,
      });
    }

    const updatedSession = await populateSession(MentorSession.findById(session._id));

    return res.json({
      message: `Session status updated to ${normalizedStatus}.`,
      session: updatedSession,
    });
  } catch (error) {
    console.error("UPDATE MENTOR SESSION STATUS ERROR:", error);
    return res.status(500).json({ message: "Unable to update mentoring session status." });
  }
};
