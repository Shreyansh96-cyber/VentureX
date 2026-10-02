import "./StatCard.css";

export default function StatCard({ stat }) {
  return (
    <div className="investorStatCard">

      <div className="statTop">

        <div className="statIcon">
          {stat.icon}
        </div>

        <span className="statChange">
          {stat.change}
        </span>

      </div>

      <h2>{stat.value}</h2>

      <p>{stat.title}</p>

    </div>
  );
}