import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";

import connectDB from "./config/db.js";
import { profileImageDirectory } from "./config/uploads.js";

import startupRoutes from "./routes/startupRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import savedStartupRoutes from "./routes/savedStartupRoutes.js";
import investmentRoutes from "./routes/investmentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import mentorRoutes from "./routes/mentorRoutes.js";
import mentorSessionRoutes from "./routes/mentorSessionRoutes.js";
import investorRoutes from "./routes/investorRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

const app = express();
const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendDirectory = path.resolve(serverDirectory, "../dist");


// ==============================
// CORS
// ==============================



const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "https://sqqsp2s0-5173.inc1.devtunnels.ms",
];

if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );
}


// ==============================
// Middleware
// ==============================

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(self), microphone=(self), geolocation=()");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  "/uploads/profile-images",
  express.static(profileImageDirectory, {
    maxAge: "1d",
    immutable: true,
  })
);


// ==============================
// Request Logger
// ==============================

app.use((req, res, next) => {
  const safePath = req.path.replace(
    /^\/api\/auth\/reset-password\/[^/]+/,
    "/api/auth/reset-password/[REDACTED]"
  );
  console.log(`${req.method} ${safePath}`);
  next();
});


// ==============================
// Test Route
// ==============================

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend is working"
  });
});


// ==============================
// API Routes
// ==============================

app.use("/api/auth", authRoutes);

app.use("/api/startups", startupRoutes);

app.use("/api/saved", savedStartupRoutes);

app.use("/api/investments", investmentRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/saved-startups", savedStartupRoutes);

app.use("/api/mentors", mentorRoutes);

app.use("/api/investors", investorRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/mentor-sessions", mentorSessionRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/messages", messageRoutes);

app.use(express.static(frontendDirectory));
app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) {
    return next();
  }

  return res.sendFile(path.join(frontendDirectory, "index.html"), (error) => {
    if (error) next(error);
  });
});


// ==============================
// Start Server
// ==============================

const PORT = process.env.PORT || 5000;

await connectDB();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server Running on Port ${PORT}`);
});