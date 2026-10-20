import "./VerifyOTP.css";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import API from "../../api/auth";
import HomeButton from "../../Components/HomeButton";

const getRetryTimestamp = () => {
	const storedTimestamp = Number(sessionStorage.getItem("pendingEmailVerificationResendAt"));
	return Number.isFinite(storedTimestamp) ? storedTimestamp : 0;
};

const getDashboardPath = (role) => {
	if (role === "Founder") return "/dashboard";
	if (role === "Investor") return "/investor-dashboard";
	return "/mentor-dashboard";
};

export default function VerifyOTP() {
	const location = useLocation();
	const navigate = useNavigate();
	const email = location.state?.email || sessionStorage.getItem("pendingEmailVerification") || "";
	const [otp, setOtp] = useState("");
	const [loading, setLoading] = useState(false);
	const [resending, setResending] = useState(false);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const [retryAt, setRetryAt] = useState(getRetryTimestamp);
	const [secondsRemaining, setSecondsRemaining] = useState(() => Math.max(0, Math.ceil((getRetryTimestamp() - Date.now()) / 1000)));

	useEffect(() => {
		if (!email) return;
		sessionStorage.setItem("pendingEmailVerification", email);
	}, [email]);

	useEffect(() => {
		if (!retryAt) return undefined;

		const updateCountdown = () => {
			const remaining = Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
			setSecondsRemaining(remaining);
			if (remaining === 0) {
				sessionStorage.removeItem("pendingEmailVerificationResendAt");
			}
		};

		const interval = window.setInterval(updateCountdown, 1000);
		return () => window.clearInterval(interval);
	}, [retryAt]);

	const handleVerify = async (event) => {
		event.preventDefault();
		if (!email || !/^\d{6}$/.test(otp)) {
			setError("Enter the 6-digit code sent to your email.");
			return;
		}

		try {
			setLoading(true);
			setError("");
			const response = await API.post("/verify-email-otp", { email, otp });
			localStorage.setItem("token", response.data.token);
			localStorage.setItem("user", JSON.stringify(response.data.user));
			sessionStorage.removeItem("pendingEmailVerification");
			sessionStorage.removeItem("pendingEmailVerificationResendAt");
			navigate(getDashboardPath(response.data.user.role), { replace: true });
		} catch (verificationError) {
			setError(verificationError.response?.data?.message || "Unable to verify your email. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleResend = async () => {
		if (!email || secondsRemaining > 0 || resending) return;

		try {
			setResending(true);
			setError("");
			setMessage("");
			const response = await API.post("/resend-email-otp", { email });
			const nextRetryAt = Date.now() + (response.data.retryAfterSeconds || 60) * 1000;
			sessionStorage.setItem("pendingEmailVerificationResendAt", String(nextRetryAt));
			setRetryAt(nextRetryAt);
			setSecondsRemaining(response.data.retryAfterSeconds || 60);
			setMessage(response.data.message || "If registration is pending, a new code has been sent.");
		} catch (resendError) {
			const retryAfter = resendError.response?.data?.retryAfterSeconds;
			if (retryAfter) {
				const nextRetryAt = Date.now() + retryAfter * 1000;
				sessionStorage.setItem("pendingEmailVerificationResendAt", String(nextRetryAt));
				setRetryAt(nextRetryAt);
				setSecondsRemaining(retryAfter);
			}
			setError(resendError.response?.data?.message || "Unable to send a new code. Please try again later.");
		} finally {
			setResending(false);
		}
	};

	return (
		<main className="registerPage verifyPage">
			<HomeButton className="homeButton--auth" />
			<div className="backgroundCircle one" />
			<div className="backgroundCircle two" />
			<div className="backgroundCircle three" />

			<section className="registerRight" aria-labelledby="verify-title">
				<div className="registerCard verifyCard">
					<div className="verifyMark" aria-hidden="true"><FaLock /></div>
					<p className="verifyEyebrow">VENTUREX ACCOUNT SECURITY</p>
					<h1 id="verify-title">Verify your email</h1>
					{email ? (
						<>
							<p className="verifyIntro">Enter the 6-digit code we sent to</p>
							<p className="verifyEmail"><FaEnvelope aria-hidden="true" /> {email}</p>
							<form onSubmit={handleVerify}>
								<div className="inputGroup">
									<label htmlFor="email-otp">Verification code</label>
									<input
										className="otpInput"
										id="email-otp"
										name="otp"
										type="text"
										inputMode="numeric"
										autoComplete="one-time-code"
										pattern="[0-9]{6}"
										maxLength={6}
										value={otp}
										onChange={(event) => {
											setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
											setError("");
										}}
										placeholder="000000"
										aria-describedby={error ? "otp-error" : "otp-help"}
										required
									/>
									<small className="otpHelp" id="otp-help">The code expires 5 minutes after it is sent.</small>
								</div>

								{error && <p className="otpFeedback otpFeedback--error" id="otp-error" role="alert">{error}</p>}
								{message && <p className="otpFeedback otpFeedback--success" role="status">{message}</p>}

								<button className="registerBtn" type="submit" disabled={loading || otp.length !== 6}>
									{loading ? "Verifying..." : "Verify email"}
								</button>
							</form>

							<div className="otpResendRow">
								<span>Didn't receive the code?</span>
								<button type="button" className="otpResendBtn" onClick={handleResend} disabled={resending || secondsRemaining > 0}>
									{resending ? "Sending..." : secondsRemaining > 0 ? `Resend in ${secondsRemaining}s` : "Resend code"}
								</button>
							</div>
							<p className="loginLink"><Link to="/register">Use a different email</Link></p>
						</>
					) : (
						<>
							<p className="verifyIntro">No registration is waiting for verification in this session.</p>
							<Link className="registerBtn verifyRegisterLink" to="/register">Create an account</Link>
						</>
					)}
				</div>
			</section>
		</main>
	);
}
