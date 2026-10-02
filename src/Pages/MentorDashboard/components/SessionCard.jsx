import "./SessionCard.css";
import { FaClock, FaVideo } from "react-icons/fa";

export default function SessionCard({ session }) {
  return (
    <div className="sessionCard">

      <div className="sessionInfo">

        <h3>{session.startup}</h3>

        <p>{session.topic}</p>

        <div className="sessionTime">
          <FaClock />
          <span>{session.time}</span>
        </div>

      </div>

      <button className="joinBtn">
        <FaVideo />
        Join
      </button>

    </div>
  );
}