import "./ActivityList.css";
import {
  FaCheckCircle,
  FaStar,
  FaCalendarAlt,
  FaCommentDots,
} from "react-icons/fa";

export default function ActivityList({ data }) {
  const getIcon = (title) => {
    const text = title.toLowerCase();

    if (text.includes("completed")) return <FaCheckCircle />;
    if (text.includes("review")) return <FaStar />;
    if (text.includes("request")) return <FaCalendarAlt />;

    return <FaCommentDots />;
  };

  return (
    <div className="activityList">

      {data.map((activity) => (

        <div
          className="activityItem"
          key={activity.id}
        >

          <div className="activityIcon">
            {getIcon(activity.title)}
          </div>

          <div className="activityContent">

            <h4>{activity.title}</h4>

            <span>{activity.time}</span>

          </div>

        </div>

      ))}

    </div>
  );
}