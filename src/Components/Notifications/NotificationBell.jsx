import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaCheck } from "react-icons/fa";
import {
	getNotifications,
	markAllNotificationsAsRead,
	markNotificationAsRead,
} from "../../api/notification";
import "./NotificationBell.css";

const readUser = () => {
	try {
		return JSON.parse(localStorage.getItem("user") || "null");
	} catch {
		return null;
	}
};

const relativeTime = (value) => {
	const timestamp = new Date(value).getTime();
	if (!Number.isFinite(timestamp)) return "Recently";

	const elapsed = Math.max(0, Date.now() - timestamp);
	const minutes = Math.floor(elapsed / 60000);
	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}d ago`;
	return new Date(value).toLocaleDateString("en-IN");
};

const destinationFor = (notification) =>
	notification.type === "MESSAGE_RECEIVED" && notification.conversationId
		? `/messages?conversation=${notification.conversationId}`
		: notification.type === "INVESTMENT_REQUEST"
		? "/dashboard#investment-requests"
		: notification.type === "INVESTMENT_ACCEPTED" ||
		    notification.type === "INVESTMENT_REJECTED"
		  ? "/investments"
		  : "/notifications";

export default function NotificationBell() {
	const user = readUser();
	const userId = user?._id || user?.id;
	const navigate = useNavigate();
	const containerRef = useRef(null);
	const [isOpen, setIsOpen] = useState(false);
	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [updating, setUpdating] = useState(false);

	useEffect(() => {
		let active = true;

		const loadNotifications = async () => {
			if (!userId || !localStorage.getItem("token")) {
				if (active) {
					setNotifications([]);
					setLoading(false);
				}
				return;
			}

			try {
				const result = await getNotifications(userId);
				if (active) {
					setNotifications(Array.isArray(result) ? result : []);
					setError("");
				}
			} catch (loadError) {
				if (active) {
					setError(
						loadError.response?.data?.message ||
							"Unable to load notifications."
					);
				}
			} finally {
				if (active) setLoading(false);
			}
		};

		loadNotifications();
		const intervalId = window.setInterval(loadNotifications, 60000);

		return () => {
			active = false;
			window.clearInterval(intervalId);
		};
	}, [userId]);

	useEffect(() => {
		if (!isOpen) return undefined;

		const closeOnOutsideClick = (event) => {
			if (!containerRef.current?.contains(event.target)) setIsOpen(false);
		};

		const closeOnEscape = (event) => {
			if (event.key === "Escape") setIsOpen(false);
		};

		document.addEventListener("mousedown", closeOnOutsideClick);
		document.addEventListener("keydown", closeOnEscape);
		return () => {
			document.removeEventListener("mousedown", closeOnOutsideClick);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [isOpen]);

	const unreadCount = notifications.filter((notification) => !notification.isRead).length;

	const openNotification = async (notification) => {
		try {
			if (!notification.isRead) {
				await markNotificationAsRead(notification._id);
				setNotifications((current) =>
					current.map((item) =>
						item._id === notification._id ? { ...item, isRead: true } : item
					)
				);
			}
			setIsOpen(false);
			navigate(destinationFor(notification));
		} catch (markError) {
			setError(markError.response?.data?.message || "Unable to mark as read.");
		}
	};

	const markAllRead = async () => {
		if (!userId || unreadCount === 0) return;
		setUpdating(true);
		setError("");
		try {
			await markAllNotificationsAsRead(userId);
			setNotifications((current) =>
				current.map((notification) => ({ ...notification, isRead: true }))
			);
		} catch (markError) {
			setError(markError.response?.data?.message || "Unable to update notifications.");
		} finally {
			setUpdating(false);
		}
	};

	return (
		<div className="notificationBell" ref={containerRef}>
			<button
				className="notificationBellTrigger"
				type="button"
				aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
				aria-expanded={isOpen}
				onClick={() => setIsOpen((open) => !open)}
			>
				<FaBell aria-hidden="true" />
				{unreadCount > 0 && (
					<span className="notificationBellCount">
						{unreadCount > 99 ? "99+" : unreadCount}
					</span>
				)}
			</button>

			{isOpen && (
				<div className="notificationBellPanel" role="dialog" aria-label="Notifications">
					<div className="notificationBellHeader">
						<div>
							<strong>Notifications</strong>
							<span>{unreadCount} unread</span>
						</div>
						<button
							type="button"
							className="notificationMarkAll"
							disabled={updating || unreadCount === 0}
							onClick={markAllRead}
						>
							<FaCheck aria-hidden="true" /> Mark all read
						</button>
					</div>

					{error && <p className="notificationBellError" role="alert">{error}</p>}
					{loading ? (
						<p className="notificationBellEmpty">Loading notifications...</p>
					) : notifications.length === 0 ? (
						<p className="notificationBellEmpty">No notifications yet.</p>
					) : (
						<div className="notificationBellList">
							{notifications.slice(0, 6).map((notification) => (
								<button
									key={notification._id}
									type="button"
									className={`notificationBellItem${notification.isRead ? " isRead" : " isUnread"}`}
									onClick={() => openNotification(notification)}
								>
									<span className="notificationBellDot" aria-hidden="true" />
									<span className="notificationBellItemCopy">
										<strong>{notification.title}</strong>
										<span>{notification.message}</span>
										<small>{relativeTime(notification.createdAt)}</small>
									</span>
								</button>
							))}
						</div>
					)}

					<button
						type="button"
						className="notificationViewAll"
						onClick={() => {
							setIsOpen(false);
							navigate("/notifications");
						}}
					>
						View all notifications
					</button>
				</div>
			)}
		</div>
	);
}