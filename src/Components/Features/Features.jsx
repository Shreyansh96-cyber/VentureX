import "./Features.css";

const features = [
  {
    title: "Startup Discovery",
    description:
      "Explore innovative startups across multiple industries and connect with founders."
  },
  {
    title: "Find Investors",
    description:
      "Reach verified angel investors and venture capitalists looking for opportunities."
  },
  {
    title: "Expert Mentorship",
    description:
      "Book sessions with experienced entrepreneurs and industry professionals."
  },
  {
    title: "Growth Dashboard",
    description:
      "Track startup progress, investments, mentoring sessions and business growth."
  }
];

function Features() {
  return (
    <section className="features" id="features">

      <div className="features-header">

        <span>WHY VENTUREX</span>

        <h2>Everything your startup needs.</h2>

        <p>
          VentureX brings founders, investors and mentors together
          on one powerful platform.
        </p>

      </div>

      <div className="feature-grid">

        {features.map((item, index) => (

          <div className="feature-card" key={index}>

            <div className="feature-number">
              0{index + 1}
            </div>

            <h3>{item.title}</h3>

            <p>{item.description}</p>

          </div>

        ))}

      </div>

    </section>
  );
}

export default Features;