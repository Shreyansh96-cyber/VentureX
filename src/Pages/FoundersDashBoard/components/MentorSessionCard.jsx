import "./MentorSessionCard.css";
import { useNavigate } from "react-router-dom";

export default function MentorSessionCard({ session }) {
  const navigate = useNavigate();
  const canJoin = session.status === "Accepted";

  return (
    <div className="mentorSessionCard">

      <img
        src={session.image}
        alt={session.name}
        className="mentorAvatar"
      />

      <div className="mentorInfo">

        <h4>{session.name}</h4>

        <p>{session.topic}</p>

        <span>
          📅 {session.date} • ⏰ {session.time}
        </span>

      </div>

      <button
        type="button"
        disabled={!canJoin}
        onClick={() => navigate(`/mentor-sessions/${session.id}/meeting`)}
        title={canJoin ? "Join mentoring meeting" : "This session must be accepted before joining"}
      >
        {canJoin ? "Join" : session.status || "Unavailable"}
      </button>

    </div>
  );
}