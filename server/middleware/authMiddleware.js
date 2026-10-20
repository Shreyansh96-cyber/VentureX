import jwt from "jsonwebtoken";
import User from "../models/User.js";

const getAuthenticatedUser = async (req, res) => {
	const authorization = req.headers.authorization || "";
	const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];

	if (!token) {
		res.status(401).json({ message: "Authentication is required." });
		return null;
	}

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		const userId = payload.id || payload.userId || payload._id;
		const user = await User.findById(userId).select("_id role +accountDeletionInProgress");

		if (!user) {
			res.status(401).json({ message: "User account was not found." });
			return null;
		}

		const isProfileRecoveryRequest =
			req.baseUrl === "/api/profile" &&
			((req.method === "GET" && req.path === "/me") ||
				(req.method === "DELETE" && req.path === "/me"));
		if (user.accountDeletionInProgress && !isProfileRecoveryRequest) {
			res.status(423).json({
				message: "Account deletion is in progress. Retry deletion from your profile settings.",
			});
			return null;
		}

		return user;
	} catch {
		res.status(401).json({ message: "Invalid or expired token." });
		return null;
	}
};

export const requireAuthenticatedUser = async (req, res, next) => {
	const user = await getAuthenticatedUser(req, res);

	if (!user) return;

	req.authenticatedUser = user;
	return next();
};

export const requireFounderAuth = async (req, res, next) => {
	const user = await getAuthenticatedUser(req, res);

	if (!user) return;

	if (user.role !== "Founder") {
		return res.status(403).json({ message: "Founder access is required." });
	}

	req.authenticatedUser = user;
	return next();
};

export const requireMentorAuth = async (req, res, next) => {
	const user = await getAuthenticatedUser(req, res);

	if (!user) return;

	if (user.role !== "Mentor") {
		return res.status(403).json({ message: "Mentor access is required." });
	}

	req.authenticatedUser = user;
	return next();
};
