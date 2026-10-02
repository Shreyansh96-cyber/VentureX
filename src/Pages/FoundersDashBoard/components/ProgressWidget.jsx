import "./ProgressWidget.css";
import { useNavigate } from "react-router-dom";
import { formatRupees } from "../../../utils/currency";

export default function ProgressWidget({ funding, loading = false, error = false }) {
  const navigate = useNavigate();
  const percentage = funding
    ? Math.min(Math.max(Number(funding.fundingPercentage) || 0, 0), 100)
    : 0;
  const circumference = 440;
  const strokeOffset = circumference - (circumference * percentage) / 100;
  const displayValue = (amount) => {
    if (loading || error || !funding) return "—";
    return formatRupees(amount);
  };

  return (
    <div className="progressWidget">

      <h3>Funding Progress</h3>

      {/* Progress Circle */}
      <div className="progressCircle">

        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
        >

          {/* Background */}
          <circle
            cx="90"
            cy="90"
            r="70"
            className="bgCircle"
          />

          {/* Progress */}
          <circle
            cx="90"
            cy="90"
            r="70"
            className="progressCircleStroke"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeOffset,
            }}
          />

        </svg>

        <div className="progressContent">

          <h2>
            {loading || error || !funding ? "—" : `${percentage.toFixed(0)}%`}
          </h2>

          <span>
            Funded
          </span>

        </div>

      </div>

      {/* Funding Summary */}
      <div className="fundingSummary">

        <div className="summaryCard">

          <h4>
            Raised
          </h4>

          <p>
            {displayValue(funding?.raisedAmount)}
          </p>

        </div>

        <div className="summaryCard">

          <h4>
            Goal
          </h4>

          <p>
            {displayValue(funding?.fundingGoal)}
          </p>

        </div>

      </div>

      {error && (
        <p className="progressError" role="alert">
          Unable to load funding progress.
        </p>
      )}

      <button
        type="button"
        className="progressBtn"
        onClick={() => navigate("/funding-analytics")}
      >
        View Analytics
      </button>

    </div>
  );
}