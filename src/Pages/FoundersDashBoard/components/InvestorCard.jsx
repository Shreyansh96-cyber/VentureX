import "./InvestorCard.css";
import { Link } from "react-router-dom";

export default function InvestorCard({ investor }) {
  return (
    <div className="investorCard">

      <img
        src={investor.image}
        alt={investor.name}
      />

      <h4>{investor.name}</h4>

      <p>{investor.specialization}</p>

      <Link className="investorCardButton" to={`/investor/${investor.id}`}>
        View Profile
      </Link>

    </div>
  );
}
