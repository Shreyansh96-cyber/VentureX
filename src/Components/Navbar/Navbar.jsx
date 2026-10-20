import "./Navbar.css";

import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaBars, FaTimes, FaSearch, FaSignOutAlt } from "react-icons/fa";
import NotificationBell from "../Notifications/NotificationBell";
import { getProfileImageUrl } from "../../api/profile";
import { logout } from "../../utils/auth";

import logo from "../../assets/VentureX.png";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scroll, setScroll] = useState(false);
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();
  const isAuthenticated = Boolean(user && localStorage.getItem("token"));

  const roleNavigation = {
    Founder: [
      { label: "Home", href: "#hero" },
      { label: "My Startups", to: "/my-startups" },
      { label: "Funding", to: "/funding-analytics" },
      { label: "Investors", href: "#recommended-investors" },
      { label: "Mentors", to: "/mentors" },
    ],
    Investor: [
      { label: "Home", href: "#hero" },
      { label: "Discover Startups", to: "/discover-startups" },
      { label: "Saved Startups", to: "/saved-startups" },
      { label: "Portfolio", to: "/investments" },
      { label: "Messages", to: "/messages" },
    ],
    Mentor: [
      { label: "Home", href: "#hero" },
      { label: "Sessions", href: "#upcoming-sessions" },
      { label: "Requests", href: "#mentorship-requests" },
      { label: "Discover Startups", to: "/discover-startups" },
      { label: "Messages", to: "/messages" },
    ],
  };
  const navItems = isAuthenticated && roleNavigation[user.role]
    ? roleNavigation[user.role]
    : [
        { label: "Home", href: "#hero" },
        { label: "Features", href: "#features" },
        { label: "Explore", href: "#explore" },
        { label: "About", href: "#about" },
        { label: "Contact", href: "#contact" },
      ];

  const profileInitials = user?.name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "VX";

  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY > 60);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className={scroll ? "navbar scrolled" : "navbar"}>

      {/* =========================
          LOGO
      ========================= */}

      <div className="logo">

        <img
          src={logo}
          alt="VentureX Logo"
        />

        <span>VentureX</span>

      </div>


      {/* =========================
          NAVIGATION
      ========================= */}

      <nav className={menuOpen ? "navLinks active" : "navLinks"} aria-label="Main navigation">
        {navItems.map((item) => item.href ? (
          <a href={item.href} onClick={() => setMenuOpen(false)} key={item.label}>
            {item.label}
          </a>
        ) : (
          <Link to={item.to} onClick={() => setMenuOpen(false)} key={item.label}>
            {item.label}
          </Link>
        ))}
      </nav>


      {/* =========================
          RIGHT SECTION
      ========================= */}

      <div className="rightSection">

        {isAuthenticated && <NotificationBell />}

        {/* SEARCH */}

        <div className="searchBox">

          <FaSearch />

          <input
            type="text"
            placeholder="Search..."
          />

        </div>


        {/* LOGIN */}

        {isAuthenticated ? (
          <Link to="/profile" className="profileAvatarLink" aria-label="My profile" title="My profile">
            {user.profileImage ? (
              <img src={getProfileImageUrl(user.profileImage)} alt="" />
            ) : (
              <span>{profileInitials}</span>
            )}
          </Link>
        ) : (
          <Link to="/login">
            <button className="loginBtn">
              Login/SignUp
            </button>
          </Link>
        )}


        {/* MOBILE MENU */}

        <div
          className="menuIcon"
          onClick={() => setMenuOpen(!menuOpen)}
        >

          {menuOpen ? (
            <FaTimes />
          ) : (
            <FaBars />
          )}

        </div>


        {/* LOGOUT */}

        {isAuthenticated && (
          <button
            type="button"
            className="logoutBtn"
            onClick={() => logout(navigate)}
          >
            <FaSignOutAlt />
            Logout
          </button>
        )}

      </div>

    </header>
  );
}

export default Navbar;