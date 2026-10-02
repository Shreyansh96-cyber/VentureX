import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./MentorDashboard.css";

import HomeButton from "../../Components/HomeButton";
import NotificationBell from "../../Components/Notifications/NotificationBell";
import { getProfileImageUrl } from "../../api/profile";
import { getMentorSessions, updateMentorSessionStatus } from "../../api/mentorSession";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString("en-IN", { dateStyle: "medium" });
};

const formatTime = (value) => {
  if (!value) return "Flexible";
  const time = new Date(`2000-01-01T${value}`);
  if (Number.isNaN(time.getTime())) return value;
  return time.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
};

const isFutureSession = (value) => {
  const targetDate = new Date(value);
  if (Number.isNaN(targetDate.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return targetDate >= today;
};

const sortByRequestedDateAsc = (a, b) => {
  const aValue = new Date(a.requestedDate).getTime();
  const bValue = new Date(b.requestedDate).getTime();
  return aValue - bValue;
};

export default function MentorDashboard() {
  const user = getStoredUser();
  const mentorId = user?._id || user?.id;
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [actioningId, setActioningId] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);

  const loadSessions = async () => {
    if (!mentorId) {
      setSessions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await getMentorSessions(mentorId);
      setSessions(Array.isArray(result) ? result : []);
      setError("");
    } catch (loadError) {
      setSessions([]);
      setError(loadError.response?.data?.message || "Unable to load mentor dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [mentorId]);

  const handleStatusUpdate = async (sessionId, status) => {
    try {
      setActioningId(`${sessionId}:${status}`);
      setError("");
      setSuccessMessage("");
      const result = await updateMentorSessionStatus(sessionId, status);
      if (result?.session) {
        setSessions((currentSessions) =>
          currentSessions.map((session) =>
            session._id === sessionId ? result.session : session
          )
        );
      } else {
        await loadSessions();
      }
      if (selectedSession?._id === sessionId) {
        setSelectedSession(null);
      }
      if (status === "Accepted") {
        setSuccessMessage("Session accepted successfully.");
      } else if (status === "Rejected") {
        setSuccessMessage("Session rejected successfully.");
      } else if (status === "Completed") {
        setSuccessMessage("Session marked as completed.");
      }
    } catch (updateError) {
      if (import.meta.env.DEV) {
        console.error("Mentor session status update failed:", {
          status: updateError.response?.status ?? null,
          message: updateError.response?.data?.message || "No response message",
        });
      }

      setError(updateError.response?.data?.message || "Unable to update the session status.");
    } finally {
      setActioningId("");
    }
  };

  const confirmReject = async (sessionId) => {
    const confirmed = window.confirm("Reject this mentorship request?");
    if (!confirmed) return;

    await handleStatusUpdate(sessionId, "Rejected");
  };

  const pendingRequests = useMemo(
    () => sessions.filter((session) => session.status === "Pending").sort(sortByRequestedDateAsc),
    [sessions]
  );

  const upcomingSessions = useMemo(
    () =>
      sessions
        .filter((session) => session.status === "Accepted" && isFutureSession(session.requestedDate))
        .sort(sortByRequestedDateAsc),
    [sessions]
  );

  const completedSessions = useMemo(
    () =>
      sessions
        .filter((session) => session.status === "Completed")
        .sort((a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime()),
    [sessions]
  );

  const stats = useMemo(() => {
    const pendingCount = pendingRequests.length;
    const upcomingCount = upcomingSessions.length;
    const completedCount = completedSessions.length;
    const totalCount = sessions.length;

    return [
      { label: "Pending Requests", value: pendingCount, accent: "amber" },
      { label: "Upcoming Sessions", value: upcomingCount, accent: "cyan" },
      { label: "Completed Sessions", value: completedCount, accent: "green" },
      { label: "Total Sessions", value: totalCount, accent: "violet" },
    ];
  }, [pendingRequests.length, upcomingSessions.length, completedSessions.length, sessions.length]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="mentorDashboardPage">
      <header className="mentorDashboardHeader">
        <div className="mentorDashboardHeadingWrap">
          <p className="mentorDashboardEyebrow">MENTOR DASHBOARD</p>
          <h1>{greeting()}, {user?.name || "Mentor"} 👋</h1>
        </div>

        <div className="mentorDashboardActions">
          <HomeButton />
          <NotificationBell />
          <img
            src={getProfileImageUrl(user?.profileImage) || "https://i.pravatar.cc/100?img=12"}
            alt={user?.name || "Mentor"}
            className="mentorDashboardAvatar"
          />
        </div>
      </header>

      {error && <div className="mentorDashboardError">{error}</div>}
      {successMessage && <div className="mentorDashboardSuccess">{successMessage}</div>}

      <section className="mentorQuickActions">
        <Link to="#pending-requests" className="mentorQuickAction">View pending requests</Link>
        <Link to="#upcoming-sessions" className="mentorQuickAction">View upcoming sessions</Link>
        <Link to="/profile" className="mentorQuickAction">View profile</Link>
        <Link to="/notifications" className="mentorQuickAction">View notifications</Link>
      </section>

      <section className="mentorProfileCard">
        <div className="mentorProfileCardHeader">
          <img
            src={getProfileImageUrl(user?.profileImage) || "https://i.pravatar.cc/120?img=12"}
            alt={user?.name || "Mentor"}
            className="mentorProfileAvatar"
          />
          <div>
            <p className="mentorDashboardEyebrow">PROFILE</p>
            <h3>{user?.name || "Mentor"}</h3>
          </div>
        </div>

        <div className="mentorProfileMeta">
          <div>
            <span>Expertise</span>
            <strong>{user?.expertise || "General Mentorship"}</strong>
          </div>
          <div>
            <span>Experience</span>
            <strong>{user?.experience || "Experienced mentor"}</strong>
          </div>
          <div>
            <span>Location</span>
            <strong>{user?.location || "Remote"}</strong>
          </div>
        </div>

        {user?.bio && (
          <p className="mentorProfileBio">{user.bio}</p>
        )}

        <div className="mentorProfileActions">
          <Link to="/profile" className="mentorPrimaryButton mentorPrimaryButton--profile">View profile</Link>
        </div>
      </section>

      <section className="mentorStatsGrid">
        {stats.map((stat) => (
          <article key={stat.label} className={`mentorStatCard mentorStatCard--${stat.accent}`}>
            <div className="mentorStatIcon">{stat.label === "Pending Requests" ? "⏳" : stat.label === "Upcoming Sessions" ? "📅" : stat.label === "Completed Sessions" ? "✅" : "📊"}</div>
            <div>
              <p>{stat.label}</p>
              <strong>{stat.value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section id="pending-requests" className="mentorDashboardSection">
        <div className="mentorSectionHeader">
          <h2>Pending Requests</h2>
        </div>

        {loading ? (
          <div className="mentorEmptyState">Loading session requests...</div>
        ) : pendingRequests.length === 0 ? (
          <div className="mentorEmptyState">No pending requests. You are all caught up.</div>
        ) : (
          <div className="mentorSessionList">
            {pendingRequests.map((session) => (
              <article key={session._id} className="mentorSessionCard">
                <div className="mentorSessionMeta">
                  <div>
                    <p className="mentorMetaLabel">Requester</p>
                    <h3>{session.requesterId?.name || "Founder"}</h3>
                  </div>
                  <span className="mentorStatusBadge mentorStatusBadge--pending">{session.status}</span>
                </div>

                <div className="mentorSessionDetails">
                  <div>
                    <p className="mentorMetaLabel">Startup</p>
                    <strong>{session.startupId?.startupName || "General mentorship"}</strong>
                  </div>
                  <div>
                    <p className="mentorMetaLabel">Topic</p>
                    <strong>{session.topic}</strong>
                  </div>
                  <div>
                    <p className="mentorMetaLabel">Date</p>
                    <strong>{formatDate(session.requestedDate)}</strong>
                  </div>
                  <div>
                    <p className="mentorMetaLabel">Time</p>
                    <strong>{formatTime(session.requestedTime)}</strong>
                  </div>
                </div>

                {session.message && (
                  <div className="mentorSessionMessage">
                    <p className="mentorMetaLabel">Message</p>
                    <p>{session.message}</p>
                  </div>
                )}

                <div className="mentorSessionActions">
                  <button type="button" className="mentorGhostButton" onClick={() => setSelectedSession(session)}>
                    View details
                  </button>
                  <button
                    type="button"
                    className="mentorPrimaryButton mentorPrimaryButton--accept"
                    onClick={() => handleStatusUpdate(session._id, "Accepted")}
                    disabled={actioningId.startsWith(`${session._id}:`)}
                  >
                    {actioningId === `${session._id}:Accepted` ? "Accepting..." : "Accept"}
                  </button>
                  <button
                    type="button"
                    className="mentorSecondaryButton"
                    onClick={() => confirmReject(session._id)}
                    disabled={actioningId.startsWith(`${session._id}:`)}
                  >
                    {actioningId === `${session._id}:Rejected` ? "Rejecting..." : "Reject"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mentorDashboardColumns">
        <div id="upcoming-sessions" className="mentorDashboardColumn">
          <div className="mentorSectionHeader">
            <h2>Upcoming Sessions</h2>
          </div>

          {loading ? (
            <div className="mentorEmptyState">Loading upcoming sessions...</div>
          ) : upcomingSessions.length === 0 ? (
            <div className="mentorEmptyState">No upcoming sessions. Accepted requests will appear here.</div>
          ) : (
            <div className="mentorSessionList compact">
              {upcomingSessions.map((session) => (
                <article key={session._id} className="mentorSessionCard compactCard">
                  <div className="mentorSessionMeta">
                    <div>
                      <p className="mentorMetaLabel">Requester</p>
                      <h3>{session.requesterId?.name || "Founder"}</h3>
                    </div>
                    <span className="mentorStatusBadge mentorStatusBadge--accepted">{session.status}</span>
                  </div>

                  <div className="mentorSessionDetails compactDetails">
                    <div>
                      <p className="mentorMetaLabel">Topic</p>
                      <strong>{session.topic}</strong>
                    </div>
                    <div>
                      <p className="mentorMetaLabel">When</p>
                      <strong>{formatDate(session.requestedDate)} • {formatTime(session.requestedTime)}</strong>
                    </div>
                  </div>

                  <div className="mentorSessionActions compactActions">
                    <button type="button" className="mentorGhostButton" onClick={() => setSelectedSession(session)}>
                      Details
                    </button>
                    <button
                      type="button"
                      className="mentorPrimaryButton"
                      onClick={() => handleStatusUpdate(session._id, "Completed")}
                      disabled={actioningId === `${session._id}:Completed`}
                    >
                      {actioningId === `${session._id}:Completed` ? "Completing..." : "Complete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="mentorDashboardColumn">
          <div className="mentorSectionHeader">
            <h2>Completed Sessions</h2>
          </div>

          {loading ? (
            <div className="mentorEmptyState">Loading completed sessions...</div>
          ) : completedSessions.length === 0 ? (
            <div className="mentorEmptyState">No completed sessions yet.</div>
          ) : (
            <div className="mentorSessionList compact">
              {completedSessions.map((session) => (
                <article key={session._id} className="mentorSessionCard compactCard">
                  <div className="mentorSessionMeta">
                    <div>
                      <p className="mentorMetaLabel">Requester</p>
                      <h3>{session.requesterId?.name || "Founder"}</h3>
                    </div>
                    <span className="mentorStatusBadge mentorStatusBadge--completed">Completed</span>
                  </div>

                  <div className="mentorSessionDetails compactDetails">
                    <div>
                      <p className="mentorMetaLabel">Topic</p>
                      <strong>{session.topic}</strong>
                    </div>
                    <div>
                      <p className="mentorMetaLabel">When</p>
                      <strong>{formatDate(session.requestedDate)} • {formatTime(session.requestedTime)}</strong>
                    </div>
                  </div>

                  <button type="button" className="mentorGhostButton fullWidth" onClick={() => setSelectedSession(session)}>
                    View details
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedSession && (
        <div className="mentorSessionModalBackdrop" onClick={() => setSelectedSession(null)}>
          <div className="mentorSessionModal" onClick={(event) => event.stopPropagation()}>
            <div className="mentorSessionModalHeader">
              <div>
                <p className="mentorDashboardEyebrow">SESSION DETAILS</p>
                <h3>{selectedSession.topic}</h3>
              </div>
              <button type="button" className="mentorCloseButton" onClick={() => setSelectedSession(null)} aria-label="Close session details">
                ×
              </button>
            </div>

            <div className="mentorSessionModalGrid">
              <div>
                <p className="mentorMetaLabel">Requester</p>
                <strong>{selectedSession.requesterId?.name || "Founder"}</strong>
              </div>
              <div>
                <p className="mentorMetaLabel">Startup</p>
                <strong>{selectedSession.startupId?.startupName || "General mentorship"}</strong>
              </div>
              <div>
                <p className="mentorMetaLabel">Date</p>
                <strong>{formatDate(selectedSession.requestedDate)}</strong>
              </div>
              <div>
                <p className="mentorMetaLabel">Time</p>
                <strong>{formatTime(selectedSession.requestedTime)}</strong>
              </div>
              <div>
                <p className="mentorMetaLabel">Status</p>
                <strong>{selectedSession.status}</strong>
              </div>
              <div>
                <p className="mentorMetaLabel">Created</p>
                <strong>{formatDate(selectedSession.createdAt)}</strong>
              </div>
            </div>

            {selectedSession.message && (
              <div className="mentorSessionMessage modalMessage">
                <p className="mentorMetaLabel">Message</p>
                <p>{selectedSession.message}</p>
              </div>
            )}

            {selectedSession.status === "Pending" && (
              <div className="mentorSessionActions modalActions">
                <button
                  type="button"
                  className="mentorPrimaryButton mentorPrimaryButton--accept"
                  onClick={() => handleStatusUpdate(selectedSession._id, "Accepted")}
                  disabled={actioningId === selectedSession._id + "Accepted"}
                >
                  {actioningId === selectedSession._id + "Accepted" ? "Accepting..." : "Accept request"}
                </button>
                <button
                  type="button"
                  className="mentorSecondaryButton"
                  onClick={() => confirmReject(selectedSession._id)}
                  disabled={actioningId === selectedSession._id + "Rejected"}
                >
                  {actioningId === selectedSession._id + "Rejected" ? "Rejecting..." : "Reject request"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
