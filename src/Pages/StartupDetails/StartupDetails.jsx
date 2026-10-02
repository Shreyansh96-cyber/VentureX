import "./StartupDetails.css";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import API from "../../api/startup";

export default function StartupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStartup = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(`/${id}`);

        setStartup(response.data);
      } catch (err) {
        console.error("STARTUP DETAILS LOAD FAILED:", err.response?.status || "network");

        setError(
          err.response?.data?.message ||
            "Unable to load startup details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStartup();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="startupDetailsPage">
        <div className="startupDetailsLoading">
          <h2>Loading startup...</h2>
        </div>
      </div>
    );
  }

  if (error || !startup) {
    return (
      <div className="startupDetailsPage">
        <div className="startupDetailsError">
          <h2>Startup not found</h2>

          <p>
            {error || "This startup could not be found."}
          </p>

          <button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const name =
    startup.startupName || "Unnamed Startup";

  const industry =
    startup.industry || "Technology";

  const stage =
    startup.stage || "Idea";

  const description =
    startup.description ||
    "No description available.";

  const tagline =
    startup.tagline || "";

  const location =
    startup.location || "Not specified";

  const teamSize =
    startup.teamSize || 1;

  const foundedYear =
    startup.foundedYear || "Not specified";

  const fundingGoal =
    Number(startup.fundingGoal) || 0;

  const raised =
    Number(startup.raised) || 0;

  const percentage =
    fundingGoal > 0
      ? Math.min(
          (raised / fundingGoal) * 100,
          100
        )
      : 0;

  return (
    <div className="startupDetailsPage">

      {/* TOP BAR */}

      <div className="startupDetailsTopbar">
        <button
          className="backButton"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>


      {/* MAIN CONTENT */}

      <div className="startupDetailsContainer">

        {/* HEADER */}

        <div className="startupDetailsHeader">

          <div>

            <span className="startupDetailsCategory">
              {industry}
            </span>

            <h1>
              {name}
            </h1>

            {tagline && (
              <p className="startupTagline">
                {tagline}
              </p>
            )}

          </div>

          <span
            className={`startupDetailsStage ${stage
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
          >
            {stage}
          </span>

        </div>


        {/* DESCRIPTION */}

        <section className="detailsSection">

          <h2>
            About the Startup
          </h2>

          <p>
            {description}
          </p>

        </section>


        {/* STARTUP INFORMATION */}

        <section className="startupInfoGrid">

          <div className="infoCard">
            <span>Industry</span>
            <strong>{industry}</strong>
          </div>

          <div className="infoCard">
            <span>Stage</span>
            <strong>{stage}</strong>
          </div>

          <div className="infoCard">
            <span>Location</span>
            <strong>{location}</strong>
          </div>

          <div className="infoCard">
            <span>Team Size</span>
            <strong>{teamSize}</strong>
          </div>

          <div className="infoCard">
            <span>Founded</span>
            <strong>{foundedYear}</strong>
          </div>

          <div className="infoCard">
            <span>Funding Goal</span>
            <strong>₹{fundingGoal}L</strong>
          </div>

        </section>


        {/* FUNDING */}

        <section className="detailsSection fundingDetails">

          <h2>
            Funding Progress
          </h2>

          <div className="fundingNumbers">

            <div>
              <span>Raised</span>
              <strong>₹{raised}L</strong>
            </div>

            <div>
              <span>Goal</span>
              <strong>₹{fundingGoal}L</strong>
            </div>

            <div>
              <span>Progress</span>
              <strong>
                {percentage.toFixed(0)}%
              </strong>
            </div>

          </div>

          <div className="detailsProgressBar">

            <div
              className="detailsProgressFill"
              style={{
                width: `${percentage}%`,
              }}
            />

          </div>

        </section>


        {/* WEBSITE */}

        {startup.website && (
          <section className="detailsSection">

            <h2>
              Website
            </h2>

            <a
              href={startup.website}
              target="_blank"
              rel="noreferrer"
            >
              {startup.website}
            </a>

          </section>
        )}

      </div>

    </div>
  );
}