import "./Explore.css";

function Explore() {

  const options = [

    {
      title: "Explore Startups",
      description: "Discover innovative startups seeking funding and partnerships.",
      color: "#2563EB"
    },

    {
      title: "Find Investors",
      description: "Connect with verified angel investors and venture capital firms.",
      color: "#10B981"
    },

    {
      title: "Find Mentors",
      description: "Learn from experienced founders and industry experts.",
      color: "#8B5CF6"
    },

    {
      title: "Find Co-Founders",
      description: "Meet talented people to build your next startup together.",
      color: "#F59E0B"
    },

    {
      title: "Startup Events",
      description: "Stay updated with hackathons, networking events and workshops.",
      color: "#EC4899"
    }

  ];

  return (

    <section className="explore" id="explore">

      <div className="exploreTitle">

        <span>EXPLORE</span>

        <h2>

          Explore <span>VentureX</span>

        </h2>

        <p>

          Discover opportunities. Build connections. Grow together.

        </p>

      </div>

      <div className="exploreContainer">

        <div className="exploreLeft">

          {options.map((item,index)=>(

            <div
              className="exploreItem"
              key={index}
              style={{borderLeft:`6px solid ${item.color}`}}
            >

              <div>

                <h3>{item.title}</h3>

                <p>{item.description}</p>

              </div>

              <button
                style={{background:item.color}}
              >

                →

              </button>

            </div>

          ))}

        </div>

        <div className="exploreRight">

          <div className="quoteCard">

            <h3>

              Build.
              <br/>
              Fund.
              <br/>
              Grow.

            </h3>

            <p>

              VentureX empowers founders by connecting them with investors, mentors, and the right opportunities—all in one platform.

            </p>

          </div>

        </div>

      </div>

    </section>

  );

}

export default Explore;