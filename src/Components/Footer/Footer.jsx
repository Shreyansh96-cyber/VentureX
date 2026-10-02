import "./Footer.css";
import { FaXTwitter } from "react-icons/fa6";
import {
  FaLinkedinIn,
  FaInstagram,
  FaHome,
  FaInfoCircle,
  FaEnvelope,
  FaSignInAlt,
  FaRocket,
  FaUserTie,
  FaHandshake,
  FaCalendarAlt,
  FaQuestionCircle,
  FaShieldAlt,
  FaFileContract,
} from "react-icons/fa";

import { MdEmail } from "react-icons/md";

function Footer() {
  return (
    <footer className="footer">

      <div className="footerContainer">

        {/* Brand */}

        <div className="footerBrand">

          <h2>VentureX</h2>

          <h3>Build. Fund. Grow.</h3>

          <p className="footerTagline">
            India's Modern Startup Ecosystem
            <br />
            Connecting Founders, Investors & Mentors.
          </p>

        </div>

        {/* Links */}

        <div className="footerLinksContainer">

          {/* Quick Links */}

          <div className="footerLinks">

            <h4>Quick Links</h4>

            <a href="/">
              <FaHome />
              Home
            </a>

            <a href="#about">
            <FaInfoCircle />
            About
            </a>

            <a href="#contact">
            <FaEnvelope />
            Contact
            </a>

            <a href="/login">
              <FaSignInAlt />
              Login
            </a>

          </div>

          {/* Explore */}

          <div className="footerLinks">

            <h4>Explore</h4>

            <a href="/">
              <FaRocket />
              Startups
            </a>

            <a href="/">
              <FaUserTie />
              Investors
            </a>

            <a href="/">
              <FaHandshake />
              Mentors
            </a>

            <a href="/">
              <FaCalendarAlt />
              Events
            </a>

          </div>

          {/* Resources */}

          <div className="footerLinks">

            <h4>Resources</h4>

            <a href="/">
              <FaQuestionCircle />
              Help Center
            </a>

            <a href="/">
              <FaShieldAlt />
              Privacy Policy
            </a>

            <a href="/">
              <FaFileContract />
              Terms & Conditions
            </a>

            <a href="/">
              <MdEmail />
              Support
            </a>

          </div>

        </div>

        {/* Newsletter */}

        <div className="newsletter">

          <h4>
            <MdEmail />
            Newsletter
          </h4>

          <p>
            Stay updated with startup news, funding opportunities,
            and the latest VentureX features.
          </p>

          <div className="newsletterBox">

            <input
              type="email"
              placeholder="Enter your email address"
            />

            <button>

              Subscribe

            </button>

          </div>

        </div>

      </div>

      <div className="footerBottom">

        <p>

          © 2026 VentureX. All Rights Reserved.

        </p>

        <div className="socialLinks">

          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
          >
            <FaLinkedinIn />
          </a>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
          >
            <FaInstagram />
          </a>

          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
          >
            <FaXTwitter />
          </a>

        </div>

      </div>

    </footer>
  );
}

export default Footer;