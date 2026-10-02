import "./DashboardLayout.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import NotificationBell from "../Notifications/NotificationBell";
import HomeButton from "../HomeButton";
import { logout } from "../../utils/auth";

const readUser = () => {
    try {
        return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
        return null;
    }
};

function Navbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState(readUser);

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

                <HomeButton />

                {user && localStorage.getItem("token") && <NotificationBell />}

                <Link to="/profile" className="userName dashboardProfileLink">
                    {user?.name}
                </Link>

                <button
                    type="button"
                    className="logoutBtn"
                    onClick={() => logout(navigate)}
                >
                    <FaSignOutAlt />
                    Logout
                </button>

            </div>

        </header>

    );
}

export default Navbar;