import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/startup";
import { formatRupees } from "../../utils/currency";
import {
  getSavedStartups,
  saveStartup,
  unsaveStartup,
} from "../../api/savedStartup";
import "./DiscoverStartups.css";

function DiscoverStartups() {
  const navigate = useNavigate();

  const [startups, setStartups] = useState([]);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");
  const [stage, setStage] = useState("All");
  const [fundingGoal, setFundingGoal] = useState("All");
  const [location, setLocation] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedIds, setSavedIds] = useState([]);
  const [savingId, setSavingId] = useState(null);

  const fundingGoalOptions = [
    { label: "All Funding Goals", value: "All" },
    { label: "Below ₹5L", value: "Below 5L" },
    { label: "₹5L - ₹10L", value: "5L - 10L" },
    { label: "₹10L - ₹25L", value: "10L - 25L" },
    { label: "₹25L - ₹50L", value: "25L - 50L" },
    { label: "Above ₹50L", value: "Above 50L" },
  ];

  useEffect(() => {
    fetchStartups();
    fetchSavedStartups();
  }, []);

  const fetchStartups = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/");
      const allStartups = Array.isArray(response.data) ? response.data : [];
      setStartups(allStartups);
    } catch (loadError) {
      console.error("STARTUP LOAD FAILED:", loadError.response?.status || "network");
      setStartups([]);
      setError("Unable to load startups.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedStartups = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const userId = user?._id || user?.id;

      if (!userId) return;

      const saved = await getSavedStartups(userId);
      const ids = Array.isArray(saved)
        ? saved.map((startup) => startup?._id || startup?.id).filter(Boolean)
        : [];

      setSavedIds(ids);
    } catch (savedError) {
      console.error("SAVED STARTUPS LOAD FAILED:", savedError.response?.status || "network");
    }
  };

  const handleSave = async (startupId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const userId = user?._id || user?.id;

      if (!userId) {
        alert("Please login as an investor first.");
        return;
      }

      setSavingId(startupId);

      if (savedIds.includes(startupId)) {
        await unsaveStartup(startupId);
        setSavedIds((previous) => previous.filter((id) => id !== startupId));
      } else {
        await saveStartup(startupId);
        setSavedIds((previous) => [...previous, startupId]);
      }
    } catch (saveError) {
      console.error("SAVE STARTUP FAILED:", saveError.response?.status || "network");
      alert(saveError.response?.data?.message || "Unable to save startup.");
    } finally {
      setSavingId(null);
    }
  };

  const industries = useMemo(
    () => ["All", ...new Set(startups.map((startup) => startup.industry).filter(Boolean))],
    [startups]
  );

  const stages = useMemo(
    () => ["All", ...new Set(startups.map((startup) => startup.stage).filter(Boolean))],
    [startups]
  );

  const locations = useMemo(
    () => ["All", ...new Set(startups.map((startup) => startup.location).filter(Boolean))],
    [startups]
  );

  const clearFilters = () => {
    setSearch("");
    setIndustry("All");
    setStage("All");
    setFundingGoal("All");
    setLocation("All");
    setSortBy("Newest");
  };

  const filteredStartups = useMemo(() => {
    const text = search.trim().toLowerCase();

    let result = startups.filter((startup) => {
      const searchableText = [
        startup.startupName,
        startup.tagline,
        startup.description,
        startup.industry,
        startup.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !text || searchableText.includes(text);
      const matchesIndustry = industry === "All" || startup.industry === industry;
      const matchesStage = stage === "All" || startup.stage === stage;
      const matchesLocation = location === "All" || startup.location === location;

      const fundingAmount = Number(startup.fundingGoal) || 0;
      let matchesFunding = true;

      if (fundingGoal !== "All") {
        if (fundingGoal === "Below 5L") {
          matchesFunding = fundingAmount < 500000;
        } else if (fundingGoal === "5L - 10L") {
          matchesFunding = fundingAmount >= 500000 && fundingAmount <= 1000000;
        } else if (fundingGoal === "10L - 25L") {
          matchesFunding = fundingAmount > 1000000 && fundingAmount <= 2500000;
        } else if (fundingGoal === "25L - 50L") {
          matchesFunding = fundingAmount > 2500000 && fundingAmount <= 5000000;
        } else if (fundingGoal === "Above 50L") {
          matchesFunding = fundingAmount > 5000000;
        }
      }

      return matchesSearch && matchesIndustry && matchesStage && matchesLocation && matchesFunding;
    });

    switch (sortBy) {
      case "Oldest":
        result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case "Startup Name A-Z":
        result.sort((a, b) => (a.startupName || "").localeCompare(b.startupName || "", undefined, { sensitivity: "base" }));
        break;
      case "Startup Name Z-A":
        result.sort((a, b) => (b.startupName || "").localeCompare(a.startupName || "", undefined, { sensitivity: "base" }));
        break;
      case "Funding Goal: Low to High":
        result.sort((a, b) => (Number(a.fundingGoal) || 0) - (Number(b.fundingGoal) || 0));
        break;
      case "Funding Goal: High to Low":
        result.sort((a, b) => (Number(b.fundingGoal) || 0) - (Number(a.fundingGoal) || 0));
        break;
      case "Newest":
      default:
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }

    return result;
  }, [startups, search, industry, stage, fundingGoal, location, sortBy]);

  const resultLabel = filteredStartups.length === 1 ? "Startup" : "Startups";

  return (
    <div className="discover-page">

      {/* ================================
          HEADER
      ================================= */}

      <div className="discover-header">

        <div className="discover-header-content">

          <p className="discover-label">
            VENTUREX MARKETPLACE
          </p>

          <h1>
            Discover Startups
          </h1>

          <p className="discover-subtitle">
            Find innovative startups and discover
            your next investment opportunity.
          </p>

        </div>

        {/* ================================
            HEADER RIGHT
        ================================= */}

        <div className="discover-header-right">

          <button
            type="button"
            className="back-to-dashboard-btn"
            onClick={() => navigate("/dashboard")}
          >
            ← Founder Dashboard
          </button>

          <div className="startup-count">
            <strong>
              {filteredStartups.length}
            </strong>

            <span>
              {resultLabel}
            </span>
          </div>

        </div>

      </div>

      <div className="discover-controls">
        <div className="search-box">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search startups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
            {industries.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Industries" : item}
              </option>
            ))}
          </select>

          <select value={stage} onChange={(e) => setStage(e.target.value)}>
            {stages.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Stages" : item}
              </option>
            ))}
          </select>

          <select value={fundingGoal} onChange={(e) => setFundingGoal(e.target.value)}>
            {fundingGoalOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            {locations.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Locations" : item}
              </option>
            ))}
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
            <option value="Startup Name A-Z">Startup Name A-Z</option>
            <option value="Startup Name Z-A">Startup Name Z-A</option>
            <option value="Funding Goal: Low to High">Funding Goal: Low to High</option>
            <option value="Funding Goal: High to Low">Funding Goal: High to Low</option>
          </select>

          <button type="button" className="clear-filters-btn" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      <p className="discover-results-count">
        {loading
          ? "Loading results..."
          : error
            ? "0 Startups"
            : `${filteredStartups.length} ${filteredStartups.length === 1 ? "Startup" : "Startups"}`}
      </p>

      {loading ? (

        <div className="discover-message">

          <h3>
            Loading startups...
          </h3>

          <p>
            Finding opportunities for you.
          </p>

        </div>

      ) : error ? (

        <div className="discover-message">

          <div className="empty-search-icon">⚠️</div>

          <h3>
            Unable to load startups.
          </h3>

          <p>
            Please try again.
          </p>

          <button type="button" className="retry-button" onClick={fetchStartups}>
            Retry
          </button>

        </div>

      ) : filteredStartups.length === 0 ? (

        <div className="discover-message">

          <div className="empty-search-icon">
            🔎
          </div>

          <h3>
            No startups found
          </h3>

          <p>
            Try changing your search or filters.
          </p>

          <button type="button" className="retry-button" onClick={clearFilters}>
            Clear Filters
          </button>

        </div>

      ) : (

        <div className="startup-grid">

          {filteredStartups.map(
            (startup) => {

              const isSaved =
                savedIds.includes(
                  startup._id
                );

              const isSaving =
                savingId === startup._id;

              return (

                <div
                  className="discover-startup-card"
                  key={startup._id}
                >

                  {/* CARD TOP */}

                  <div className="startup-card-top">

                    <div className="startup-avatar">

                      {startup.startupName
                        ? startup.startupName
                            .charAt(0)
                            .toUpperCase()
                        : "S"}

                    </div>

                    <button
                      type="button"
                      className={`save-button ${
                        isSaved ? "saved" : ""
                      }`}
                      onClick={() =>
                        handleSave(
                          startup._id
                        )
                      }
                      disabled={isSaving}
                    >

                      {isSaving
                        ? "..."
                        : isSaved
                        ? "♥"
                        : "♡"}

                    </button>

                  </div>


                  {/* NAME */}

                  <h2>
                    {startup.startupName ||
                      "Unnamed Startup"}
                  </h2>


                  {/* INDUSTRY */}

                  <div className="industry-tag">
                    {startup.industry ||
                      "Startup"}
                  </div>


                  {/* DESCRIPTION */}

                  <p className="startup-description">
                    {startup.description ||
                      "An innovative startup building solutions for the future."}
                  </p>


                  {/* FUNDING */}

                  <div className="funding-info">

                    <div>

                      <span>
                        Funding Required
                      </span>

                      <strong>
                        {formatRupees(Number(startup.fundingGoal) || 0)}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Stage
                      </span>

                      <strong>
                        {startup.stage ||
                          "Early Stage"}
                      </strong>

                    </div>

                  </div>


                  {/* FOOTER */}

                  <div className="startup-card-footer">

                    <span>
                      📍{" "}
                      {startup.location ||
                        "India"}
                    </span>

                    <Link
                      to={`/startup/${startup._id}`}
                      state={{
                        from: "discover-startups",
                      }}
                    >
                      View Startup →
                    </Link>

                  </div>

                </div>

              );
            }
          )}

        </div>

      )}

    </div>
  );
}

export default DiscoverStartups;