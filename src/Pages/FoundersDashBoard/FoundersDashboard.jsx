import "./FoundersDashboard.css";

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import DashboardLayout from "../../Components/DashboardLayout/DashboardLayout";

import WelcomeCard from "./components/WelcomeCard";
import StatCard from "./components/StatCard";
import StartupCard from "./components/StartupCard";
import ProgressWidget from "./components/ProgressWidget";
import MentorSessionCard from "./components/MentorSessionCard";
import InvestorCard from "./components/InvestorCard";
import InvestmentRequests from "./components/InvestmentRequests";

import API from "../../api/startup";
import { getFounderDashboardStats } from "../../api/dashboard";
import { getProfileImageUrl } from "../../api/profile";
import { getRequesterSessions } from "../../api/mentorSession";
import { getInvestors } from "../../api/investor";

const STAT_CARDS = [
  { title: "Total Startups", key: "totalStartups", icon: "🚀" },
  { title: "Investment Requests", key: "investmentRequests", icon: "💰" },
  { title: "Interested Investors", key: "interestedInvestors", icon: "📈" },
  { title: "Upcoming Sessions", key: "upcomingSessions", icon: "🎓" },
];

export default function FounderDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [startups, setStartups] = useState([]);
  const [mentorSessions, setMentorSessions] = useState([]);
  const [investors, setInvestors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDashboardStats = async () => {
      try {
        const result = await getFounderDashboardStats();

        if (active) {
          setDashboardStats({
            totalStartups: result.totalStartups,
            investmentRequests: result.investmentRequests,
            interestedInvestors: result.interestedInvestors,
            upcomingSessions: result.upcomingSessions,
            funding: result.funding,
            startups: result.startups,
          });
          setStatsError("");
        }
      } catch {
        if (active) {
          setDashboardStats(null);
          setStatsError("Dashboard statistics could not be loaded. Refresh to try again.");
        }
      }
    };

    loadDashboardStats();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {

    const fetchStartups = async () => {

      try {

        setLoading(true);

        const response = await API.get("/");

        const allStartups = Array.isArray(
          response.data
        )
          ? response.data
          : [];

        /*
          Find only startups belonging
          to the currently logged-in founder.
        */

        const myStartups = allStartups.filter(
          (startup) => {

            const founderId =
              typeof startup?.founderId === "object"
                ? startup?.founderId?._id
                : startup?.founderId;

            return (
              String(founderId) ===
              String(user?._id)
            );
          }
        );

        /*
          Normalize MongoDB data
          for the dashboard components.
        */

        const formattedStartups =
          myStartups.map((startup) => ({

            ...startup,

            name:
              startup?.startupName ||
              "Unnamed Startup",

            category:
              startup?.industry ||
              "Technology",

            stage:
              startup?.stage ||
              "Idea",

            description:
              startup?.description ||
              "No description available.",

          }));

        setStartups(formattedStartups);

      } catch (error) {

        console.error("STARTUP LOAD FAILED:", error.response?.status || "network");

        setStartups([]);

      } finally {

        setLoading(false);

      }

    };

    if (user?._id) {
      fetchStartups();
    } else {
      setLoading(false);
    }

  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;

    const fetchMentorSessions = async () => {
      try {
        const sessions = await getRequesterSessions(user._id);
        const normalized = Array.isArray(sessions)
          ? sessions.slice(0, 2).map((session) => ({
              id: session._id,
              name: session.mentorId?.name || "Mentor",
              topic: session.topic || "Mentoring Session",
              date: session.requestedDate ? new Date(session.requestedDate).toLocaleDateString("en-IN", { weekday: "long" }) : "Upcoming",
              time: session.requestedTime || "Flexible",
              image: getProfileImageUrl(session.mentorId?.profileImage) || "https://i.pravatar.cc/100?img=12",
            }))
          : [];

        setMentorSessions(normalized);
      } catch (error) {
        console.error("MENTOR SESSION LOAD FAILED:", error.response?.status || "network");
        setMentorSessions([]);
      }
    };

    const fetchInvestors = async () => {
      try {
        const response = await getInvestors();
        const normalized = Array.isArray(response)
          ? response.slice(0, 2).map((investor) => ({
              id: investor._id,
              name: investor.name || "Investor",
              specialization: investor.expertise || investor.location || "Investor",
              image: getProfileImageUrl(investor.profileImage) || "https://i.pravatar.cc/100?img=12",
            }))
          : [];

        setInvestors(normalized);
      } catch (error) {
        console.error("INVESTOR LOAD FAILED:", error.response?.status || "network");
        setInvestors([]);
      }
    };

    fetchMentorSessions();
    fetchInvestors();
  }, [user?._id]);

  useEffect(() => {
    if (location.hash === "#investment-requests") {
      document.getElementById("investment-requests")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [location.hash]);

  return (

    <DashboardLayout>

      <div className="founderDashboard">

        {/* =========================
            TITLE
        ========================= */}

        <div className="dashboardTitle">

          <h1>
            Founder Dashboard
          </h1>

          <span>
            Welcome back, {user?.name}
          </span>

        </div>


        {/* =========================
            WELCOME
        ========================= */}

        <WelcomeCard />


        {/* =========================
            STATISTICS
        ========================= */}

        <section className="statsGrid">

          {statsError && (
            <p className="dashboardStatsError" role="alert">
              {statsError}
            </p>
          )}

          {STAT_CARDS.map((item) => (
            <StatCard
              key={item.key}
              title={item.title}
              value={dashboardStats?.[item.key] ?? "—"}
              icon={item.icon}
            />
          ))}

        </section>


        {/* =========================
            STARTUPS + FUNDING
        ========================= */}

        <section className="middleSection">

          {/* STARTUPS */}

          <div className="startupArea">

            <div className="sectionTitle">

              <h2>
                Your Startups
              </h2>

              <button onClick={() => navigate("/my-startups")}>
                View All
              </button>

            </div>


            <div className="startupGrid">

              {loading ? (

                <p>
                  Loading startups...
                </p>

              ) : startups.length > 0 ? (

                startups.map((startup) => (

                  <StartupCard
                    key={
                      startup?._id ||
                      startup?.id
                    }
                    startup={startup}
                    fundingMetrics={dashboardStats?.startups?.find(
                      (summary) => String(summary._id) === String(startup?._id)
                    )}
                  />

                ))

              ) : (

                <p>
                  No startups created yet.
                </p>

              )}

            </div>

          </div>


          {/* FUNDING PROGRESS */}

          <ProgressWidget
            funding={dashboardStats?.funding}
            loading={!dashboardStats && !statsError}
            error={Boolean(statsError)}
          />

        </section>


        {/* =========================
            FUNDING REQUESTS
        ========================= */}

        <section className="dashboardSection" id="investment-requests">

          <h2>
            Investment Requests
          </h2>

          <InvestmentRequests
            founderId={user?._id || user?.id}
          />

        </section>


        {/* =========================
            MENTORS + INVESTORS
        ========================= */}

        <section className="bottomGrid">

          {/* MENTOR SESSIONS */}

          <div>

            <h2>
              Upcoming Mentor Sessions
            </h2>

            {mentorSessions.map(
              (session) => (

                <MentorSessionCard
                  key={session.id}
                  session={session}
                />

              )
            )}

          </div>


          {/* INVESTORS */}

          <div>

            <h2>
              Recommended Investors
            </h2>

            <div className="investorGrid">

              {investors.map(
                (investor) => (

                  <InvestorCard
                    key={investor.id}
                    investor={investor}
                  />

                )
              )}

            </div>

          </div>

        </section>


        {/* =========================
            NOTIFICATIONS
        ========================= */}

        <section className="dashboardSection">

          <h2>
            Notifications
          </h2>

          <button
            type="button"
            className="openNotificationsButton"
            onClick={() => navigate("/notifications")}
          >
            Open notifications
          </button>

        </section>

      </div>

    </DashboardLayout>

  );
}