import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSavedStartups } from "../../api/savedStartup";
import { getMyInvestments } from "../../api/investment";
import { getProfileImageUrl } from "../../api/profile";
import NotificationBell from "../../Components/Notifications/NotificationBell";
import HomeButton from "../../Components/HomeButton";
import "./InvestorDashboard.css";

function InvestorDashboard() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const profileInitials = user.name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "VX";

  const [investments, setInvestments] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvestments();
    fetchSavedCount();
  }, [user?._id, user?.id]);

  const fetchSavedCount = async () => {
    try {
      const investorId = user?._id || user?.id;

      if (!investorId) {
        setSavedCount(0);
        return;
      }

      const saved = await getSavedStartups(investorId);
      setSavedCount(Array.isArray(saved) ? saved.length : 0);
    } catch (error) {
      console.error("SAVED STARTUPS LOAD FAILED:", error.response?.status || "network");
      setSavedCount(0);
    }
  };

  const fetchInvestments = async () => {
    try {
      const investorId = user?._id || user?.id;

      if (!investorId) {
        setLoading(false);
        return;
      }

      const result = await getMyInvestments();
      setInvestments(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("INVESTMENT LOAD FAILED:", error.response?.status || "network");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // INVESTMENT STATISTICS
  // -----------------------------

  const investmentRequests = investments.length;

  const activeInvestments = investments.filter(
    (investment) =>
      investment.status === "accepted"
  );

  const activeInvestmentCount =
    activeInvestments.length;

  const portfolioValue =
    activeInvestments.reduce(
      (total, investment) =>
        total + Number(investment.amount || 0),
      0
    );

  // -----------------------------
  // RECENT ACTIVITY
  // -----------------------------

  const recentInvestments =
    investments.slice(0, 5);

  return (
    <div className="investor-dashboard">

      {/* TOP BAR */}

      <div className="investor-top">

        <div>

          <p className="small-text">
            INVESTOR DASHBOARD
          </p>

          <h1>
            Welcome back,{" "}
            {user.name || "Investor"}
          </h1>

          <p className="dashboard-subtitle">
            Discover promising startups and
            find your next investment opportunity.
          </p>

        </div>

        <div className="investor-top-actions">
          <HomeButton />
          <NotificationBell />
          <Link
            to="/profile"
            className="investor-profile-avatar"
            aria-label="My profile"
            title="My profile"
          >
            {user.profileImage ? (
              <img
                src={getProfileImageUrl(user.profileImage)}
                alt=""
                onError={(event) => { event.currentTarget.style.display = "none"; }}
              />
            ) : (
              <span>{profileInitials}</span>
            )}
          </Link>
        </div>

      </div>


      {/* STATS */}

      <div className="investor-stats">

        {/* SAVED */}

        <div className="investor-stat-card stat-saved">

          <span className="stat-icon" aria-hidden="true">♡</span>
          <div className="stat-card-top"><span>
            Saved Startups
          </span></div>

          <strong>
            {savedCount}
          </strong>

          <p>
            Startups you're interested in
          </p>

        </div>


        {/* INVESTMENT REQUESTS */}

        <div className="investor-stat-card stat-requests">

          <span className="stat-icon" aria-hidden="true">↗</span>
          <div className="stat-card-top"><span>
            Investment Requests
          </span></div>

          <strong>
            {investmentRequests}
          </strong>

          <p>
            Requests you've sent
          </p>

        </div>


        {/* ACTIVE INVESTMENTS */}

        <div className="investor-stat-card stat-active">

          <span className="stat-icon" aria-hidden="true">◈</span>
          <div className="stat-card-top"><span>
            Active Investments
          </span></div>

          <strong>
            {activeInvestmentCount}
          </strong>

          <p>
            Your accepted investments
          </p>

        </div>


        {/* PORTFOLIO VALUE */}

        <div className="investor-stat-card stat-portfolio" id="portfolio-value">

          <span className="stat-icon" aria-hidden="true">₹</span>
          <div className="stat-card-top"><span>
            Portfolio Value
          </span></div>

          <strong>
            ₹
            {portfolioValue.toLocaleString(
              "en-IN"
            )}
          </strong>

          <p>
            Total invested amount
          </p>

        </div>

      </div>


      {/* DISCOVER SECTION */}

      <div className="discover-section">

        <div className="section-heading">

          <div>

            <p className="small-text">
              EXPLORE
            </p>

            <h2>
              Discover Startups
            </h2>

            <p>
              Explore innovative businesses
              looking for funding.
            </p>

          </div>

          <Link
            to="/discover-startups"
            className="view-all-btn"
          >
            View All →
          </Link>

        </div>


        {/* STARTUP CARDS */}

        <div className="startup-preview">

          <div className="startup-preview-card opportunity-card">

            <div className="startup-logo">
              V
            </div>

            <div className="startup-info">

              <h3>
                Discover your next opportunity
              </h3>

              <p>
                Find startups across different
                industries, stages and funding
                requirements.
              </p>

              <Link to="/discover-startups">
                Explore Startups →
              </Link>

            </div>

          </div>


          <div className="startup-preview-card portfolio-card">

            <div className="startup-logo">
              +
            </div>

            <div className="startup-info">

              <h3>
                Build your portfolio
              </h3>

              <p>
                Save interesting startups and
                keep track of your investment
                opportunities.
              </p>

              <Link to="/saved-startups">
                View Saved →
              </Link>

            </div>

          </div>

        </div>

      </div>


      {/* BOTTOM GRID */}

      <div className="investor-bottom">


        {/* RECENT ACTIVITY */}

        <div className="activity-card">

          <div className="card-heading">

            <div>

              <p className="small-text">
                ACTIVITY
              </p>

              <h2>
                Recent Investment Activity
              </h2>

            </div>

            <Link
              to="/investments"
              className="view-all-btn"
            >
              View All →
            </Link>

          </div>


          {loading ? (

            <div className="empty-state">

              <h3>
                Loading investments...
              </h3>

            </div>

          ) : recentInvestments.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                ↗
              </div>

              <h3>
                No investment activity yet
              </h3>

              <p>
                Start exploring promising startups and make your first investment.
              </p>

              <Link
                to="/discover-startups"
                className="view-all-btn"
              >
                Discover Startups →
              </Link>

            </div>

          ) : (

            <div className="investment-activity-list">

              {recentInvestments.map(
                (investment) => (

                  <div
                    className="investment-activity-item"
                    key={investment._id}
                  >

                    <div className="activity-main">

                      <strong>
                        {investment.startupId?.name ||
                          "Startup"}
                      </strong>

                      <p className="activity-amount">
                        ₹
                        {Number(
                          investment.amount || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>

                    </div>


                    <div className="activity-meta">
                      <span className={`investment-status ${String(investment.status || "pending").toLowerCase()}`}>
                        {investment.status || "Pending"}
                      </span>
                      {investment.createdAt && !Number.isNaN(new Date(investment.createdAt).getTime()) && (
                        <time dateTime={investment.createdAt}>{new Date(investment.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</time>
                      )}
                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>


        {/* QUICK ACTIONS */}

        <div className="quick-card">

          <p className="small-text">
            QUICK ACTIONS
          </p>

          <h2>
            What would you like to do?
          </h2>


          <Link
            to="/discover-startups"
            className="quick-action"
          >

            <span className="quick-icon">
              🔎
            </span>

            <div>

              <strong>
                Discover Startups
              </strong>

              <small>
                Find your next opportunity
              </small>

            </div>

            <b>
              →
            </b>

          </Link>


          <Link
            to="/saved-startups"
            className="quick-action"
          >

            <span className="quick-icon">
              ♡
            </span>

            <div>

              <strong>
                Saved Startups
              </strong>

              <small>
                View startups you've saved
              </small>

            </div>

            <b>
              →
            </b>

          </Link>


          <Link
            to="/investments"
            className="quick-action"
          >

            <span className="quick-icon">
              ₹
            </span>

            <div>

              <strong>
                My Investments
              </strong>

              <small>
                Track your investment requests
              </small>

            </div>

            <b>
              →
            </b>

          </Link>

        </div>

      </div>

    </div>
  );
}

export default InvestorDashboard;
