import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRequesterSessions, updateMentorSessionStatus } from "../../api/mentorSession";
import "./MyMentorship.css";

const getCurrentUser = () => {
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

export default function MyMentorship() {
  const user = getCurrentUser();
  const userId = user?._id || user?.id;
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const loadSessions = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const result = await getRequesterSessions(userId);
      setSessions(Array.isArray(result) ? result : []);
      setError("");
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Unable to load mentorship sessions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [userId]);

  const handleCancel = async (sessionId) => {
    try {
      setUpdatingId(sessionId);
      setError("");
      await updateMentorSessionStatus(sessionId, "Cancelled");
      await loadSessions();
    } catch (cancelError) {
      setError(cancelError.response?.data?.message || "Unable to cancel this session.");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <main className="myMentorshipPage">
      <header className="myMentorshipHeader">
        <div className="myMentorshipHeading">
          <p className="myMentorshipEyebrow">YOUR SESSIONS</p>
          <h1>My Mentorship</h1>
        </div>
        <Link to="/dashboard" className="myMentorshipBackLink">
          ← Back to Dashboard
        </Link>
      </header>

      {error && <div className="myMentorshipError">{error}</div>}

      {loading ? (
        <div className="myMentorshipEmptyState">Loading mentoring sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="myMentorshipEmptyState">No mentoring sessions yet.</div>
      ) : (
        <section className="myMentorshipList">
          {sessions.map((session) => (
            <article key={session._id} className="mentorshipSessionCard">
              <div className="mentorshipSessionMeta">
                <div>
                  <p className="mentorshipLabel">Mentor</p>
                  <h3>{session.mentorId?.name || "Mentor"}</h3>
                </div>
                <span className={`statusPill status-${(session.status || "Pending").toLowerCase()}`}>
                  {session.status || "Pending"}
                </span>
              </div>

              <div className="mentorshipDetails">
                <div>
                  <p className="mentorshipLabel">Topic</p>
                  <strong>{session.topic}</strong>
                </div>
                <div>
                  <p className="mentorshipLabel">Date</p>
                  <strong>{formatDate(session.requestedDate)}</strong>
                </div>
                <div>
                  <p className="mentorshipLabel">Time</p>
                  <strong>{session.requestedTime}</strong>
                </div>
              </div>

              {session.message && (
                <p className="mentorshipMessage">
                  <span className="mentorshipLabel">Message</span>
                  {session.message}
                </p>
              )}

              {(session.status === "Pending" || session.status === "Accepted") && (
                <button
                  type="button"
                  className="cancelSessionButton"
                  onClick={() => handleCancel(session._id)}
                  disabled={updatingId === session._id}
                >
                  {updatingId === session._id ? "Cancelling..." : "Cancel Session"}
                </button>
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
