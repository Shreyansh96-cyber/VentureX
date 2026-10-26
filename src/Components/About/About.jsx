import "./About.css";

function About() {
  return (
    <section id="about" className="about">

      {/* Your About Content */}


      <div className="aboutLeft">

        <span>ABOUT US</span>

        <h2>

          One Platform.

          <br />

          Endless Startup Opportunities.

        </h2>

        <p>

          VentureX is an all-in-one startup ecosystem where founders,
          investors and mentors come together to build successful
          businesses.

        </p>

        <p>

          Whether you're launching your first startup, looking for
          funding, or mentoring the next generation of entrepreneurs,
          VentureX provides the tools and connections you need.

        </p>

        <button>

          Learn More →

        </button>

      </div>

      <div className="aboutRight">

        <div className="aboutCard">

          <h3>Our Mission</h3>

          <p>

            Empower every entrepreneur by making funding,
            mentorship and networking accessible in one place.

          </p>

        </div>

        <div className="aboutCard">

          <h3>Our Vision</h3>

          <p>

            Become India's most trusted platform for startups,
            investors and innovators.

          </p>

        </div>

      </div>

    </section>

  );
}

export default About;