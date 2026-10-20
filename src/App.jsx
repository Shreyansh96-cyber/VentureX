// Codex new Undo Test
import { Routes, Route } from "react-router-dom";

import Home from "./Pages/Home";
import Login from "./Pages/Login/Login";
import Register from "./Pages/Register/Register";
import VerifyOTP from "./Pages/VerifyOTP/VerifyOTP";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword/ResetPassword";

import CreateStartup from "./Pages/CreateStartup/CreateStartup";
import EditStartup from "./Pages/EditStartup/EditStartup";
import FounderDashboard from "./Pages/FoundersDashBoard/FoundersDashboard";
import MyStartups from "./Pages/MyStartups/MyStartups";

import InvestorDashboard from "./Pages/InvestorDashboard/InvestorDashboard";
import DiscoverStartups from "./Pages/InvestorDashboard/DiscoverStartups";
import SavedStartups from "./Pages/InvestorDashboard/SavedStartups";
import MyInvestments from "./Pages/InvestorDashboard/MyInvestments";

import StartupDetailsPage from "./Pages/InvestorDashboard/StartupDetails/StartupDetailsPage";

import MentorDashboard from "./Pages/MentorDashboard/MentorDashboard";
import Mentors from "./Pages/Mentors/Mentors";
import MentorProfile from "./Pages/MentorProfile/MentorProfile";
import MyMentorship from "./Pages/MyMentorship/MyMentorship";
import Notifications from "./Pages/Notifications/Notifications";
import Profile from "./Pages/Profile/Profile";
import FundingAnalytics from "./Pages/FundingAnalytics/FundingAnalytics";
import InvestorProfile from "./Pages/InvestorProfile/InvestorProfile";
import Messages from "./Pages/Messages/Messages";
import MentorMeeting from "./Pages/MentorMeeting/MentorMeeting";

import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* HOME */}
      <Route path="/" element={<Home />} />

      {/* AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* FOUNDER */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRole="Founder">
            <FounderDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-startup"
        element={
          <ProtectedRoute allowedRole="Founder">
            <CreateStartup />
          </ProtectedRoute>
        }
      />

      <Route
        path="/edit-startup/:id"
        element={
          <ProtectedRoute allowedRole="Founder">
            <EditStartup />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-startups"
        element={
          <ProtectedRoute allowedRole="Founder">
            <MyStartups />
          </ProtectedRoute>
        }
      />

      <Route
        path="/funding-analytics"
        element={
          <ProtectedRoute allowedRole="Founder">
            <FundingAnalytics />
          </ProtectedRoute>
        }
      />

      {/* STARTUP DETAILS */}
      <Route
        path="/startup/:id"
        element={<StartupDetailsPage />}
      />

      {/* INVESTOR */}
      <Route
        path="/investor-dashboard"
        element={
          <ProtectedRoute allowedRole="Investor">
            <InvestorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/investor/:id"
        element={
          <ProtectedRoute>
            <InvestorProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/discover-startups"
        element={<DiscoverStartups />}
      />

      <Route
        path="/saved-startups"
        element={
          <ProtectedRoute allowedRole="Investor">
            <SavedStartups />
          </ProtectedRoute>
        }
      />

      <Route
        path="/investments"
        element={
          <ProtectedRoute allowedRole="Investor">
            <MyInvestments />
          </ProtectedRoute>
        }
      />

      {/* MENTOR */}
      <Route
        path="/mentors"
        element={
          <ProtectedRoute>
            <Mentors />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mentor/:id"
        element={
          <ProtectedRoute>
            <MentorProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-mentorship"
        element={
          <ProtectedRoute>
            <MyMentorship />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mentor-dashboard"
        element={
          <ProtectedRoute allowedRole="Mentor">
            <MentorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mentor-sessions/:sessionId/meeting"
        element={
          <ProtectedRoute>
            <MentorMeeting />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;
