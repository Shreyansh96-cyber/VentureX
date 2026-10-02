import "./WhyChoose.css";

const features = [
  {
    title: "AI Startup Matching",
    description:
      "Smart recommendations connect founders with the most relevant investors and mentors.",
    color: "#2563EB"
  },
  {
    title: "Verified Investors",
    description:
      "Browse trusted investors who are actively looking for innovative startups.",
    color: "#10B981"
  },
  {
    title: "Expert Mentorship",
    description:
      "Book one-on-one sessions with successful entrepreneurs and industry experts.",
    color: "#8B5CF6"
  },
  {
    title: "Startup Community",
    description:
      "Collaborate, network and grow with founders from across the country.",
    color: "#F59E0B"
  },
  {
    title: "Funding Dashboard",
    description:
      "Track investments, funding requests and startup growth from one place.",
    color: "#06B6D4"
  },
  {
    title: "Secure Platform",
    description:
      "Your startup data is protected with modern security and verified accounts.",
    color: "#EF4444"
  }
];

function WhyChoose() {
  return (
    <section className="whyChoose">

      <div className="whyHeader">

        <span>WHY VENTUREX</span>

        <h2>
          Built for Founders.
          <br />
          Designed for Growth.
        </h2>

        <p>
          Everything you need to launch, fund and scale your startup—
          all from one modern platform.
        </p>

      </div>

      <div className="whyGrid">

        {features.map((item, index) => (

          <div
            className="whyCard"
            key={index}
          >

            <div
              className="iconCircle"
              style={{ background: item.color }}
            >
              {index + 1}
            </div>

            <h3>{item.title}</h3>

            <p>{item.description}</p>

            <button>
              Learn More →
            </button>

          </div>

        ))}

      </div>

    </section>
  );
}

export default WhyChoose;