import "./RequestsTable.css";
import { FaCheck, FaTimes } from "react-icons/fa";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { dateStyle: "medium" });
};

export default function RequestsTable({ data, onAccept, onReject, updatingId }) {
  return (
    <div className="requestsTableContainer">
      <table className="requestsTable">
        <thead>
          <tr>
            <th>Startup</th>
            <th>Founder</th>
            <th>Topic</th>
            <th>Date</th>
            <th>Time</th>
            <th>Message</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((request) => (
            <tr key={request.id}>
              <td>{request.startup}</td>
              <td>
                <div className="requesterCell">
                  <strong>{request.founder}</strong>
                  <small>{request.role}</small>
                </div>
              </td>
              <td>{request.category}</td>
              <td>{formatDate(request.date)}</td>
              <td>{request.time}</td>
              <td className="requestMessageCell">{request.message || "No message provided."}</td>
              <td>
                <div className="actionButtons">
                  <button
                    type="button"
                    className="acceptBtn"
                    onClick={() => onAccept(request.id)}
                    disabled={updatingId === request.id}
                  >
                    <FaCheck />
                    {updatingId === request.id ? "Working..." : "Accept"}
                  </button>

                  <button
                    type="button"
                    className="declineBtn"
                    onClick={() => onReject(request.id)}
                    disabled={updatingId === request.id}
                  >
                    <FaTimes />
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}