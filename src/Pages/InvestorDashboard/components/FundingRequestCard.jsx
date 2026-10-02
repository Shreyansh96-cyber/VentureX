import "./FundingRequestCard.css";

export default function FundingRequestCard({ request }) {
  return (
    <div className="fundingCard">

      <div className="fundingTop">

        <div>
          <h3>{request.startup}</h3>
          <p>Funding Opportunity</p>
        </div>

        <span className="fundingStage">
          {request.stage}
        </span>

      </div>

      <div className="fundingBody">

        <h2>{request.amount}</h2>

        <span>Funding Required</span>

      </div>

      <div className="fundingButtons">

        <button className="viewStartupBtn">
          View Startup
        </button>

        <button className="investNowBtn">
          Invest Now
        </button>

      </div>

    </div>
  );
}