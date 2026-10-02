import "./InvestorCard.css";

export default function InvestorCard({ investor }) {
  return (
    <div className="investorCard">

      <img
        src={investor.image}
        alt={investor.name}
      />

      <h4>{investor.name}</h4>

      <p>{investor.specialization}</p>

      <button>View Profile</button>

    </div>
  );
}