import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../../Components/DashboardLayout/DashboardLayout";
import {
	getConversations,
	getMessages,
	markConversationRead,
	sendMessage,
} from "../../api/messages";
import "./Messages.css";

const readUser = () => {
	try {
		return JSON.parse(localStorage.getItem("user") || "null");
	} catch {
		return null;
	}
};

const relativeTime = (value) => {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	const elapsed = Math.max(0, Date.now() - date.getTime());
	if (elapsed < 60_000) return "Just now";
	if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)}m ago`;
	if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)}h ago`;
	return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const initialsFor = (name) =>
	(name || "?")
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0].toUpperCase())
		.join("");

function Messages() {
	const user = readUser();
	const [searchParams, setSearchParams] = useSearchParams();
	const [conversations, setConversations] = useState([]);
	const selectedId = searchParams.get("conversation") || "";
	const [messages, setMessages] = useState([]);
	const [messagesConversationId, setMessagesConversationId] = useState("");
	const [hasMore, setHasMore] = useState(false);
	const [loading, setLoading] = useState(true);
	const [conversationError, setConversationError] = useState("");
	const [messageError, setMessageError] = useState("");
	const [messageLoading, setMessageLoading] = useState(false);
	const [olderLoading, setOlderLoading] = useState(false);
	const [sending, setSending] = useState(false);
	const [draft, setDraft] = useState("");
	const messageListRef = useRef(null);
	const composerRef = useRef(null);
	const shouldScrollToBottom = useRef(true);
	const activeConversationId = useRef(selectedId);
	useEffect(() => {
		activeConversationId.current = selectedId;
	}, [selectedId]);

	const loadConversations = useCallback(async (showLoading = false) => {
		if (showLoading) setLoading(true);
		try {
			const result = await getConversations();
			setConversations(Array.isArray(result) ? result : []);
			setConversationError("");
		} catch (error) {
			setConversationError(
				error.response?.data?.message || "Unable to load your conversations."
			);
		} finally {
			if (showLoading) setLoading(false);
		}
	}, []);

	useEffect(() => {
		const initialLoad = window.setTimeout(() => loadConversations(true), 0);
		const intervalId = window.setInterval(() => loadConversations(), 15000);
		return () => {
			window.clearTimeout(initialLoad);
			window.clearInterval(intervalId);
		};
	}, [loadConversations]);

	const selectedConversation = conversations.find((item) => item._id === selectedId);
	const otherParticipant = selectedConversation
		? String(selectedConversation.founderId?._id) === String(user?._id || user?.id)
			? selectedConversation.investorId
			: selectedConversation.founderId
		: null;
	const displayedMessages = messagesConversationId === selectedId ? messages : [];

	const loadCurrentMessages = useCallback(async (showLoading = false) => {
		if (!selectedId) {
			return;
		}
		const requestedId = selectedId;
		if (showLoading) setMessageLoading(true);
		try {
			const result = await getMessages(requestedId);
			if (activeConversationId.current !== requestedId) return;
			setMessages((current) => {
				if (!showLoading && messagesConversationId === requestedId && current.length === result.messages.length &&
					current.every((message, index) => message._id === result.messages[index]?._id)) {
					return current;
				}
				shouldScrollToBottom.current = true;
				return result.messages;
			});
			setMessagesConversationId(requestedId);
			setHasMore(result.hasMore);
			setMessageError("");
			await markConversationRead(requestedId);
			if (activeConversationId.current !== requestedId) return;
			setConversations((current) => current.map((conversation) =>
				conversation._id === requestedId ? { ...conversation, unreadCount: 0 } : conversation
			));
		} catch (error) {
			if (activeConversationId.current === requestedId) {
				setMessageError(error.response?.data?.message || "Unable to load messages.");
			}
		} finally {
			if (showLoading && activeConversationId.current === requestedId) setMessageLoading(false);
		}
	}, [messagesConversationId, selectedId]);

	useEffect(() => {
		if (!selectedId) return undefined;
		const initialLoad = window.setTimeout(() => loadCurrentMessages(true), 0);
		const intervalId = window.setInterval(() => loadCurrentMessages(), 10000);
		return () => {
			window.clearTimeout(initialLoad);
			window.clearInterval(intervalId);
		};
	}, [loadCurrentMessages, selectedId]);

	useEffect(() => {
		if (shouldScrollToBottom.current && messageListRef.current) {
			messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
			shouldScrollToBottom.current = false;
		}
	}, [messages]);

	const selectConversation = (conversationId) => {
		setSearchParams({ conversation: conversationId });
		setMessageError("");
	};

	const loadOlderMessages = async () => {
		if (!displayedMessages.length || olderLoading) return;
		const requestedId = selectedId;
		setOlderLoading(true);
		const previousHeight = messageListRef.current?.scrollHeight || 0;
		try {
			const result = await getMessages(requestedId, {
				before: displayedMessages[0]._id,
				limit: 30,
			});
			if (activeConversationId.current !== requestedId) return;
			setMessages((current) => [...result.messages, ...current]);
			setHasMore(result.hasMore);
			requestAnimationFrame(() => {
				if (messageListRef.current) {
					messageListRef.current.scrollTop = messageListRef.current.scrollHeight - previousHeight;
				}
			});
		} catch (error) {
			if (activeConversationId.current === requestedId) {
				setMessageError(error.response?.data?.message || "Unable to load older messages.");
			}
		} finally {
			setOlderLoading(false);
		}
	};

	const submitMessage = async (event) => {
		event.preventDefault();
		const text = draft.trim();
		if (!text || !selectedId || sending) return;
		const requestedId = selectedId;

		setSending(true);
		setMessageError("");
		try {
			const clientMessageId = globalThis.crypto?.randomUUID?.() ||
				`${Date.now()}-${Math.random().toString(36).slice(2)}`;
			const sent = await sendMessage(requestedId, text, clientMessageId);
			setDraft("");
			if (activeConversationId.current === requestedId) {
				shouldScrollToBottom.current = true;
				setMessagesConversationId(requestedId);
				setMessages((current) => current.some((item) => item._id === sent._id)
					? current
					: [...current, sent]
				);
			}
			await loadConversations();
			composerRef.current?.focus();
		} catch (error) {
			setMessageError(error.response?.data?.message || "Unable to send your message. Please retry.");
		} finally {
			setSending(false);
		}
	};

	if (user?.role !== "Founder" && user?.role !== "Investor") {
		return (
			<DashboardLayout>
				<div className="messagesAccessError" role="status">
					<h1>Messaging is for founders and investors</h1>
					<p>Mentor accounts are not included in startup conversations.</p>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<section className="messagesPage" aria-label="Messages">
				<header className="messagesPageHeader">
					<div>
					<p className="messagesEyebrow">VENTUREX INBOX</p>
					<h1>Messages</h1>
				</div>
				<span className="messagesLiveStatus"><span /> Synced every 10 seconds</span>
				</header>

				<div className="messagingWorkspace">
					<aside className={`conversationPanel${selectedId ? " hasSelection" : ""}`} aria-label="Conversations">
						<div className="conversationPanelHeader">
							<h2>Inbox</h2>
							<span>{conversations.length}</span>
						</div>
						{conversationError && (
							<div className="messagesInlineError" role="alert">
								<p>{conversationError}</p>
								<button type="button" onClick={() => loadConversations(true)}>Retry</button>
							</div>
						)}
						{loading ? (
							<p className="messagesPanelState">Loading conversations...</p>
						) : conversations.length === 0 ? (
							<div className="messagesPanelState messagesNoConversations">
								<span aria-hidden="true">↗</span>
								<strong>Your inbox is ready</strong>
								<p>Start by contacting a startup founder from a startup profile.</p>
							</div>
						) : (
							<div className="conversationList">
								{conversations.map((conversation) => {
									const participant = String(conversation.founderId?._id) === String(user?._id || user?.id)
										? conversation.investorId
										: conversation.founderId;
									return (
										<button
											key={conversation._id}
											type="button"
											className={`conversationItem${selectedId === conversation._id ? " isSelected" : ""}`}
											aria-current={selectedId === conversation._id ? "true" : undefined}
											onClick={() => selectConversation(conversation._id)}
										>
											<Avatar participant={participant} />
											<span className="conversationItemCopy">
												<span className="conversationItemTop">
													<strong>{participant?.name || "VentureX member"}</strong>
													<time>{relativeTime(conversation.latestMessageAt)}</time>
												</span>
												<small>{conversation.startupId?.startupName || "Startup conversation"}</small>
												<span className="conversationPreview">
													{conversation.latestMessage || "No messages yet. Say hello."}
													{conversation.unreadCount > 0 && (
														<span className="conversationUnread" aria-label={`${conversation.unreadCount} unread messages`}>
															{conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
														</span>
													)}
												</span>
											</span>
										</button>
									);
								})}
							</div>
						)}
					</aside>

					<section className="chatPanel" aria-label="Conversation">
						{!selectedConversation ? (
							<div className="chatWelcome">
								<div className="chatWelcomeMark" aria-hidden="true">VX</div>
								<h2>Select a conversation</h2>
								<p>Your founder and investor conversations appear here.</p>
							</div>
						) : (
						<>
							<header className="chatHeader">
								<button type="button" className="chatBackButton" onClick={() => setSearchParams({})} aria-label="Back to inbox">←</button>
								<Avatar participant={otherParticipant} />
								<div className="chatHeaderIdentity">
									<strong>{otherParticipant?.name || "VentureX member"}</strong>
									<span>{selectedConversation.startupId?.startupName || "Startup conversation"}</span>
								</div>
								<span className="chatRoleLabel">{otherParticipant?.role || "Member"}</span>
							</header>
							<div className="messageList" ref={messageListRef} aria-live="polite" aria-relevant="additions text">
								{hasMore && (
									<button type="button" className="loadOlderButton" onClick={loadOlderMessages} disabled={olderLoading}>
										{olderLoading ? "Loading..." : "Load earlier messages"}
									</button>
								)}
								{messageLoading || messagesConversationId !== selectedId ? (
									<p className="chatState">Loading messages...</p>
								) : displayedMessages.length === 0 ? (
									<div className="chatState chatFirstMessage">
										<span>01</span>
										<p>This conversation is just getting started. Send the first message.</p>
									</div>
								) : displayedMessages.map((message) => {
									const isOutgoing = String(message.senderId) === String(user?._id || user?.id);
									return (
										<article key={message._id} className={`messageRow${isOutgoing ? " isOutgoing" : " isIncoming"}`}>
											<div className="messageBubble">
												<p>{message.text}</p>
												<time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</time>
											</div>
										</article>
									);
								})}
							</div>
							{messageError && (
								<div className="chatError" role="alert">
									<span>{messageError}</span>
									<button type="button" onClick={() => loadCurrentMessages(true)}>Retry</button>
								</div>
							)}
							<form className="messageComposer" onSubmit={submitMessage}>
								<label className="visuallyHidden" htmlFor="message-draft">Write a message</label>
								<textarea
									id="message-draft"
									ref={composerRef}
									value={draft}
									onChange={(event) => setDraft(event.target.value.slice(0, 4000))}
									placeholder="Write a message..."
									maxLength={4000}
									rows={1}
									disabled={sending}
									onKeyDown={(event) => {
										if (event.key === "Enter" && !event.shiftKey) {
											event.preventDefault();
											event.currentTarget.form.requestSubmit();
										}
									}}
								/>
								<span className="composerHint">Enter to send · Shift + Enter for a new line</span>
								<button type="submit" className="sendMessageButton" disabled={sending || !draft.trim()} aria-label="Send message">
									{sending ? "Sending..." : "Send"}<span aria-hidden="true">↗</span>
								</button>
							</form>
						</>
						)}
					</section>
				</div>
			</section>
		</DashboardLayout>
	);
}

function Avatar({ participant }) {
	if (participant?.profileImage) {
		return (
			<img
				className="conversationAvatar"
				src={participant.profileImage}
				alt=""
				onError={(event) => { event.currentTarget.style.display = "none"; }}
			/>
		);
	}
	return <span className="conversationAvatar conversationAvatarInitials" aria-hidden="true">{initialsFor(participant?.name)}</span>;
}

export default Messages;