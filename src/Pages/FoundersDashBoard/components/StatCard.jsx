import "./StatCard.css";

export default function StatCard({
  title,
  value,
  icon,
  change,
}) {
  return (
    <div className="statCard">

      <div className="statTop">

        <div className="statIcon">
          {icon}
        </div>

        {change && (
          <span className="statChange">
            {change}
          </span>
        )}

      </div>

      <h2 className="statValue">
        {value}
      </h2>

      <p className="statTitle">
        {title}
      </p>

    </div>
  );
}