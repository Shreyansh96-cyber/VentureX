import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import "./HomeButton.css";

export default function HomeButton({ className = "" }) {
  return (
    <Link to="/" className={`homeButton ${className}`.trim()}>
      <FaHome aria-hidden="true" />
    </Link>
  );
}