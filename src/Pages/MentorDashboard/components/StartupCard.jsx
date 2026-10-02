import "./StartupCard.css";
import { FaArrowRight } from "react-icons/fa";

export default function StartupCard({ startup }) {
  return (
    <div className="mentorStartupCard">

      <div>

        <h3>{startup.name}</h3>

        <p>{startup.category}</p>

        <span>{startup.stage}</span>

      </div>

      <button>
        View
        <FaArrowRight />
      </button>

    </div>
  );
}