import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../Components/DashboardLayout/DashboardLayout";
import StartupCard from "../FoundersDashBoard/components/StartupCard";
import { getFounderDashboardStats } from "../../api/dashboard";

import "./MyStartups.css";

export default function MyStartups() {
  const navigate = useNavigate();
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyStartups = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getFounderDashboardStats();
        setStartups(Array.isArray(response.startups) ? response.startups : []);
      } catch (requestError) {
        console.error("FOUNDER STARTUPS LOAD FAILED:", requestError.response?.status || "network");
        setError(
          requestError.response?.data?.message ||
            "Unable to load your startups. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyStartups();
  }, []);

  return (
    <DashboardLayout>
      <main className="myStartupsPage">
        <header className="myStartupsHeader">
          <div className="myStartupsHeading">
            <button
              type="button"
              className="myStartupsBackButton"
              onClick={() => navigate("/dashboard")}
            >
              ← Back to Dashboard
            </button>

            <h1>My Startups</h1>
            <p>
              All the startups you have created as a founder.
            </p>
          </div>

          <div className="myStartupsCount" aria-live="polite">
            <strong>{startups.length}</strong>
            <span>
              {startups.length === 1 ? "startup" : "startups"}
            </span>
          </div>
        </header>

        {loading ? (
          <div className="myStartupsState" role="status">
            <span className="myStartupsSpinner" aria-hidden="true" />
            <p>Loading your startups...</p>
          </div>
        ) : error ? (
          <div className="myStartupsState myStartupsError" role="alert">
            <h2>Could not load startups</h2>
            <p>{error}</p>
          </div>
        ) : startups.length > 0 ? (
          <div className="myStartupsGrid">
            {startups.map((startup) => (
              <StartupCard
                key={startup._id}
                startup={startup}
                fundingMetrics={startup}
              />
            ))}
          </div>
        ) : (
          <div className="myStartupsState myStartupsEmpty">
            <div className="myStartupsEmptyMark" aria-hidden="true">
              VX
            </div>
            <h2>No startups yet</h2>
            <p>
              Startups you create will appear here.
            </p>
            <button
              type="button"
              className="myStartupsCreateButton"
              onClick={() => navigate("/create-startup")}
            >
              Create a Startup
            </button>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}