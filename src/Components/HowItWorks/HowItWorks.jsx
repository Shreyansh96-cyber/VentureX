import "./HowItWorks.css";

const steps = [
  {
    number: "01",
    title: "Build Your Startup",
    text: "Create your startup profile, showcase your idea, upload pitch details and introduce your vision."
  },
  {
    number: "02",
    title: "Connect & Raise Funding",
    text: "Get discovered by investors, receive funding requests and build meaningful business relationships."
  },
  {
    number: "03",
    title: "Grow with Mentors",
    text: "Book mentorship sessions, receive expert guidance and scale your startup with confidence."
  }
];

function HowItWorks() {
  return (
    <section className="howItWorks" id="how">

      <div className="how-header">

        <span>HOW IT WORKS</span>

        <h2>Three simple steps.</h2>

        <p>
          VentureX simplifies the startup journey by bringing founders,
          investors and mentors together on one platform.
        </p>

      </div>

      <div className="timeline">

        {steps.map((step, index) => (

          <div className="timeline-card" key={index}>

            <div className="step-number">
              {step.number}
            </div>

            <div className="step-content">

              <h3>{step.title}</h3>

              <p>{step.text}</p>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}

export default HowItWorks;