import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyInvestments } from "../../api/investment";
import "./MyInvestments.css";

function MyInvestments() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "null") || {};

  useEffect(() => {
    fetchInvestments();
  }, []);

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
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  };

  const totalRequests = investments.length;

  const pendingCount = investments.filter(
    (investment) => String(investment.status || "").toLowerCase() === "pending"
  ).length;

  const acceptedInvestments = investments.filter(
    (investment) => String(investment.status || "").toLowerCase() === "accepted"
  );

  const acceptedCount = acceptedInvestments.length;

  const totalInvested = acceptedInvestments.reduce(
    (total, investment) => total + Number(investment.amount || 0),
    0
  );

  return (
    <div className="my-investments-page">
      <Link to="/investor-dashboard" className="investments-back">
        ← Back to Dashboard
      </Link>

      <div className="investments-header">
        <div>
          <p className="investments-label">INVESTMENT PORTFOLIO</p>
          <h1>My Investments</h1>
          <p>Track your investment requests and portfolio.</p>
        </div>
      </div>

      <div className="investment-stats">
        <div className="investment-stat">
          <span>Total Requests</span>
          <strong>{totalRequests}</strong>
        </div>

        <div className="investment-stat">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </div>

        <div className="investment-stat">
          <span>Accepted</span>
          <strong>{acceptedCount}</strong>
        </div>

        <div className="investment-stat">
          <span>Portfolio Value</span>
          <strong>₹{totalInvested.toLocaleString("en-IN")}</strong>
        </div>
      </div>

      <div className="investments-container">
        <div className="investments-title">
          <div>
            <p className="investments-label">ACTIVITY</p>
            <h2>Investment Requests</h2>
          </div>
        </div>

        {loading ? (
          <div className="investments-empty">
            <div className="loading-icon">⟳</div>
            <h3>Loading investments...</h3>
            <p>Fetching your investment activity.</p>
          </div>
        ) : investments.length === 0 ? (
          <div className="investments-empty">
            <div className="empty-investment-icon">₹</div>
            <h3>No investments yet</h3>
            <p>You haven't sent any investment requests yet.</p>
            <Link to="/discover-startups" className="discover-investment-btn">
              Discover Startups →
            </Link>
          </div>
        ) : (
          <div className="investment-list">
            {investments.map((investment) => {
              const startupName =
                investment.startupId?.startupName ||
                investment.startupId?.name ||
                "Startup";

              const statusKey = String(investment.status || "Pending").toLowerCase();

              return (
                <div className="investment-card" key={investment._id}>
                  <div className="investment-main">
                    <div className="investment-logo">
                      {startupName.charAt(0).toUpperCase() || "S"}
                    </div>

                    <div className="investment-info">
                      <h3>{startupName}</h3>
                      <span>
                        {investment.startupId?.industry || "Startup"}
                      </span>
                      <p>
                        Requested on {new Date(investment.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="investment-amount">
                    <small>Investment</small>
                    <strong>₹{Number(investment.amount || 0).toLocaleString("en-IN")}</strong>
                  </div>

                  <div className={`investment-status ${statusKey}`}>
                    {statusKey === "pending"
                      ? "Pending"
                      : statusKey === "accepted"
                        ? "Accepted"
                        : "Rejected"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyInvestments;