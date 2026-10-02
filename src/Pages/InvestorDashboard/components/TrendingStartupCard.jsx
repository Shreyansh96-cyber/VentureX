import "./TrendingStartupCard.css";

export default function TrendingStartupCard({ startup }) {
  return (
    <div className="trendingStartupCard">

      <div className="startupHeader">

        <div>
          <h3>{startup.name}</h3>

          <span className="startupCategory">
            {startup.category}
          </span>
        </div>

        <span className="startupStage">
          {startup.stage}
        </span>

      </div>

      <p className="startupDescription">
        {startup.description}
      </p>

      <div className="startupFooter">

        <div>

          <span className="raisedLabel">
            Raised
          </span>

          <h4>{startup.raised}</h4>

        </div>

        <div className="startupButtons">

          <button className="viewBtn">
            View
          </button>

          <button className="saveBtn">
            Save
          </button>

        </div>

      </div>

    </div>
  );
}