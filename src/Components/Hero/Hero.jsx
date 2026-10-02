import "./Hero.css";
import heroImg from "../../assets/hero.png";
import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();
  
  return (
    <section className="hero" id="hero">

      <div className="hero-left">

        <span className="hero-tag">
          🚀 India's Smart Startup Ecosystem
        </span>

        <h1>
          Build.
          <br />
          <span>Fund.</span>
          <br />
          Grow.
        </h1>

        <p>
          VentureX connects founders, investors and mentors into one
          intelligent platform that helps startups launch, raise funding
          and grow faster than ever.
        </p>

        <div className="hero-buttons">

          <button
          className="primary-btn"
          onClick={() => navigate("/register")}
          >
          Get Started
          </button>
          <button
          className="secondary-btn"
          onClick={() => navigate("/discover-startups")}
          >
          Explore Startups
          </button>

        </div>

      </div>

      <div className="hero-right">

        <img src={heroImg} alt="Hero" />

      </div>

    </section>
  );
}

export default Hero;