import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useApp } from "./context/AppContext";

// Auth Views
import { LandingPage } from "./pages/auth/LandingPage";
import { Login } from "./pages/auth/Login";
import { Signup } from "./pages/auth/Signup";
import { VerifyOtp } from "./pages/auth/VerifyOtp";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";
import { LoginSuccess } from "./pages/auth/LoginSuccess";
import { SharedBadgeView } from "./pages/SharedBadgeView";

// Main Layout & Authenticated Pages
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { LearnWithAI } from "./pages/learn/LearnWithAI";
import { LearnWithSyllabus } from "./pages/learn/LearnWithSyllabus";
import { LessonPage } from "./pages/learn/LessonPage";
import { SpeechToText } from "./pages/speech/SpeechToText";
import { TextToSpeech } from "./pages/speech/TextToSpeech";
import { Quiz } from "./pages/practice/Quiz";
import { Leaderboard } from "./pages/practice/Leaderboard";
import { History } from "./pages/History";
import { Settings } from "./pages/Settings";
import { Profile } from "./pages/Profile";
import { Progress } from "./pages/Progress";

// Admin Panel Layout & Pages
import { AdminLayout } from "./components/layout/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ModulesManager } from "./pages/admin/ModulesManager";
import { LessonsManager } from "./pages/admin/LessonsManager";
import { QuizzesManager } from "./pages/admin/QuizzesManager";
import { AnnouncementsManager } from "./pages/admin/AnnouncementsManager";
import { BadgesManager } from "./pages/admin/BadgesManager";
import { UsersManager } from "./pages/admin/UsersManager";
import { AdminAnalytics } from "./pages/admin/AdminAnalytics";
import { SiteSettings } from "./pages/admin/SiteSettings";

function App() {
  const { state } = useApp();
  const { isAuthenticated, authStep } = state;
  const location = useLocation();

  // Unauthenticated routing layout
  const isAdminPath = location.pathname.startsWith("/admin");
  const isSharedBadge = location.pathname.startsWith("/shared/badge/");
  
  if (isSharedBadge) {
    return (
      <Routes>
        <Route path="/shared/badge/:shareId" element={<SharedBadgeView />} />
      </Routes>
    );
  }

  if (!isAuthenticated && !isAdminPath) {
    if (location.pathname === "/forgot-password" || location.pathname === "/auth/forgot-password") {
      return <ForgotPassword />;
    }
    if (location.pathname === "/reset-password" || location.pathname === "/auth/reset-password") {
      return <ResetPassword />;
    }

    switch (authStep) {
      case "login":
        return <Login />;
      case "signup":
        return <Signup />;
      case "otp":
        return <VerifyOtp />;
      case "success":
        return <LoginSuccess />;
      case "forgot":
        return <ForgotPassword />;
      case "landing":
      default:
        return <LandingPage />;
    }
  }

  // Maintenance mode and suspension checks
  const siteSettings = JSON.parse(window.localStorage.getItem("beyondwords_site_settings") || "{}");
  const isMaintenance = siteSettings.maintenanceMode && !location.pathname.startsWith("/admin");

  const suspendedUsers = JSON.parse(window.localStorage.getItem("beyondwords_suspended_users") || "[]");
  const isSuspended = isAuthenticated && state.user?.email && suspendedUsers.includes(state.user.email) && !location.pathname.startsWith("/admin");

  if (isMaintenance) {
    return (
      <div className="min-h-screen bg-[#06060c] text-textPrimary flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl p-8 rounded-3xl text-center flex flex-col items-center gap-5 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-amber-400 text-3xl shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            🛠️
          </div>
          <h2 className="text-xl font-extrabold text-textPrimary">{siteSettings.platformName || "BeyondWords"} Under Maintenance</h2>
          <p className="text-xs text-textSecondary leading-relaxed">
            {siteSettings.maintenanceMessage || "The site is currently undergoing scheduled maintenance. We will be back shortly!"}
          </p>
          {siteSettings.expectedBackTime && (
            <div className="px-4 py-2 bg-white/[0.02] border border-white/[0.06] rounded-xl text-[11px] font-mono text-amber-400 font-semibold">
              Expected Back: {new Date(siteSettings.expectedBackTime).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isSuspended) {
    return (
      <div className="min-h-screen bg-[#06060c] text-textPrimary flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl p-8 rounded-3xl text-center flex flex-col items-center gap-5 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-3xl shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            🚫
          </div>
          <h2 className="text-xl font-extrabold text-textPrimary">Account Suspended</h2>
          <p className="text-xs text-textSecondary leading-relaxed">
            Your account has been suspended by the administrator. If you believe this is an error, please contact support.
          </p>
          <button
            onClick={() => {
              window.sessionStorage.clear();
              window.localStorage.removeItem("beyondwords_app_state");
              window.location.reload();
            }}
            className="w-full py-2.5 bg-gradient-brand text-white text-xs font-bold rounded-xl hover:shadow-glow-purple transition-all"
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  // Authenticated routing layout
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Default route is the main dashboard */}
        <Route path="/" element={<Dashboard />} />
        {/* Camera based Sign Recognition */}
        <Route path="/learn/ai" element={<LearnWithAI />} />
        <Route path="/learn/syllabus" element={<LearnWithSyllabus />} />
        <Route path="/learn/course/:courseId/lesson/:lessonId" element={<LessonPage />} />
        <Route path="/learn/course/:courseId/quiz" element={<LessonPage />} />
        <Route path="/speech/to-text" element={<SpeechToText />} />
        <Route path="/speech/to-speech" element={<TextToSpeech />} />
        <Route path="/practice/quiz" element={<Quiz />} />
        <Route path="/practice/quiz/:categorySlug" element={<Quiz />} />
        <Route path="/practice/quiz/:categorySlug/:levelId" element={<Quiz />} />
        <Route path="/practice/leaderboard" element={<Leaderboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/progress" element={<Progress />} />
        {/* Catch-all redirects back to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      {/* Admin Panel routes */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/modules" element={<ModulesManager />} />
        <Route path="/admin/lessons" element={<LessonsManager />} />
        <Route path="/admin/quizzes" element={<QuizzesManager />} />
        <Route path="/admin/announcements" element={<AnnouncementsManager />} />
        <Route path="/admin/badges" element={<BadgesManager />} />
        <Route path="/admin/users" element={<UsersManager />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/settings" element={<SiteSettings />} />
      </Route>
    </Routes>
  );
}

export default App;
