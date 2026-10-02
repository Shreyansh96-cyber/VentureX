import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBell, FaCheck } from "react-icons/fa";
import {
	getNotifications,
	markAllNotificationsAsRead,
	markNotificationAsRead,
} from "../../api/notification";
import "./Notifications.css";

const getStoredUser = () => {
	try {
		return JSON.parse(localStorage.getItem("user") || "null");
	} catch {
		return null;
	}
};

const notificationDestination = (notification) => {
	if (notification.type === "INVESTMENT_REQUEST") return "/dashboard#investment-requests";
	if (
		notification.type === "INVESTMENT_ACCEPTED" ||
		notification.type === "INVESTMENT_REJECTED"
	) {
		return "/investments";
	}
	return "/notifications";
};

const formatDate = (value) => {
	const date = new Date(value);
	return Number.isNaN(date.getTime())
		? "Date unavailable"
		: date.toLocaleString("en-IN", {
				dateStyle: "medium",
				timeStyle: "short",
		  });
};

const typeLabel = (type) =>
	type?.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) ||
	"Notification";

export default function Notifications() {
	const user = getStoredUser();
	const userId = user?._id || user?.id;
	const dashboardPath =
		user?.role === "Founder"
			? "/dashboard"
			: user?.role === "Mentor"
			  ? "/mentor-dashboard"
			  : "/investor-dashboard";
	const navigate = useNavigate();
	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [updatingAll, setUpdatingAll] = useState(false);
	const [updatingId, setUpdatingId] = useState("");

	useEffect(() => {
		let active = true;

		const load = async () => {
			if (!userId || !localStorage.getItem("token")) {
				setError("Please sign in to view your notifications.");
				setLoading(false);
				return;
			}

			try {
				const result = await getNotifications(userId);
				if (active) setNotifications(Array.isArray(result) ? result : []);
			} catch (loadError) {
				if (active) {
					setError(
						loadError.response?.data?.message || "Unable to load notifications."
					);
				}
			} finally {
				if (active) setLoading(false);
			}
		};

		load();
		return () => {
			active = false;
		};
	}, [userId]);

	const unreadCount = notifications.filter((notification) => !notification.isRead).length;

	const handleMarkAll = async () => {
		if (!userId || unreadCount === 0) return;
		setUpdatingAll(true);
		setError("");
		try {
			await markAllNotificationsAsRead(userId);
			setNotifications((current) =>
				current.map((notification) => ({ ...notification, isRead: true }))
			);
		} catch (updateError) {
			setError(updateError.response?.data?.message || "Unable to update notifications.");
		} finally {
			setUpdatingAll(false);
		}
	};

	const handleOpen = async (notification) => {
		setUpdatingId(notification._id);
		setError("");
		try {
			if (!notification.isRead) {
				await markNotificationAsRead(notification._id);
				setNotifications((current) =>
					current.map((item) =>
						item._id === notification._id ? { ...item, isRead: true } : item
					)
				);
			}
			navigate(notificationDestination(notification));
		} catch (updateError) {
			setError(updateError.response?.data?.message || "Unable to mark notification as read.");
		} finally {
			setUpdatingId("");
		}
	};

	return (
		<main className="notificationsPage">
			<header className="notificationsPageHeader">
				<div>
					<Link className="notificationsBackLink" to={dashboardPath}>
						Back to dashboard
					</Link>
					<p className="notificationsEyebrow">YOUR ACTIVITY</p>
					<h1>Notifications</h1>
					<p>Updates about your investment activity and startups.</p>
				</div>
				<div className="notificationsHeaderActions">
					<span className="notificationsUnreadCount">{unreadCount} unread</span>
					<button
						type="button"
						className="notificationsMarkAll"
						disabled={updatingAll || unreadCount === 0}
						onClick={handleMarkAll}
					>
						<FaCheck aria-hidden="true" /> Mark all as read
					</button>
				</div>
			</header>

			{error && <p className="notificationsError" role="alert">{error}</p>}

			<section className="notificationsList" aria-label="All notifications">
				{loading ? (
					<p className="notificationsEmpty">Loading notifications...</p>
				) : notifications.length === 0 ? (
					<div className="notificationsEmptyState">
						<span><FaBell aria-hidden="true" /></span>
						<h2>No notifications yet.</h2>
						<p>Investment updates will appear here.</p>
					</div>
				) : (
					notifications.map((notification) => (
						<button
							key={notification._id}
							type="button"
							className={`notificationsCard${notification.isRead ? " isRead" : " isUnread"}`}
							disabled={updatingId === notification._id}
							onClick={() => handleOpen(notification)}
						>
							<span className="notificationsCardIcon"><FaBell aria-hidden="true" /></span>
							<span className="notificationsCardContent">
								<span className="notificationsCardTopline">
									<strong>{notification.title}</strong>
									<span className="notificationsType">{typeLabel(notification.type)}</span>
								</span>
								<span className="notificationsMessage">{notification.message}</span>
								<time dateTime={notification.createdAt}>
									{formatDate(notification.createdAt)}
								</time>
							</span>
							{!notification.isRead && <span className="notificationsUnreadDot" aria-label="Unread" />}
						</button>
					))
				)}
			</section>
		</main>
	);
}