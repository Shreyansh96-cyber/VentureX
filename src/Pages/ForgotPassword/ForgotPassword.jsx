import { useState } from "react";
import API from "../../api/auth";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";

function ForgotPassword() {

    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);

    const submit = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            const res = await API.post("/forgot-password", {
                email,
            });

            alert(res.data.message);

        } catch (err) {

            alert(
                err.response?.data?.message ||
                "Server Error"
            );

        } finally {

            setLoading(false);

        }

    };

    return (
        <div className="forgotPage">

            <div className="forgotCard">

                <h1>Forgot Password</h1>

                <p>
                    Enter your registered email.
                </p>

                <form onSubmit={submit}>

                    <input
                        type="email"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <button>
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>

                </form>

                <Link to="/login">
                    Back to Login
                </Link>

            </div>

        </div>
    );

}

export default ForgotPassword;