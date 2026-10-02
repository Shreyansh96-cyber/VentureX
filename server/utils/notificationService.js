import Notification from "../models/Notification.js";
import Startup from "../models/Startup.js";
import User from "../models/User.js";

const formatAmount = (amount) =>
	`₹${Number(amount || 0).toLocaleString("en-IN")}`;

export const createInvestmentNotification = async ({ type, investment }) => {
	const startup = await Startup.findById(investment.startupId).select(
		"startupName founderId"
	);

	if (!startup) {
		throw new Error("Startup not found for investment notification.");
	}

	const investor = await User.findById(investment.investorId).select("name");

	if (!investor) {
		throw new Error("Investor not found for investment notification.");
	}

	const startupName = startup.startupName || "The startup";
	const amount = formatAmount(investment.amount);
	let notification;

	if (type === "INVESTMENT_REQUEST") {
		notification = {
			recipientId: startup.founderId,
			title: "New Investment Request",
			message: `${investor.name || "An investor"} has requested to invest ${amount} in ${startupName}.`,
		};
	} else if (type === "INVESTMENT_ACCEPTED") {
		notification = {
			recipientId: investment.investorId,
			title: "Investment Accepted",
			message: `${startupName} has accepted your investment request of ${amount}.`,
		};
	} else if (type === "INVESTMENT_REJECTED") {
		notification = {
			recipientId: investment.investorId,
			title: "Investment Rejected",
			message: `${startupName} has rejected your investment request of ${amount}.`,
		};
	} else {
		throw new Error("Invalid investment notification type.");
	}

	const filter = {
		recipientId: notification.recipientId,
		type,
		relatedId: investment._id,
	};

	try {
		return await Notification.findOneAndUpdate(
			filter,
			{
				$setOnInsert: {
					...notification,
					type,
					relatedId: investment._id,
					isRead: false,
				},
			},
			{ new: true, upsert: true, setDefaultsOnInsert: true }
		);
	} catch (error) {
		if (error.code === 11000) {
			return Notification.findOne(filter);
		}
		throw error;
	}
};

export const createMentorSessionNotification = async ({ type, session, mentor, requester }) => {
	let recipientId = null;
	let title = "";
	let message = "";

	if (type === "MENTOR_REQUEST") {
		recipientId = mentor._id;
		title = "New Mentoring Request";
		message = `${requester.name || "A user"} has requested a mentoring session about ${session.topic}.`;
	} else if (type === "MENTOR_ACCEPTED") {
		recipientId = requester._id;
		title = "Mentoring Session Accepted";
		message = `${mentor.name || "Your mentor"} accepted your mentoring session request.`;
	} else if (type === "MENTOR_REJECTED") {
		recipientId = requester._id;
		title = "Mentoring Session Rejected";
		message = `${mentor.name || "Your mentor"} rejected your mentoring session request.`;
	} else if (type === "MENTOR_CANCELLED") {
		recipientId = mentor._id;
		title = "Mentoring Session Cancelled";
		message = `${requester.name || "A user"} cancelled a mentoring session about ${session.topic}.`;
	} else {
		throw new Error("Invalid mentor notification type.");
	}

	const filter = {
		recipientId,
		type,
		relatedId: session._id,
	};

	try {
		return await Notification.findOneAndUpdate(
			filter,
			{
				$setOnInsert: {
					recipientId,
					title,
					message,
					type,
					relatedId: session._id,
					isRead: false,
				},
			},
			{ new: true, upsert: true, setDefaultsOnInsert: true }
		);
	} catch (error) {
		if (error.code === 11000) {
			return Notification.findOne(filter);
		}
		throw error;
	}
};