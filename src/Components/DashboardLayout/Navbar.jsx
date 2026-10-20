import "./DashboardLayout.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaEnvelope, FaUser } from "react-icons/fa";
import NotificationBell from "../Notifications/NotificationBell";
import HomeButton from "../HomeButton";
import { getProfileImageUrl } from "../../api/profile";

const readUser = () => {
    try {
        return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
        return null;
    }
};

function Navbar() {
    const [user, setUser] = useState(readUser);
    const profileImage = getProfileImageUrl(user?.profileImage);

    useEffect(() => {
        const refreshUser = () => setUser(readUser());

        window.addEventListener("venturex:user-updated", refreshUser);
        window.addEventListener("storage", refreshUser);

        return () => {
            window.removeEventListener("venturex:user-updated", refreshUser);
            window.removeEventListener("storage", refreshUser);
        };
    }, []);

    return (

        <header className="navbar1">

            <div className="logo">
                VentureX
            </div>

            <div className="navbar1Right">

                

                {(user?.role === "Founder" || user?.role === "Investor") && (
                    <Link to="/messages" className="dashboardMessagesLink">
                        <FaEnvelope aria-hidden="true" />
                        Messages
                    </Link>
                )}

                {user && localStorage.getItem("token") && <NotificationBell />}

                <Link
                    to="/profile"
                    className="dashboardProfileLink"
                    aria-label={`View ${user?.name || "your"} profile`}
                    title="View profile"
                >
                    <span className="dashboardProfileName">{user?.name}</span>
                    {profileImage ? (
                        <img className="dashboardProfileAvatar" src={profileImage} alt="" />
                    ) : (
                        <FaUser className="dashboardProfileAvatar dashboardProfileFallback" aria-hidden="true" />
                    )}
                </Link>
                <HomeButton />
            </div>

        </header>

    );
}

export default Navbar;