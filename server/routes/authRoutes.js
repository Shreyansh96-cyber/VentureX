import express from "express";

import {
register,
login,
forgotPassword,
resetPassword,
googleLogin,
verifyEmailOTP,
resendEmailOTP,
} from "../controllers/authController.js";
import {
	registrationRateLimit,
	resendRateLimit,
	verificationRateLimit,
} from "../middleware/rateLimit.js";

const router = express.Router();

router.post("/register", registrationRateLimit, register);

router.post("/verify-email-otp", verificationRateLimit, verifyEmailOTP);

router.post("/resend-email-otp", resendRateLimit, resendEmailOTP);

router.post("/login", login);

router.post("/google-login", googleLogin);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

export default router;