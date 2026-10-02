import "./MentorSessionCard.css";

export default function MentorSessionCard({ session }) {
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

      <button>Join</button>

    </div>
  );
}