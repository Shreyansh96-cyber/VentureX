import express from "express";

import {
register,
login,
forgotPassword,
resetPassword,
googleLogin
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/google-login", googleLogin);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

export default router;