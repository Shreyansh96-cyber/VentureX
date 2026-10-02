import "./StartupCard.css";
import { useNavigate } from "react-router-dom";
import { formatRupees } from "../../../utils/currency";

export default function StartupCard({ startup, fundingMetrics }) {
  const navigate = useNavigate();

  const name =
    startup?.startupName ||
    startup?.name ||
    "Unnamed Startup";

  const category =
    startup?.industry ||
    startup?.category ||
    "Technology";

  const stage =
    startup?.stage ||
    "Idea";

  const description =
    startup?.description ||
    "No description available.";

  const raised = Number(fundingMetrics?.raisedAmount) || 0;
  const goal = Number(fundingMetrics?.fundingGoal) || 0;

  const percentage =
    fundingMetrics && goal > 0
      ? Math.min((raised / goal) * 100, 100)
      : 0;

  // VIEW DETAILS
  const handleViewDetails = () => {
    if (!startup?._id) {
      console.error("STARTUP DETAILS NAVIGATION FAILED: missing ID");
      return;
    }

    navigate(`/startup/${startup._id}`, {
  state: {
    from: "founder-dashboard",
  },
});
  };

  return (
    <div className="startupCard">

      {/* HEADER */}
      <div className="startupHeader">

        <div>
          <h3>{name}</h3>

          <span className="startupCategory">
            {category}
          </span>
        </div>

        <span
          className={`startupStage ${stage
            .toLowerCase()
            .replace(/\s+/g, "-")}`}
        >
          {stage}
        </span>

      </div>


      {/* DESCRIPTION */}
      <p className="startupDescription">
        {description}
      </p>


      {/* FUNDING */}
      <div className="fundingInfo">

        <div className="fundingRow">
          <span>Raised</span>

          <strong>
            {fundingMetrics ? formatRupees(raised) : "—"}
          </strong>
        </div>

        <div className="fundingRow">
          <span>Goal</span>

          <strong>
            {goal > 0 ? formatRupees(goal) : "—"}
          </strong>
        </div>

      </div>


      {/* PROGRESS BAR */}
      <div className="progressBar">

        <div
          className="progressFill"
          style={{
            width: fundingMetrics ? `${percentage}%` : "0%",
          }}
        />

      </div>


      {/* FOOTER */}
      <div className="startupFooter">

        <span className="progressText">
          {fundingMetrics ? `${percentage.toFixed(0)}% Funded` : "—"}
        </span>

        <button
          type="button"
          onClick={handleViewDetails}
        >
          View Details
        </button>

      </div>

    </div>
  );
}