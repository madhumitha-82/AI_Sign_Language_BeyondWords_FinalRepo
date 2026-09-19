import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, User, BarChart2, Settings, LogOut, ChevronDown, Sun, Moon, UserX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../../context/AppContext";
import { useXP } from "../../hooks/useXP";
import { cn } from "../../lib/utils";
import { userApi, analyticsApi } from "../../lib/api";

export function Topbar({ onOpenSearch }) {
  const { state, logout, updateSettings, t } = useApp();
  const { level } = useXP();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      // 1. Delete all progress, XP, and badges from Analytics service
      await analyticsApi.delete("/api/progress/me").catch(err => console.warn("Failed to delete progress, but continuing...", err));
      
      // 2. Delete the user account from User service
      await userApi.delete("/api/users/me");
      
      setDropdownOpen(false);
      logout();
      navigate("/");
    } catch (err) {
      console.error("Failed to delete account:", err);
      alert(t("deleteAccountError") || "Failed to delete account. Please try again.");
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await userApi.get("/api/users/me/notifications");
      setNotifications(res.data);
      const unreadRes = await userApi.get("/api/users/me/notifications/unread-count");
      setUnreadCount(unreadRes.data.count);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    if (state.user) {
      fetchNotifications();
    }
  }, [state.user]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format initials
  const initials = state.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  // Get Breadcrumb details
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === "/") return [{ label: t("dashboard"), url: "/" }];
    if (path === "/learn/ai") return [{ label: t("learn"), url: "/learn/syllabus" }, { label: t("recognition"), url: "/learn/ai" }];
    if (path === "/learn/syllabus") return [{ label: t("learn"), url: "/learn/syllabus" }, { label: t("syllabus"), url: "/learn/syllabus" }];
    if (path.startsWith("/learn/syllabus/module/")) {
      const parts = path.split("/");
      const mId = parts[4];
      const lId = parts[6];
      return [
        { label: t("learn"), url: "/learn/syllabus" },
        { label: `${t("module")} ${mId}`, url: `/learn/syllabus` },
        { label: `${t("module")} ${mId} - Lesson ${lId}`, url: path },
      ];
    }
    if (path === "/speech/to-text") return [{ label: t("speechHub"), url: "/speech/to-text" }, { label: t("speechToText"), url: "/speech/to-text" }];
    if (path === "/speech/to-speech") return [{ label: t("speechHub"), url: "/speech/to-text" }, { label: t("textToSpeech"), url: "/speech/to-speech" }];
    if (path === "/practice/quiz") return [{ label: t("practice"), url: "/practice/quiz" }, { label: t("quiz"), url: "/practice/quiz" }];
    if (path === "/practice/leaderboard") return [{ label: t("practice"), url: "/practice/quiz" }, { label: t("leaderboard"), url: "/practice/leaderboard" }];
    if (path === "/history") return [{ label: t("history"), url: "/history" }];
    if (path === "/settings") return [{ label: t("settings"), url: "/settings" }];
    if (path === "/profile") return [{ label: "Profile", url: "/profile" }];
    if (path === "/progress") return [{ label: "Profile", url: "/profile" }, { label: "Progress Analytics", url: "/progress" }];
    const platName = JSON.parse(window.localStorage.getItem("beyondwords_site_settings") || "{}").platformName || "BeyondWords";
    return [{ label: platName, url: "/" }];
  };

  const breadcrumbs = getBreadcrumbs();
  const pageTitle = breadcrumbs[breadcrumbs.length - 1]?.label || t("dashboard");

  return (
    <header className="h-16 border-b border-glassBorder bg-bgSecondary/80 backdrop-blur-md px-6 flex items-center justify-between z-40 relative">
      {/* Left: Dynamic Breadcrumbs */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 text-xs text-textTertiary">
          <Link to="/" className="hover:text-textSecondary transition-colors">
            {JSON.parse(window.localStorage.getItem("beyondwords_site_settings") || "{}").platformName || "BeyondWords"}
          </Link>
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={idx}>
              <span>/</span>
              {idx === breadcrumbs.length - 1 ? (
                <span className="text-textSecondary truncate max-w-[120px]">{bc.label}</span>
              ) : (
                <Link to={bc.url} className="hover:text-textSecondary transition-colors truncate max-w-[120px]">{bc.label}</Link>
              )}
            </React.Fragment>
          ))}
        </div>
        <h1 className="text-lg font-bold text-textPrimary leading-tight mt-0.5">{pageTitle}</h1>
      </div>

      {/* Center: Smart Search Trigger */}
      <div className="flex-1 max-w-sm mx-4">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between gap-3 px-4 py-1.5 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.07] hover:border-white/[0.12] rounded-full text-textTertiary hover:text-textSecondary transition-all duration-200"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 shrink-0" />
            <span className="text-xs">{t("searchPlaceholder")}</span>
          </div>
          <kbd className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.08] text-[9px] rounded text-textTertiary font-mono flex items-center gap-0.5 select-none">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Notifications & Profile Avatar */}
      <div className="flex items-center gap-4">

        {/* Notification Bell */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setDropdownOpen(false);
            }}
            className={cn(
              "p-2 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] text-textSecondary hover:text-textPrimary transition-all relative",
              notificationsOpen && "bg-white/[0.05] text-textPrimary"
            )}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            )}
          </button>

          {/* Notifications Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2.5 w-80 rounded-2xl border border-glassBorder bg-bgTertiary/95 shadow-[0_12px_40px_rgba(0,0,0,0.15)] backdrop-blur-3xl p-3 flex flex-col gap-2.5 z-50">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="text-xs font-bold text-textPrimary">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={async () => {
                      try {
                        await userApi.put("/api/users/me/notifications/read-all");
                        await fetchNotifications();
                      } catch (e) {}
                    }}
                    className="text-[10px] text-purple-400 hover:text-purple-300 font-bold"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-0.5">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={async () => {
                      if (!n.isRead) {
                        try {
                          await userApi.put(`/api/users/me/notifications/${n.id}/read`);
                          setNotifications(notifications.map(item => item.id === n.id ? { ...item, isRead: true } : item));
                          setUnreadCount(Math.max(0, unreadCount - 1));
                        } catch (e) {}
                      }
                    }}
                    className={cn(
                      "p-2.5 rounded-xl border border-white/[0.04] cursor-pointer transition-all flex flex-col gap-1",
                      n.isRead ? "bg-white/[0.01] opacity-60 hover:opacity-80" : "bg-white/[0.03] border-purple-500/10 hover:bg-white/[0.05]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-textPrimary">{n.title}</span>
                      {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-1" />}
                    </div>
                    <p className="text-[10px] text-textSecondary leading-normal">{n.message || n.description}</p>
                    <span className="text-[8px] font-mono text-textTertiary self-end">{new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="text-center py-6 text-textTertiary text-xs">
                    No new notifications.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 p-1 rounded-full border border-purple-500/20 bg-purple-500/[0.02] hover:bg-purple-500/[0.05] transition-all"
          >
            {/* Avatar Circle with initials */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_10px_rgba(139,92,246,0.2)]">
              {initials}
            </div>
            <ChevronDown className={cn("w-3.5 h-3.5 text-textSecondary transition-transform", dropdownOpen && "transform rotate-180")} />
          </button>

          {/* Glassmorphic Dropdown panel */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-56 rounded-2xl border border-glassBorder bg-bgTertiary/95 shadow-[0_12px_40px_rgba(0,0,0,0.15)] backdrop-blur-3xl p-2 flex flex-col gap-0.5 z-50">
              {/* Mini User Summary */}
              <div className="px-3 py-2.5 flex items-center gap-2.5 border-b border-white/[0.06] mb-1.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {initials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-textPrimary truncate">{state.user.name}</span>
                  <span className="text-[10px] text-textAccent font-mono mt-0.5">Level {level} Learner</span>
                </div>
              </div>

              {/* Options */}
              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-textSecondary hover:text-textPrimary hover:bg-white/[0.04] transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>View Profile</span>
              </Link>

              <Link
                to="/progress"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-textSecondary hover:text-textPrimary hover:bg-white/[0.04] transition-all"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Progress Analytics</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-textSecondary hover:text-textPrimary hover:bg-white/[0.04] transition-all"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </Link>

              <div className="h-px bg-white/[0.06] my-1" />

              <button
                onClick={handleDeleteAccount}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-500 hover:text-red-400 hover:bg-red-500/[0.1] transition-all font-bold"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                  navigate("/");
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
