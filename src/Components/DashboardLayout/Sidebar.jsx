import "./DashboardLayout.css";
import { NavLink } from "react-router-dom";

function Sidebar() {

  const user = JSON.parse(localStorage.getItem("user"));

  return (

    <aside className="sidebar">

      <div className="sidebarMenu">

        <h3>Menu</h3>

        {user?.role === "Founder" && (
          <ul>

            <li>
              <NavLink to="/profile">
                👤 Profile &amp; Settings
              </NavLink>
            </li>

            <li>
              <NavLink to="/dashboard">
                🏠 Dashboard
              </NavLink>
            </li>

            <li>
              <NavLink to="/create-startup">
                🚀 Create Startup
              </NavLink>
            </li>

            <li>
              <NavLink to="/my-startups">
                📁 My Startups
              </NavLink>
            </li>

            <li>
              <NavLink to="/dashboard#investment-requests">
                💰 Funding
              </NavLink>
            </li>

            <li>
              <NavLink to="/mentors">
                👨‍🏫 Mentors
              </NavLink>
            </li>

            <li>
              <NavLink to="/my-mentorship">
                📅 My Mentorship
              </NavLink>
            </li>
          </ul>
        )}

        {user?.role === "Investor" && (
          <ul>
            <li>
              <NavLink to="/profile">
                👤 Profile &amp; Settings
              </NavLink>
            </li>

            <li>
              <NavLink to="/investor-dashboard">
                🏠 Dashboard
              </NavLink>
            </li>

            <li>
              <NavLink to="/discover-startups">
                🔍 Discover Startups
              </NavLink>
            </li>

            <li>
              <NavLink to="/investor-dashboard#portfolio-value">
                📈 Portfolio
              </NavLink>
            </li>

            <li>
              <NavLink to="/investments">
                💵 Investments
              </NavLink>
            </li>

            <li>
              <NavLink to="/mentors">
                👨‍🏫 Mentors
              </NavLink>
            </li>

            <li>
              <NavLink to="/my-mentorship">
                📅 My Mentorship
              </NavLink>
            </li>
          </ul>
        )}

        {user?.role === "Mentor" && (
          <ul>

            <li>
              <NavLink to="/profile">
                👤 Profile &amp; Settings
              </NavLink>
            </li>

            <li>
              <NavLink to="/mentor-dashboard">
                🏠 Dashboard
              </NavLink>
            </li>

            <li>
              <NavLink to="/my-mentorship">
                📅 Sessions
              </NavLink>
            </li>

            <li>
              <NavLink to="/discover-startups">
                🚀 Startups
              </NavLink>
            </li>

          </ul>
        )}

      </div>

    </aside>

  );

}

export default Sidebar;