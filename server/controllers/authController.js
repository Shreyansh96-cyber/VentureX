import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import sendEmail from "../utils/sendEmail.js";

const googleClient = new OAuth2Client();
const googleClientId = process.env.GOOGLE_CLIENT_ID || "799455039215-qr6d1thg65v5r65lm2mmu427sbhsdali.apps.googleusercontent.com";
const allowedRoles = new Set(["Founder", "Investor", "Mentor"]);
const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isValidPassword = (value) => typeof value === "string" && value.length >= 8;
const hashResetToken = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

const toPublicUser = (user) => {
  const publicUser = user.toObject();

  for (const field of [
    "password",
    "googleId",
    "otp",
    "otpExpiry",
    "resetPasswordToken",
    "resetPasswordExpire",
  ]) {
    delete publicUser[field];
  }

  return publicUser;
};

/* ---------------- REGISTER ---------------- */

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedName || !normalizedEmail || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields.",
      });
    }

    if (normalizedName.length < 2 || normalizedName.length > 80 || !isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid name and email address.",
      });
    }

    if (!allowedRoles.has(role)) {
      return res.status(400).json({
        success: false,
        message: "Select a valid account role.",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      success: true,
      message: "Registration Successful",
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error.name);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



/* ---------------- LOGIN ---------------- */

export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = normalizeEmail(email);

    // Check fields
    if (!normalizedEmail || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please enter email and password.",
      });
    }

    // Find user
    const user = await User.findOne({ email: normalizedEmail });

    if (!user?.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: toPublicUser(user),
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error.name);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};

export const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }

    const user = await User.findOne({ email });
    const genericMessage = "If an account exists for that email, a reset link has been sent.";

    if (!user) {
      return res.status(200).json({ message: genericMessage });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = hashResetToken(resetToken);
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();
    const url = `https://tmpcph4f-5173.inc1.devtunnels.ms/reset-password/${resetToken}`;

    await sendEmail(
  email,
  "Reset your VentureX password",
  `
  <!DOCTYPE html>

  <html>

  <head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Reset your VentureX password</title>

  </head>

  <body style="
    margin:0;
    padding:0;
    background:#f5f7fb;
    font-family:Arial, Helvetica, sans-serif;
  ">

    <div style="
      max-width:600px;
      margin:40px auto;
      background:#ffffff;
      border-radius:20px;
      overflow:hidden;
      box-shadow:0 10px 30px rgba(15,23,42,0.08);
    ">

      <!-- HEADER -->

      <div style="
        background:linear-gradient(135deg,#2563eb,#3b82f6);
        padding:35px;
        text-align:center;
      ">

        <h1 style="
          margin:0;
          color:#ffffff;
          font-size:32px;
          font-weight:800;
        ">
          VentureX
        </h1>

        <p style="
          margin:8px 0 0;
          color:#dbeafe;
          font-size:14px;
        ">
          Build. Fund. Grow.
        </p>

      </div>


      <!-- CONTENT -->

      <div style="
        padding:40px 35px;
      ">

        <h2 style="
          margin:0 0 15px;
          color:#0f172a;
          font-size:25px;
        ">
          Reset your password
        </h2>

        <p style="
          color:#475569;
          font-size:16px;
          line-height:1.7;
        ">
          We received a request to reset the password
          associated with your VentureX account.
        </p>

        <p style="
          color:#475569;
          font-size:16px;
          line-height:1.7;
        ">
          Click the button below to create a new password.
        </p>


        <!-- BUTTON -->

        <div style="
          text-align:center;
          margin:35px 0;
        ">

          <a
            href="${url}"
            style="
              display:inline-block;
              background:#2563eb;
              color:#ffffff;
              text-decoration:none;
              padding:15px 30px;
              border-radius:10px;
              font-size:16px;
              font-weight:700;
            "
          >
            Reset Password
          </a>

        </div>


        <p style="
          color:#64748b;
          font-size:14px;
          line-height:1.6;
        ">
          For security reasons, this password reset link
          will expire after a limited period of time.
        </p>

        <p style="
          color:#64748b;
          font-size:14px;
          line-height:1.6;
        ">
          If you did not request a password reset,
          you can safely ignore this email.
        </p>


        <!-- FALLBACK LINK -->

        <div style="
          margin-top:30px;
          padding:18px;
          background:#f8fafc;
          border-radius:10px;
          word-break:break-all;
        ">

          <p style="
            margin:0 0 8px;
            color:#64748b;
            font-size:12px;
          ">
            If the button doesn't work, copy this link:
          </p>

          <a
            href="${url}"
            style="
              color:#2563eb;
              font-size:12px;
            "
          >
            ${url}
          </a>

        </div>

      </div>


      <!-- FOOTER -->

      <div style="
        padding:25px;
        text-align:center;
        background:#f8fafc;
        border-top:1px solid #e2e8f0;
      ">

        <p style="
          margin:0;
          color:#64748b;
          font-size:13px;
        ">
          © VentureX
        </p>

        <p style="
          margin:8px 0 0;
          color:#94a3b8;
          font-size:12px;
        ">
          Build. Fund. Grow.
        </p>

      </div>

    </div>

  </body>

  </html>
  `
);

    return res.json({ message: genericMessage });

  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err.name);

    return res.status(500).json({ message: "Unable to process the password reset request." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body || {};

    if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: hashResetToken(token),
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or Expired Token",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.json({
      message: "Password Updated Successfully",
    });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err.name);

    return res.status(500).json({ message: "Unable to reset password." });
  }
};
       

/* ---------------- GOOGLE LOGIN ---------------- */

export const googleLogin = async (req, res) => {
  try {
    const credential = req.body?.credential;

    if (typeof credential !== "string" || !credential || credential.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required.",
      });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
      });
      payload = ticket.getPayload();
    } catch {
      return res.status(401).json({
        success: false,
        message: "Google credential is invalid or expired.",
      });
    }

    const email = normalizeEmail(payload?.email);
    if (!payload?.email_verified || !isValidEmail(email)) {
      return res.status(401).json({
        success: false,
        message: "Google account email could not be verified.",
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: String(payload.name || email.split("@")[0]).trim().slice(0, 80),
        email,
        password: "",
        role: "Investor",
        googleId: payload.sub,
        profileImage: typeof payload.picture === "string" ? payload.picture : "",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Google Login Successful",
      token,
      user: toPublicUser(user),
    });

  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err.name);

    return res.status(500).json({
      success: false,
      message: "Unable to sign in with Google.",
    });

}
};