import "./RecommendedStartupCard.css";

export default function RecommendedStartupCard({ startup }) {
  return (
    <div className="recommendedCard">

      <div className="recommendedHeader">

        <h3>{startup.name}</h3>

        <span>{startup.stage}</span>

      </div>

      <p className="recommendedCategory">
        {startup.category}
      </p>

      <p className="recommendedText">
        Based on your previous investments, this startup matches your investment interests.
      </p>

      <div className="recommendedButtons">

        <button className="recommendViewBtn">
          View Details
        </button>

        <button className="recommendInvestBtn">
          Invest
        </button>

      </div>

    </div>
  );
}