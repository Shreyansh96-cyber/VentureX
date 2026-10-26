import { API_ORIGIN } from "../../../api/config.js";
import React, { useState } from "react";
import axios from "axios";
import { formatRupees } from "../../../utils/currency";
import "./InvestModal.css";

function InvestModal({ startup, onClose, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL =
    API_ORIGIN;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const investorId = user?._id || user?.id;

    if (!investorId) {
      setError("Please log in as an investor before making an investment.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    if (!startup?._id) {
      setError("Startup information is missing.");
      return;
    }

    if (amount === "" || amount === null) {
      setError("Please enter an investment amount.");
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Investment amount must be greater than 0.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_URL}/api/investments`,
        {
          investorId,
          startupId: startup._id,
          amount: numericAmount,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAmount("");

      if (onSuccess) {
        onSuccess(response.data.message || "Investment request submitted successfully.");
      } else {
        onClose();
      }
    } catch (submitError) {
      setError(
        submitError.response?.data?.message ||
          "Unable to send investment request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invest-modal-overlay" onClick={onClose}>
      <div className="invest-modal" onClick={(e) => e.stopPropagation()}>
        <div className="invest-modal-header">
          <div>
            <p className="modal-label">INVESTMENT OPPORTUNITY</p>
            <h2>Invest in {startup?.startupName || "Startup"}</h2>
          </div>

          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-startup-info">
          <div className="modal-startup-avatar">
            {startup?.startupName?.charAt(0).toUpperCase() || "S"}
          </div>

          <div>
            <strong>{startup?.startupName || "Startup"}</strong>
            <span>{startup?.industry || "Startup"}</span>
          </div>
        </div>

        <div className="modal-funding-row">
          <span>Funding Goal</span>
          <strong>{formatRupees(Number(startup?.fundingGoal) || 0)}</strong>
        </div>

        {error && <div className="modal-validation-error">{error}</div>}

        <form onSubmit={handleSubmit} className="investment-form">
          <label>Investment Amount</label>

          <div className="amount-input">
            <span>₹</span>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="investment-note">
            <span>ⓘ</span>
            <p>
              This sends a funding request to the founder. Your request remains
              pending until the founder reviews it.
            </p>
          </div>

          <div className="investment-actions">
            <button
              type="button"
              className="cancel-invest"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button type="submit" className="submit-invest" disabled={loading}>
              {loading ? "Sending..." : "Confirm Investment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InvestModal;