import "./FundingTable.css";

export default function FundingTable({ data }) {
  return (
    <div className="fundingTableContainer">

      <table className="fundingTable">

        <thead>

          <tr>
            <th>Startup</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>

        </thead>

        <tbody>

          {data.map((item) => (
            <tr key={item.id}>

              <td>{item.startup}</td>

              <td>{item.amount}</td>

              <td>
                <span
                  className={`statusBadge ${item.status.toLowerCase()}`}
                >
                  {item.status}
                </span>
              </td>

              <td>{item.date}</td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}