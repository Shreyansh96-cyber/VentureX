import "./NotificationList.css";

export default function NotificationList({ data }) {
  return (
    <div>

      {data.map((item) => (

        <div
          className="notificationItem"
          key={item.id}
        >
          <span className="notificationIcon">
            {item.icon}
          </span>

          <div>

            <h4>{item.title}</h4>

            <p>{item.time}</p>

          </div>

        </div>

      ))}

    </div>
  );
}