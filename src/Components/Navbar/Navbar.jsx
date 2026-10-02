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

      <nav className={menuOpen ? "navLinks active" : "navLinks"}>

        <a
          href="#hero"
          onClick={() => setMenuOpen(false)}
        >
          Home
        </a>

        <a
          href="#features"
          onClick={() => setMenuOpen(false)}
        >
          Features
        </a>

        <a
          href="#explore"
          onClick={() => setMenuOpen(false)}
        >
          Explore
        </a>

        <a
          href="#about"
          onClick={() => setMenuOpen(false)}
        >
          About
        </a>

        <a
          href="#contact"
          onClick={() => setMenuOpen(false)}
        >
          Contact
        </a>

      </nav>


      {/* =========================
          RIGHT SECTION
      ========================= */}

      <div className="rightSection">

        {user && localStorage.getItem("token") && <NotificationBell />}

        {/* SEARCH */}

        <div className="searchBox">

          <FaSearch />

          <input
            type="text"
            placeholder="Search..."
          />

        </div>


        {/* LOGIN */}

        {user && localStorage.getItem("token") ? (
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

        {user && localStorage.getItem("token") && (
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