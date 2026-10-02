import "./WelcomeCard.css";
import { useNavigate } from "react-router-dom";

export default function WelcomeCard() {

  const navigate = useNavigate();

  return (
    <div className="welcomeCard">

      <div className="welcomeContent">

        <span className="welcomeTag">
          🚀 VentureX Founder
        </span>

        <h2>
          Welcome back,
          <br />
          Keep building your dream startup.
        </h2>

        <p>
          Manage your startups, connect with investors,
          book mentor sessions and track funding progress —
          all from one dashboard.
        </p>

        <button
          className="createStartupBtn"
          onClick={() => navigate("/create-startup")}
        >
          + Create Startup
        </button>

      </div>

      <div className="welcomeGraphic">

        <div className="glassCircle circleOne"></div>
        <div className="glassCircle circleTwo"></div>
        <div className="glassCircle circleThree"></div>

        <div className="rocketCard">

          <div className="rocketEmoji">
            🚀
          </div>

          <h3>Startup Growth</h3>

          <p>
            Track funding, mentors
            and investor activity.
          </p>

        </div>

      </div>

    </div>
  );
}