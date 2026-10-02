import "./WelcomeBanner.css";

export default function WelcomeBanner() {
  return (
    <div className="investorWelcome">

      <div className="welcomeContent">

        <span className="welcomeTag">
          💼 Investor Dashboard
        </span>

        <h1>
          Welcome back,
          <span> Rahul Mehta</span>
        </h1>

        <p>
          Discover promising startups, manage your investments,
          and grow your portfolio with VentureX.
        </p>

        <div className="welcomeButtons">

          <button className="primaryBtn">
            Discover Startups
          </button>

          <button className="secondaryBtn">
            My Investments
          </button>

        </div>

      </div>

      <div className="welcomeIllustration">

        <div className="floatingCircle circleOne"></div>
        <div className="floatingCircle circleTwo"></div>
        <div className="floatingCircle circleThree"></div>

        <div className="investmentCard">

          <h3>Portfolio Value</h3>

          <h2>₹12.5 Cr</h2>

          <span>+18.5% this year 📈</span>

        </div>

      </div>

    </div>
  );
}