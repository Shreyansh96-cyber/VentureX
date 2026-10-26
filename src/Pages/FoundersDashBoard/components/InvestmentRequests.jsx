import { API_ORIGIN } from "../../../api/config.js";
import { useEffect, useState } from "react";
import axios from "axios";
import "./InvestmentRequests.css";

const API_URL = API_ORIGIN;

export default function InvestmentRequests({ founderId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchRequests = async () => {
      const token = localStorage.getItem("token");

      if (!founderId || !token) {
        setError("Please sign in again to view investment requests.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/api/investments/founder/${founderId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const loadedRequests = Array.isArray(response.data) ? response.data : [];

        if (active) {
          setRequests(loadedRequests);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load investment requests. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchRequests();

    return () => {
      active = false;
    };
  }, [founderId]);

  const updateStatus = async (investmentId, status) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    setUpdatingId(investmentId);
    setError("");

    try {
      const response = await axios.put(
        `${API_URL}/api/investments/${investmentId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedStatus = response.data?.investment?.status || status;

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request._id === investmentId
            ? { ...request, status: updatedStatus }
            : request
        )
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to update this investment request. Please try again."
      );
    } finally {
      setUpdatingId("");
    }
  };

  if (loading) {
    return <p className="investmentRequestsMessage">Loading investment requests...</p>;
  }

  return (
    <div className="investmentRequests">
      {error && <p className="investmentRequestsError" role="alert">{error}</p>}

      {requests.length === 0 ? (
        <p className="investmentRequestsMessage">
          No investment requests have been received yet.
        </p>
      ) : (
        <div className="investmentRequestsTableWrap">
          <table className="investmentRequestsTable">
            <thead>
              <tr>
                <th>Investor</th>
                <th>Startup</th>
                <th>Amount</th>
                <th>Request Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => {
                const status = String(request.status || "Pending");
                const statusClass = status.toLowerCase();
                const requestDate = request.createdAt
                  ? new Date(request.createdAt).toLocaleDateString("en-IN")
                  : "Date unavailable";

                return (
                  <tr key={request._id}>
                    <td>
                      <span className="investmentRequestName">
                        {request.investorId?.name || "Investor"}
                      </span>
                      {request.investorId?.email && (
                        <span className="investmentRequestEmail">
                          {request.investorId.email}
                        </span>
                      )}
                    </td>
                    <td>{request.startupId?.startupName || "Startup"}</td>
                    <td className="investmentRequestAmount">
                      ₹{Number(request.amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td>{requestDate}</td>
                    <td>
                      <span className={`investmentRequestStatus ${statusClass}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      {status.toLowerCase() === "pending" ? (
                        <div className="investmentRequestActions">
                          <button
                            type="button"
                            className="investmentRequestAccept"
                            disabled={updatingId === request._id}
                            onClick={() => updateStatus(request._id, "Accepted")}
                          >
                            {updatingId === request._id ? "Updating..." : "Accept"}
                          </button>
                          <button
                            type="button"
                            className="investmentRequestReject"
                            disabled={updatingId === request._id}
                            onClick={() => updateStatus(request._id, "Rejected")}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="investmentRequestNoAction">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}