import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import API from "../../../api/startup";
import { checkSavedStartup, saveStartup, unsaveStartup } from "../../../api/savedStartup";
import { formatRupees } from "../../../utils/currency";

import InvestModal from "./InvestModal";

import "./StartupDetailsPage.css";

function StartupDetailsPage() {
  const { id } = useParams();
  const location = useLocation();

  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [investmentSuccess, setInvestmentSuccess] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showInvestModal, setShowInvestModal] = useState(false);

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const startupFounderId =
    typeof startup?.founderId === "object"
      ? startup?.founderId?._id
      : startup?.founderId;

  const canEditStartup =
    currentUser?.role === "Founder" &&
    startupFounderId != null &&
    String(startupFounderId) === String(currentUser?._id);

  // Check where the user came from
  const cameFromFounderDashboard =
    location.state?.from === "founder-dashboard";

  const backPath = cameFromFounderDashboard
    ? "/dashboard"
    : "/discover-startups";

  const backText = cameFromFounderDashboard
    ? "← Back to Dashboard"
    : "← Back to Discover Startups";

  useEffect(() => {
    const fetchStartup = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(`/${id}`);

        const startupData =
          response.data.startup || response.data;

        setStartup(startupData);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load startup details."
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchSavedState = async () => {
      if (!currentUser?._id && !currentUser?.id) {
        setSaved(false);
        return;
      }

      const userId = currentUser?._id || currentUser?.id;
      const isSaved = await checkSavedStartup(userId, id);
      setSaved(isSaved);
    };

    fetchStartup();
    fetchSavedState();
  }, [id, currentUser?._id, currentUser?.id]);

  const handleSaveToggle = async () => {
    if (!currentUser?._id && !currentUser?.id) {
      window.location.href = "/login";
      return;
    }

    try {
      setSaving(true);
      const userId = currentUser?._id || currentUser?.id;

      if (saved) {
        await unsaveStartup(id);
        setSaved(false);
      } else {
        await saveStartup(id);
        setSaved(true);
      }

      if (userId) {
        const nextSaved = await checkSavedStartup(userId, id);
        setSaved(nextSaved);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Unable to update saved startup.");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="startup-details-page">
        <div className="details-message">
          <h2>Loading startup...</h2>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error || !startup) {
    return (
      <div className="startup-details-page">
        <div className="details-message">
          <h2>Startup not found</h2>

          <p>
            {error ||
              "This startup could not be found."}
          </p>

          <Link to={backPath}>
            {backText}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="startup-details-page">

      {/* =========================
          BACK BUTTON
      ========================= */}

      <Link
        to={backPath}
        className="details-back"
      >
        {backText}
      </Link>

      {investmentSuccess && (
        <div className="details-success-banner">{investmentSuccess}</div>
      )}

      {/* =========================
          MAIN HEADER
      ========================= */}

      <div className="startup-details-header">

        <div className="startup-details-logo">
          {startup.startupName
            ?.charAt(0)
            .toUpperCase() || "S"}
        </div>

        <div className="startup-details-title">

          <p className="details-label">
            STARTUP OPPORTUNITY
          </p>

          <h1>
            {startup.startupName ||
              "Unnamed Startup"}
          </h1>

          <p className="details-tagline">
            {startup.tagline ||
              "No tagline available."}
          </p>

          <div className="details-tags">

            <span>
              {startup.industry ||
                "Technology"}
            </span>

            <span>
              {startup.stage ||
                "Idea"}
            </span>

            <span>
              📍{" "}
              {startup.location ||
                "Not specified"}
            </span>

          </div>
        </div>
      </div>

      {/* =========================
          CONTENT
      ========================= */}

      <div className="startup-details-grid">

        {/* =========================
            LEFT SIDE
        ========================= */}

        <div className="details-main-card">

          <p className="details-label">
            ABOUT THE STARTUP
          </p>

          <h2>
            About{" "}
            {startup.startupName ||
              "Startup"}
          </h2>

          <p className="startup-full-description">
            {startup.description ||
              "No description available."}
          </p>

          {/* =========================
              INFORMATION
          ========================= */}

          <div className="startup-info-grid">

            <div className="info-item">
              <span>Industry</span>

              <strong>
                {startup.industry ||
                  "Not specified"}
              </strong>
            </div>

            <div className="info-item">
              <span>Stage</span>

              <strong>
                {startup.stage ||
                  "Idea"}
              </strong>
            </div>

            <div className="info-item">
              <span>Location</span>

              <strong>
                {startup.location ||
                  "Not specified"}
              </strong>
            </div>

            <div className="info-item">
              <span>Team Size</span>

              <strong>
                {startup.teamSize || 1}
              </strong>
            </div>

            <div className="info-item">
              <span>Founded</span>

              <strong>
                {startup.foundedYear ||
                  "N/A"}
              </strong>
            </div>

            <div className="info-item">
              <span>Status</span>

              <strong>
                {startup.status ||
                  "Active"}
              </strong>
            </div>

          </div>
        </div>

        {/* =========================
            RIGHT SIDE
        ========================= */}

        <div className="details-side">

          {/* =========================
              FUNDING CARD
          ========================= */}

          <div className="funding-card">

            <p className="details-label">
              FUNDING
            </p>

            <span className="funding-title">
              Funding Goal
            </span>

            <h2>{formatRupees(Number(startup.fundingGoal) || 0)}</h2>

            <span className="funding-status">
              {startup.status ||
                "Active"}
            </span>

          </div>

          {canEditStartup && startup?._id && (
            <Link
              to={`/edit-startup/${startup._id}`}
              state={location.state}
              className="website-btn"
            >
              Edit Startup
            </Link>
          )}

          {currentUser && (
            <button
              type="button"
              className={`save-toggle-btn ${saved ? "saved" : ""}`}
              onClick={handleSaveToggle}
              disabled={saving}
            >
              {saving ? "Saving..." : saved ? "♥ Saved" : "♡ Save Startup"}
            </button>
          )}

          {/* =========================
              INVEST BUTTON
          ========================= */}

          <button
            type="button"
            className="invest-now-btn"
            onClick={() =>
              setShowInvestModal(true)
            }
          >
            Invest in{" "}
            {startup.startupName ||
              "Startup"}{" "}
            →
          </button>

          {/* =========================
              WEBSITE
          ========================= */}

          {startup.website && (
            <a
              href={
                startup.website.startsWith(
                  "http"
                )
                  ? startup.website
                  : `https://${startup.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="website-btn"
            >
              Visit Website →
            </a>
          )}

        </div>
      </div>

      {/* =========================
          INVESTMENT MODAL
      ========================= */}

      {showInvestModal && (
        <InvestModal
          startup={startup}
          onClose={() => setShowInvestModal(false)}
          onSuccess={(message) => {
            setInvestmentSuccess(message);
            setShowInvestModal(false);
          }}
        />
      )}

    </div>
  );
}

export default StartupDetailsPage;