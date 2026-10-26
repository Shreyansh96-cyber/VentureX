import { API_ORIGIN } from "../../api/config.js";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getSavedStartups, unsaveStartup } from "../../api/savedStartup";
import { formatRupees } from "../../utils/currency";
import "./SavedStartups.css";

function SavedStartups() {
  const [savedStartups, setSavedStartups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [selectedStartup, setSelectedStartup] =
    useState(null);

  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [investing, setInvesting] = useState(false);

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const userId = currentUser?._id || currentUser?.id;

  // ==========================================
  // LOAD SAVED STARTUPS
  // ==========================================

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchSavedStartups();
  }, [userId]);

  const fetchSavedStartups = async () => {
    try {
      const saved = await getSavedStartups(userId);
      setSavedStartups(saved || []);

    } catch (error) {
      console.error("SAVED STARTUPS LOAD FAILED:", error.response?.status || "network");

      setSavedStartups([]);

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // REMOVE SAVED STARTUP
  // ==========================================

  const removeSavedStartup = async (
    startupId
  ) => {
    try {
      if (!userId) {
        alert("Please login first.");
        return;
      }

      await unsaveStartup(startupId);

      setSavedStartups((previous) =>
        previous.filter(
          (startup) =>
            (startup?._id || startup?.id) !== startupId
        )
      );

    } catch (error) {

      console.error("REMOVE SAVED STARTUP FAILED:", error.response?.status || "network");

      alert(
        error.response?.data?.message ||
          "Unable to remove startup."
      );
    }
  };

  // ==========================================
  // OPEN INVESTMENT MODAL
  // ==========================================

  const openInvestModal = (startup) => {
    setSelectedStartup(startup);
    setAmount("");
    setMessage("");
  };

  // ==========================================
  // CLOSE INVESTMENT MODAL
  // ==========================================

  const closeInvestModal = () => {
    setSelectedStartup(null);
    setAmount("");
    setMessage("");
  };

  // ==========================================
  // SEND INVESTMENT REQUEST
  // ==========================================

  const sendInvestmentRequest = async (
    e
  ) => {
    e.preventDefault();

    try {
      const user = JSON.parse(
        localStorage.getItem("user")
      );

      const investorId =
        user?._id || user?.id;

      if (!investorId) {
        alert(
          "Please login as an investor first."
        );
        return;
      }

      if (
        !amount ||
        Number(amount) <= 0
      ) {
        alert(
          "Please enter a valid investment amount."
        );
        return;
      }

      if (!selectedStartup?._id) {
        alert(
          "Startup information is missing."
        );
        return;
      }

      setInvesting(true);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_ORIGIN}/api/investments`,
        {
          investorId,
          startupId:
            selectedStartup._id,
          amount: Number(amount),
          message,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(
        response.data.message ||
          "Investment request sent successfully!"
      );

      closeInvestModal();

    } catch (error) {

      alert(
        error.response?.data?.message ||
          "Unable to send investment request."
      );

    } finally {
      setInvesting(false);
    }
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredStartups =
    savedStartups.filter((startup) => {

      const name = startup.startupName || startup.name || "";
      const industry = startup.industry || "";
      const description = startup.description || "";

      const searchText =
        search.toLowerCase().trim();

      return (
        name
          ?.toLowerCase()
          .includes(searchText) ||
        industry
          ?.toLowerCase()
          .includes(searchText) ||
        description
          ?.toLowerCase()
          .includes(searchText)
      );
    });

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="saved-page">

      {/* =====================================
          BACK
      ====================================== */}

      <Link
        to="/investor-dashboard"
        className="saved-back"
      >
        ← Back to Dashboard
      </Link>


      {/* =====================================
          HEADER
      ====================================== */}

      <div className="saved-header">

        <div>

          <p>
            SAVED OPPORTUNITIES
          </p>

          <h1>
            Saved Startups
          </h1>

          <span>
            Startups you've saved for later.
          </span>

        </div>


        <div className="saved-count">

          {savedStartups.length}

          <small>
            Saved
          </small>

        </div>

      </div>


      {/* =====================================
          SEARCH
      ====================================== */}

      {!loading &&
        savedStartups.length > 0 && (

          <div className="saved-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search your saved startups..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

        )}


      {/* =====================================
          LOADING
      ====================================== */}

      {loading ? (

        <div className="saved-empty">

          <h2>
            Loading...
          </h2>

          <p>
            Fetching your saved startups.
          </p>

        </div>

      ) : savedStartups.length === 0 ? (

        /* ===================================
           NO SAVED STARTUPS
        ==================================== */

        <div className="saved-empty">

          <div className="saved-icon">
            ♡
          </div>

          <h2>
            No saved startups yet
          </h2>

          <p>
            Discover startups and save the
            ones you're interested in.
          </p>

          <Link
            to="/discover-startups"
            className="discover-btn"
          >
            Discover Startups →
          </Link>

        </div>

      ) : filteredStartups.length === 0 ? (

        /* ===================================
           NO SEARCH RESULTS
        ==================================== */

        <div className="saved-empty">

          <div className="saved-icon">
            🔎
          </div>

          <h2>
            No startups found
          </h2>

          <p>
            Try searching for another
            startup or industry.
          </p>

        </div>

      ) : (

        /* ===================================
           STARTUP GRID
        ==================================== */

        <div className="saved-grid">

          {filteredStartups.map(
            (startup) => (

              <div
                className="saved-card"
                key={startup._id || startup.id}
              >

                {/* CARD TOP */}

                <div className="saved-card-top">

                  <div className="saved-logo">

                    {(startup.startupName || startup.name)
                      ?.charAt(0)
                      .toUpperCase() || "S"}

                  </div>


                  <span className="saved-industry">

                    {startup.industry ||
                      "Startup"}

                  </span>


                  {/* REMOVE BUTTON */}

                  <button
                    type="button"
                    className="remove-saved"
                    onClick={() =>
                      removeSavedStartup(
                        startup._id
                      )
                    }
                    title="Remove from saved"
                  >
                    ♥
                  </button>

                </div>


                {/* NAME */}

                <h2>
                  {startup.startupName || startup.name}
                </h2>


                {/* DESCRIPTION */}

                <p>

                  {startup.description ||
                    "Innovative startup looking for investment."}

                </p>


                {/* FUNDING */}

                <div className="saved-funding">

                  <div>

                    <small>
                      Funding Required
                    </small>

                    <strong>

                      {formatRupees(Number(startup.fundingGoal || startup.funding) || 0)}

                    </strong>

                  </div>


                  <div>

                    <small>
                      Stage
                    </small>

                    <strong>

                      {startup.stage ||
                        "Early Stage"}

                    </strong>

                  </div>

                </div>


                {/* ACTIONS */}

                <div className="saved-actions">

                  <Link
                    to={`/startup/${startup._id || startup.id}`}
                    className="view-startup"
                  >
                    View Startup →
                  </Link>


                  <button
                    type="button"
                    className="invest-startup"
                    onClick={() =>
                      openInvestModal(
                        startup
                      )
                    }
                  >
                    Invest Now
                  </button>

                </div>

              </div>

            )
          )}

        </div>

      )}


      {/* =====================================
          INVESTMENT MODAL
      ====================================== */}

      {selectedStartup && (

        <div
          className="investment-overlay"
          onClick={closeInvestModal}
        >

          <div
            className="investment-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="investment-header">

              <div>

                <p>
                  INVESTMENT OPPORTUNITY
                </p>

                <h2>
                  Invest in{" "}
                  {selectedStartup.startupName || selectedStartup.name}
                </h2>

              </div>


              <button
                type="button"
                className="investment-close"
                onClick={
                  closeInvestModal
                }
              >
                ×
              </button>

            </div>


            {/* STARTUP */}

            <div className="investment-startup">

              <div className="investment-logo">

                {selectedStartup.name
                  ?.charAt(0)
                  .toUpperCase() || "S"}

              </div>

              <div>

                <strong>
                  {selectedStartup.startupName || selectedStartup.name}
                </strong>

                <span>
                  {selectedStartup.industry ||
                    "Startup"}
                </span>

              </div>

            </div>


            {/* FORM */}

            <form
              onSubmit={
                sendInvestmentRequest
              }
            >

              {/* AMOUNT */}

              <label>
                Investment Amount
              </label>

              <div className="investment-amount">

                <span>
                  ₹
                </span>

                <input
                  type="number"
                  min="1"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value
                    )
                  }
                  required
                />

              </div>


              {/* MESSAGE */}

              <label>
                Message to Founder
              </label>

              <textarea
                placeholder="Tell the founder why you're interested in this startup..."
                value={message}
                onChange={(e) =>
                  setMessage(
                    e.target.value
                  )
                }
                rows="5"
              />


              {/* INFO */}

              <div className="investment-info">

                <span>
                  ⓘ
                </span>

                <p>
                  This sends an investment
                  request to the founder.
                  The request will remain
                  pending until the founder
                  responds.
                </p>

              </div>


              {/* BUTTONS */}

              <div className="investment-buttons">

                <button
                  type="button"
                  className="investment-cancel"
                  onClick={
                    closeInvestModal
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="investment-submit"
                  disabled={investing}
                >

                  {investing
                    ? "Sending..."
                    : "Send Investment Request →"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default SavedStartups;