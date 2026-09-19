import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BookOpen,
  Mic,
  Trophy,
  History,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  Award,
  ChevronLeft,
  ChevronRight,
  Flame,
  Check,
  Lock,
  HelpCircle,
  Play,
  Sun,
  Moon
} from "lucide-react";
import { useSidebar } from "../../context/SidebarContext";
import { useApp } from "../../context/AppContext";
import { useXP } from "../../hooks/useXP";
import { useProgress } from "../../hooks/useProgress";
import { cn } from "../../lib/utils";

export function Sidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { state, toggleModuleExpanded, logout, updateSettings, t } = useApp();
  const modules = state.modules || [];
  const activeCourseId = parseInt(window.localStorage.getItem("beyondwords_active_course_id") || "1");
  const filteredModules = modules.filter(m => (m.courseId ? parseInt(m.courseId) : 1) === activeCourseId);
  
  const { completedLessons, isModuleUnlocked, getModuleProgress } = useProgress();
  const { level, progressPercent, xp, xpToNextLevel } = useXP();
  const location = useLocation();
  const navigate = useNavigate();

  const [hoveredModuleId, setHoveredModuleId] = useState(null);

  // Navigation menu expand states
  const [menuExpand, setMenuExpand] = useState(() => {
    try {
      const saved = window.localStorage.getItem("sidebar_menu_expand");
      return saved ? JSON.parse(saved) : { learn: true, speech: true, practice: true };
    } catch {
      return { learn: true, speech: true, practice: true };
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("sidebar_menu_expand", JSON.stringify(menuExpand));
    } catch (e) {
      console.error(e);
    }
  }, [menuExpand]);

  const toggleMenu = (key) => {
    setMenuExpand((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (path) => location.pathname === path;
  const isSubActive = (path) => location.pathname.startsWith(path);

  // Initials for avatar
  const initials = state.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Determine active lesson and status for the module subtree
  const getLessonStatus = (lesson, mod) => {
    if (!mod.unlocked && mod.id !== 1 && !isModuleUnlocked(mod.id)) {
      return "locked";
    }
    if (completedLessons.includes(lesson.id)) {
      return "completed";
    }
    // Check if it is the first uncompleted lesson of the module (making it in-progress)
    const lessonsInModule = mod.lessons.filter((l) => l.type === "lesson");
    const firstUncompleted = lessonsInModule.find((l) => !completedLessons.includes(l.id));
    if (firstUncompleted && firstUncompleted.id === lesson.id) {
      return "in-progress";
    }
    // Force Module 1 to be fully unlocked for custom content/video placing
    if (mod.id === 1) {
      return "available";
    }
    if (lesson.type === "quiz") {
      // Unlocked if previous lessons in module are completed
      const allLessonsCompleted = lessonsInModule.every((l) => completedLessons.includes(l.id));
      return allLessonsCompleted ? "available" : "locked";
    }
    return "locked";
  };

  return (
    <motion.div
      animate={{ width: isCollapsed ? 70 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen bg-bgSecondary border-r border-glassBorder backdrop-blur-xl flex flex-col justify-between shrink-0 select-none overflow-y-auto overflow-x-hidden relative"
    >
      {/* Header Logo Section */}
      <div>
        <div className={cn("flex items-center justify-between p-4 h-16 border-b border-glassBorder")}>
          <div className="flex items-center gap-3">
            {/* Logo Gradient Icon */}
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4" />
                <path d="M18 10V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4" />
                <path d="M10 11.5V9a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4" />
                <path d="M6 14V11a2 2 0 0 0-2-2 2 2 0 0 0-2 2v5a7 7 0 0 0 7 7h1a8 8 0 0 0 8-8v-2a2 2 0 0 0-2-2 2 2 0 0 0-2 2" />
              </svg>
            </div>
            {!isCollapsed && (
              <span className="text-lg font-extrabold tracking-tight text-textPrimary">
                {JSON.parse(window.localStorage.getItem("beyondwords_site_settings") || "{}").platformName || "BeyondWords"}
              </span>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-textSecondary hover:text-textPrimary transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed Collapse Toggle */}
        {isCollapsed && (
          <div className="flex justify-center py-2">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-textSecondary hover:text-textPrimary transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation list */}
        <nav className="p-3 flex flex-col gap-1">
          {/* Dashboard */}
          <Link
            to="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group",
              isActive("/")
                ? "bg-purple-500/12 text-white border-l-[3px] border-purple-500 shadow-[inset_4px_0_10px_rgba(139,92,246,0.15)]"
                : "text-textSecondary hover:text-textPrimary hover:bg-white/[0.03]"
            )}
          >
            <Home className={cn("w-4 h-4 shrink-0", isActive("/") ? "text-purple-400" : "")} />
            {!isCollapsed && <span>{t("dashboard")}</span>}
            {isCollapsed && (
              <div className="absolute left-16 bg-bgTertiary border border-white/10 text-xs px-2.5 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                {t("dashboard")}
              </div>
            )}
          </Link>

          {/* Learn Expandable */}
          <div className="flex flex-col">
            <button
              onClick={() => !isCollapsed && toggleMenu("learn")}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-textSecondary hover:text-textPrimary hover:bg-white/[0.03] transition-all",
                isSubActive("/learn") && "text-textPrimary"
              )}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 shrink-0 text-indigo-400" />
                {!isCollapsed && <span>{t("learn")}</span>}
              </div>
              {!isCollapsed && (
                <ChevronDown
                  className={cn("w-4 h-4 text-textTertiary transition-transform duration-200", menuExpand.learn && "transform rotate-180")}
                />
              )}
            </button>

            <AnimatePresence initial={false}>
              {!isCollapsed && menuExpand.learn && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden pl-7 flex flex-col gap-1 border-l border-white/[0.05] ml-5 mt-0.5"
                >
                  <Link
                    to="/learn/ai"
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                      isActive("/learn/ai") ? "text-purple-400 font-semibold" : "text-textSecondary hover:text-textPrimary"
                    )}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{t("recognition")}</span>
                  </Link>

                  <Link
                    to="/learn/syllabus"
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                      isActive("/learn/syllabus") ? "text-purple-400 font-semibold" : "text-textSecondary hover:text-textPrimary"
                    )}
                  >
                    <Award className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{t("syllabus")}</span>
                  </Link>
                  <div className="flex flex-col gap-2 mt-1">
                    {filteredModules.map((mod) => {
                      const modUnlocked = mod.unlocked || isModuleUnlocked(mod.id);
                      const isModExpanded = hoveredModuleId === mod.id;
                      const modCompletion = getModuleProgress(mod.id);

                      return (
                        <div
                          key={mod.id}
                          className="flex flex-col gap-0.5 bg-white/[0.01] border border-white/[0.03] rounded-lg p-1.5"
                          onMouseEnter={() => modUnlocked && setHoveredModuleId(mod.id)}
                          onMouseLeave={() => setHoveredModuleId(null)}
                        >
                          <button
                            onClick={() => modUnlocked && toggleModuleExpanded(mod.id)}
                            className={cn(
                              "w-full flex items-center justify-between text-left text-[11px] font-semibold transition-colors",
                              modUnlocked ? "text-textSecondary hover:text-textPrimary" : "text-textTertiary cursor-not-allowed"
                            )}
                          >
                            <span className="truncate">Mod {mod.id}: {mod.title}</span>
                            <div className="flex items-center gap-1">
                              {!modUnlocked ? (
                                <Lock className="w-2.5 h-2.5 text-textTertiary" />
                              ) : (
                                <>
                                  <span className="text-[10px] font-mono text-purple-400">{modCompletion}%</span>
                                  <ChevronDown className={cn("w-3 h-3 text-textTertiary transition-transform", isModExpanded && "transform rotate-180")} />
                                </>
                              )}
                            </div>
                          </button>

                          {/* Subtree Lessons List */}
                          <AnimatePresence initial={false}>
                            {modUnlocked && isModExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden flex flex-col gap-1 mt-1 pl-1"
                              >
                                {mod.lessons.map((les) => {
                                  const status = getLessonStatus(les, mod);
                                  const activePath = `/learn/syllabus/module/${mod.id}/lesson/${les.id}`;
                                  const isLesActive = location.pathname === activePath;

                                  let iconElement = <Lock className="w-3 h-3 text-textTertiary" />;
                                  if (status === "completed") {
                                    iconElement = <Check className="w-3 h-3 text-emerald-400" />;
                                  } else if (status === "in-progress") {
                                    iconElement = <Play className="w-3 h-3 text-amber-400 fill-amber-400" />;
                                  } else if (les.type === "quiz" && status === "available") {
                                    iconElement = <HelpCircle className="w-3 h-3 text-cyan-400" />;
                                  }

                                  return (
                                    <Link
                                      key={les.id}
                                      to={status !== "locked" ? activePath : "#"}
                                      onClick={(e) => status === "locked" && e.preventDefault()}
                                      className={cn(
                                        "flex items-center justify-between px-2 py-1.5 rounded text-[10px] font-medium transition-all",
                                        isLesActive
                                          ? "bg-purple-500/10 text-white font-semibold border-l-2 border-purple-500"
                                          : status === "locked"
                                          ? "text-textTertiary cursor-not-allowed"
                                          : "text-textSecondary hover:text-textPrimary"
                                      )}
                                    >
                                      <div className="flex items-center gap-1.5 truncate">
                                        {iconElement}
                                        <span className="truncate">
                                          {les.type === "quiz" ? "Quiz" : `L${les.id}`} – {les.title}
                                        </span>
                                      </div>
                                      {status === "in-progress" && (
                                        <span className="text-[8px] font-mono bg-amber-500/10 text-amber-400 px-1 rounded">45%</span>
                                      )}
                                    </Link>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Speech Hub Expandable */}
          <div className="flex flex-col">
            <button
              onClick={() => !isCollapsed && toggleMenu("speech")}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-textSecondary hover:text-textPrimary hover:bg-white/[0.03] transition-all",
                isSubActive("/speech") && "text-textPrimary"
              )}
            >
              <div className="flex items-center gap-3">
                <Mic className="w-4 h-4 shrink-0 text-cyan-400" />
                {!isCollapsed && <span>{t("speechHub")}</span>}
              </div>
              {!isCollapsed && (
                <ChevronDown
                  className={cn("w-4 h-4 text-textTertiary transition-transform duration-200", menuExpand.speech && "transform rotate-180")}
                />
              )}
            </button>

            <AnimatePresence initial={false}>
              {!isCollapsed && menuExpand.speech && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden pl-7 flex flex-col gap-1 border-l border-white/[0.05] ml-5 mt-0.5"
                >
                  <Link
                    to="/speech/to-text"
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-medium transition-all block",
                      isActive("/speech/to-text") ? "text-purple-400 font-semibold" : "text-textSecondary hover:text-textPrimary"
                    )}
                  >
                    {t("speechToText")}
                  </Link>
                  <Link
                    to="/speech/to-speech"
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-medium transition-all block",
                      isActive("/speech/to-speech") ? "text-purple-400 font-semibold" : "text-textSecondary hover:text-textPrimary"
                    )}
                  >
                    {t("textToSpeech")}
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Practice Expandable */}
          <div className="flex flex-col">
            <button
              onClick={() => !isCollapsed && toggleMenu("practice")}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-textSecondary hover:text-textPrimary hover:bg-white/[0.03] transition-all",
                isSubActive("/practice") && "text-textPrimary"
              )}
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-4 h-4 shrink-0 text-amber-400" />
                {!isCollapsed && <span>{t("practice")}</span>}
              </div>
              {!isCollapsed && (
                <ChevronDown
                  className={cn("w-4 h-4 text-textTertiary transition-transform duration-200", menuExpand.practice && "transform rotate-180")}
                />
              )}
            </button>

            <AnimatePresence initial={false}>
              {!isCollapsed && menuExpand.practice && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden pl-7 flex flex-col gap-1 border-l border-white/[0.05] ml-5 mt-0.5"
                >
                  <Link
                    to="/practice/quiz"
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-medium transition-all block",
                      isActive("/practice/quiz") ? "text-purple-400 font-semibold" : "text-textSecondary hover:text-textPrimary"
                    )}
                  >
                    {t("quiz")}
                  </Link>
                  <Link
                    to="/practice/leaderboard"
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-medium transition-all block",
                      isActive("/practice/leaderboard") ? "text-purple-400 font-semibold" : "text-textSecondary hover:text-textPrimary"
                    )}
                  >
                    {t("leaderboard")}
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* History */}
          <Link
            to="/history"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group",
              isActive("/history")
                ? "bg-purple-500/12 text-white border-l-[3px] border-purple-500 shadow-[inset_4px_0_10px_rgba(139,92,246,0.15)]"
                : "text-textSecondary hover:text-textPrimary hover:bg-white/[0.03]"
            )}
          >
            <History className={cn("w-4 h-4 shrink-0", isActive("/history") ? "text-purple-400" : "")} />
            {!isCollapsed && <span>{t("history")}</span>}
            {isCollapsed && (
              <div className="absolute left-16 bg-bgTertiary border border-white/10 text-xs px-2.5 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                {t("history")}
              </div>
            )}
          </Link>

          {/* Settings */}
          <Link
            to="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group",
              isActive("/settings")
                ? "bg-purple-500/12 text-white border-l-[3px] border-purple-500 shadow-[inset_4px_0_10px_rgba(139,92,246,0.15)]"
                : "text-textSecondary hover:text-textPrimary hover:bg-white/[0.03]"
            )}
          >
            <Settings className={cn("w-4 h-4 shrink-0", isActive("/settings") ? "text-purple-400" : "")} />
            {!isCollapsed && <span>{t("settings")}</span>}
            {isCollapsed && (
              <div className="absolute left-16 bg-bgTertiary border border-white/10 text-xs px-2.5 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                {t("settings")}
              </div>
            )}
          </Link>

        </nav>
      </div>

      {/* Bottom Footer Options: Logout */}
      <div className="p-3.5 border-t border-glassBorder mt-auto bg-white/[0.01]">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] transition-all relative group"
          title="Logout"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>{t("logout")}</span>}
          {isCollapsed && (
            <div className="absolute left-16 bg-bgTertiary border border-white/10 text-xs px-2.5 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
              {t("logout")}
            </div>
          )}
        </button>
      </div>
    </motion.div>
  );
}
