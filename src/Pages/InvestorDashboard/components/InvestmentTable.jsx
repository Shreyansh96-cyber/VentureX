import "./InvestmentTable.css";

export default function InvestmentTable({ data }) {
  return (
    <div className="investmentTable">

      <div className="tableHeader">

        <span>Startup</span>
        <span>Amount</span>
        <span>Status</span>
        <span>Date</span>

      </div>

      {data.map((item) => (
        <div className="tableRow" key={item.id}>

          <span className="startupName">
            {item.startup}
          </span>

          <span>{item.amount}</span>

          <span
            className={`status ${
              item.status === "Active"
                ? "active"
                : "completed"
            }`}
          >
            {item.status}
          </span>

          <span>{item.date}</span>

        </div>
      ))}

    </div>
  );
}