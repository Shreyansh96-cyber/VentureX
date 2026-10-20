import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import startupAPI from "../api/startup";
import { getFounderDashboardStats } from "../api/dashboard";
import { getInvestors } from "../api/investor";
import { getMentors } from "../api/mentor";
import { getMentorSessions } from "../api/mentorSession";
import { getSavedStartups } from "../api/savedStartup";
import { getMyInvestments } from "../api/investment";
import { formatRupees } from "../utils/currency";
import Navbar from "../Components/Navbar/Navbar";
import Hero from "../Components/Hero/Hero";
import Features from "../Components/Features/Features";
import HowItWorks from "../Components/HowItWorks/HowItWorks";
import Explore from "../Components/Explore/Explore";
import WhyChoose from "../Components/WhyChoose/WhyChoose";
import About from "../Components/About/About";
import Contact from "../Components/Contact/Contact";
import Footer from "../Components/Footer/Footer";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const loadRoleData = async (role, userId) => {
  const requests = role === "Founder"
    ? [getFounderDashboardStats(), getInvestors(), getMentors()]
    : role === "Investor"
      ? [startupAPI.get("/"), getSavedStartups(userId), getMyInvestments()]
      : [getMentorSessions(userId), startupAPI.get("/")];
  const results = await Promise.allSettled(requests);
  const value = (index, fallback) => results[index].status === "fulfilled"
    ? results[index].value
    : fallback;

  if (role === "Founder") {
    return {
      stats: value(0, null),
      investors: value(1, []),
      mentors: value(2, []),
      failed: results.some((result) => result.status === "rejected"),
      fatal: results.every((result) => result.status === "rejected"),
    };
  }

  if (role === "Investor") {
    return {
      startups: value(0, { data: [] }).data || [],
      saved: value(1, []),
      investments: value(2, []),
      failed: results.some((result) => result.status === "rejected"),
      fatal: results.every((result) => result.status === "rejected"),
    };
  }

  return {
    sessions: value(0, []),
    startups: value(1, { data: [] }).data || [],
    failed: results.some((result) => result.status === "rejected"),
    fatal: results.every((result) => result.status === "rejected"),
  };
};

const DataCard = ({ number, title, description, to }) => {
  const content = (
    <>
      <div className="feature-number">{number}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </>
  );

  return to
    ? <Link className="feature-card" to={to}>{content}</Link>
    : <article className="feature-card">{content}</article>;
};

function PersonalizedHome({ user }) {
  const navigate = useNavigate();
  const role = user.role;
  const userId = user._id || user.id;
  const firstName = user.name?.trim()?.split(/\s+/)[0] || role;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadRoleData(role, userId)
      .then((result) => { if (active) setData(result); })
      .catch(() => { if (active) setData({ fatal: true }); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [role, userId, attempt]);

  const founder = role === "Founder";
  const investor = role === "Investor";
  const sessions = data?.sessions || [];
  const pending = sessions.filter((session) => session.status === "Pending");
  const upcoming = sessions.filter((session) => {
    const date = new Date(session.requestedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return session.status === "Accepted" && !Number.isNaN(date.getTime()) && date >= today;
  });
  const acceptedInvestments = (data?.investments || []).filter(
    (investment) => String(investment.status).toLowerCase() === "accepted"
  );
  const portfolioValue = acceptedInvestments.reduce(
    (total, investment) => total + Number(investment.amount || 0), 0
  );
  const funding = data?.stats?.funding || {};
  const metrics = founder
    ? [
        ["01", "Your startups", data?.stats?.totalStartups ?? 0, "/my-startups"],
        ["02", "Funding progress", `${formatRupees(funding.raisedAmount || 0)} raised of ${formatRupees(funding.fundingGoal || 0)}`, "/funding-analytics"],
        ["03", "Investment requests", data?.stats?.investmentRequests ?? 0, "/funding-analytics"],
        ["04", "Investor connections", data?.stats?.interestedInvestors ?? 0, "/my-startups"],
      ]
    : investor
      ? [
          ["01", "Recommended startups", data?.startups?.length ?? 0, "/discover-startups"],
          ["02", "Saved startups", data?.saved?.length ?? 0, "/saved-startups"],
          ["03", "Investment activity", data?.investments?.length ?? 0, "/investments"],
          ["04", "Portfolio value", formatRupees(portfolioValue), "/investments"],
        ]
      : [
          ["01", "Upcoming sessions", upcoming.length, "/mentor-dashboard"],
          ["02", "Mentorship requests", pending.length, "/mentor-dashboard"],
          ["03", "Founder connections", new Set(sessions.map((session) => session.requesterId?._id).filter(Boolean)).size, "/mentor-dashboard"],
          ["04", "Mentorship activity", sessions.length, "/mentor-dashboard"],
        ];

  const hero = founder
    ? { tag: "FOUNDER WORKSPACE", lead: "Build.", accent: "Fund.", end: "Grow.", copy: "Your startup progress, funding momentum, and the right people to help you scale, all in one place." }
    : investor
      ? { tag: "INVESTOR WORKSPACE", lead: "Discover.", accent: "Invest.", end: "Impact.", copy: "Find promising startups, track your portfolio, and stay close to the opportunities you believe in." }
      : { tag: "MENTOR WORKSPACE", lead: "Guide.", accent: "Connect.", end: "Accelerate.", copy: "Help founders make their next move with a clear view of your sessions, requests, and connections." };

  const actions = founder
    ? [["Manage Startup", "/my-startups", "primary-btn"], ["Discover Investors", "#recommended-investors", "secondary-btn"], ["Find Mentors", "/mentors", "secondary-btn"]]
    : investor
      ? [["Discover Startups", "/discover-startups", "primary-btn"], ["View Portfolio", "/investments", "secondary-btn"], ["Manage Saved Startups", "/saved-startups", "secondary-btn"]]
      : [["View Sessions", "#upcoming-sessions", "primary-btn"], ["Manage Requests", "#mentorship-requests", "secondary-btn"], ["Discover Startups", "/discover-startups", "secondary-btn"]];

  const startups = data?.startups || [];
  const mentors = data?.mentors || [];
  const investors = data?.investors || [];
  const founderConnections = Array.from(new Map(
    sessions.filter((session) => session.requesterId?._id)
      .map((session) => [session.requesterId._id, session.requesterId])
  ).values());

  return (
    <>
      <Navbar />
      <section className="hero" id="hero">
        <div className="hero-left">
          <span className="hero-tag">{hero.tag}</span>
          <h1>{hero.lead}<br /><span>{hero.accent}</span><br />{hero.end}</h1>
          <p>Welcome back, {firstName}. {hero.copy}</p>
          <div className="hero-buttons">
            {actions.map(([label, to, className]) => (
              <button
                className={className}
                type="button"
                onClick={() => to.startsWith("#")
                  ? document.getElementById(to.slice(1))?.scrollIntoView({ behavior: "smooth" })
                  : navigate(to)}
                key={label}
              >{label}</button>
            ))}
          </div>
        </div>
        <div className="hero-right">
          <img src={new URL("../assets/hero.png", import.meta.url).href} alt="VentureX startup ecosystem" />
        </div>
      </section>

      <section className="features home-role-content" id="personalized-content">
        <div className="features-header">
          <span>{role.toUpperCase()} OVERVIEW</span>
          <h2>{founder ? "Your venture, in motion." : investor ? "Your investment landscape." : "Your impact in motion."}</h2>
          <p>{founder ? "Funding, requests, startups, and the people who can help you grow." : investor ? "Promising companies, saved opportunities, and portfolio activity." : "The founders, sessions, and requests moving through your network."}</p>
        </div>

        {loading ? (
          <div className="feature-grid"><article className="feature-card" aria-live="polite"><h3>Loading your workspace...</h3></article></div>
        ) : data?.fatal ? (
          <div className="feature-grid"><article className="feature-card" role="alert"><h3>Workspace unavailable</h3><p>We could not load your VentureX data. Check your connection and try again.</p><button type="button" className="secondary-btn" onClick={() => setAttempt((value) => value + 1)}>Retry</button></article></div>
        ) : (
          <>
            {data?.failed && <p role="status">Some information could not be refreshed. Available data is shown below.</p>}
            <div className="feature-grid feature-grid--metrics">
              {metrics.map(([number, title, description, to]) => <DataCard key={number} number={number} title={title} description={description} to={to} />)}
            </div>

            <div className="feature-grid feature-grid--role-data">
              {founder && <>
                <div className="feature-card" id="recommended-investors"><div className="feature-number">05</div><h3>Recommended investors</h3>{investors.length ? investors.slice(0, 3).map((person) => <p key={person._id}><Link to={`/investor/${person._id}`}>{person.name || "Investor"}</Link>{person.expertise ? ` · ${person.expertise}` : ""}</p>) : <p>No investor profiles are available right now.</p>}</div>
                <div className="feature-card"><div className="feature-number">06</div><h3>Relevant mentors</h3>{mentors.length ? mentors.slice(0, 3).map((person) => <p key={person._id}><Link to={`/mentor/${person._id}`}>{person.name || "Mentor"}</Link>{person.expertise ? ` · ${person.expertise}` : ""}</p>) : <p>No mentor profiles are available right now.</p>}</div>
                <div className="feature-card"><div className="feature-number">07</div><h3>Startup funding</h3>{data?.stats?.startups?.length ? data.stats.startups.slice(0, 3).map((startup) => <p key={startup._id}><Link to={`/edit-startup/${startup._id}`}>{startup.startupName}</Link> · {Math.round(startup.fundingPercentage || 0)}% funded</p>) : <p>Create a startup to see its funding progress here.</p>}</div>
              </>}

              {investor && <>
                <div className="feature-card"><div className="feature-number">05</div><h3>Recommended startups</h3>{startups.length ? startups.slice(0, 3).map((startup) => <p key={startup._id}><Link to={`/startup/${startup._id}`}>{startup.startupName || "Startup"}</Link>{startup.industry ? ` · ${startup.industry}` : ""}</p>) : <p>No startups are available to discover right now.</p>}</div>
                <div className="feature-card"><div className="feature-number">06</div><h3>Saved startups</h3>{data?.saved?.length ? data.saved.slice(0, 3).map((startup) => <p key={startup._id}><Link to={`/startup/${startup._id}`}>{startup.startupName || "Saved startup"}</Link></p>) : <p>Your saved startup list is empty.</p>}</div>
                <div className="feature-card"><div className="feature-number">07</div><h3>Recent investment activity</h3>{data?.investments?.length ? data.investments.slice(0, 3).map((investment) => <p key={investment._id}>{investment.startupId?.startupName || "Startup"} · {investment.status || "Status unavailable"} · {formatRupees(investment.amount || 0)}</p>) : <p>Your investment activity will appear here.</p>}</div>
              </>}

              {!founder && !investor && <>
                <div className="feature-card" id="upcoming-sessions"><div className="feature-number">05</div><h3>Upcoming sessions</h3>{upcoming.length ? upcoming.slice(0, 3).map((session) => <p key={session._id}>{session.requesterId?.name || "Founder"} · {session.topic || "Mentorship session"} · {new Date(session.requestedDate).toLocaleDateString()}</p>) : <p>No upcoming sessions. Accepted sessions will appear here.</p>}</div>
                <div className="feature-card" id="mentorship-requests"><div className="feature-number">06</div><h3>Mentorship requests</h3>{pending.length ? pending.slice(0, 3).map((session) => <p key={session._id}>{session.requesterId?.name || "Founder"} · {session.topic || "Mentorship request"}</p>) : <p>No pending requests right now.</p>}</div>
                <div className="feature-card"><div className="feature-number">07</div><h3>Founder connections</h3>{founderConnections.length ? founderConnections.slice(0, 3).map((person) => <p key={person._id}>{person.name || "Founder"}</p>) : <p>Your founder connections will appear here as sessions are created.</p>}</div>
                <div className="feature-card"><div className="feature-number">08</div><h3>Discover startups</h3>{startups.length ? startups.slice(0, 3).map((startup) => <p key={startup._id}><Link to={`/startup/${startup._id}`}>{startup.startupName || "Startup"}</Link></p>) : <p>No startups are available right now.</p>}</div>
              </>}
            </div>
          </>
        )}
      </section>
      <Contact />
      <Footer />
    </>
  );
}

function Home() {
  const user = getStoredUser();
  const isAuthenticated = Boolean(user && localStorage.getItem("token"));

  if (isAuthenticated && ["Founder", "Investor", "Mentor"].includes(user.role)) {
    return <PersonalizedHome user={user} />;
  }

  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Explore />
      <WhyChoose />
      <About />
      <Contact />
      <Footer /> 
    </>
  );
}

export default Home;