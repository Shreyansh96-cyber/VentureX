import "./StatCard.css";

export default function StatCard({
  title,
  value,
  icon: Icon,
  color,
}) {
  return (
    <div className="mentorStatCard">

      <div
        className="statIcon"
        style={{ background: color }}
      >
        <Icon />
      </div>

      <div>

        <p>{title}</p>

        <h2>{value}</h2>

      </div>

    </div>
  );
}