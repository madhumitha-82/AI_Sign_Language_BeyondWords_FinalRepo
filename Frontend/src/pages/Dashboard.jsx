import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, Trophy, Award, ArrowRight, Zap, Target, BookOpen, Star, AlertCircle, ArrowUpRight, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useXP } from "../hooks/useXP";
import { StatCard } from "../components/shared/StatCard";
import { ProgressRing } from "../components/shared/ProgressRing";
import { LevelCard } from "../components/shared/LevelCard";
import { GlassCard } from "../components/shared/GlassCard";
import { GradientBadge } from "../components/shared/GradientBadge";
import { AnimatedCounter } from "../components/shared/AnimatedCounter";
import { cn } from "../lib/utils";
import { analyticsApi, learningApi, userApi } from "../lib/api";

export function Dashboard() {
  const { state, t } = useApp();
  const modules = state.modules || [];
  const { level, xp } = useXP();
  const navigate = useNavigate();
  const [summaryData, setSummaryData] = React.useState({
    recentActivity: [],
    streak: 0,
    dailyGoal: 5,
    dailyCompleted: 0,
    weeklyStudyTime: [0,0,0,0,0,0,0],
    weakestSkill: null,
    insights: [],
    totalLessonsCompleted: 0,
    accuracy: 0,
    weeklyProgressDays: 0
  });
  const [courses, setCourses] = React.useState([]);
  const [achievements, setAchievements] = React.useState([]);

  React.useEffect(() => {
    const fetchSummary = async () => {
      try {
        const results = await Promise.allSettled([
          analyticsApi.get("/api/progress/summary"),
          learningApi.get("/api/courses"),
          userApi.get("/api/users/me/badges")
        ]);
        
        const res = results[0].status === "fulfilled" ? results[0].value : null;
        const coursesRes = results[1].status === "fulfilled" ? results[1].value : null;
        const badgesRes = results[2].status === "fulfilled" ? results[2].value : null;

        if (res?.data) {
          setSummaryData({
            recentActivity: res.data.recentActivity || [],
            streak: res.data.streak ?? state.user?.streak ?? 0,
            dailyGoal: res.data.dailyGoal || 5,
            dailyCompleted: res.data.dailyCompleted || 0,
            weeklyStudyTime: res.data.weeklyStudyTime || [0,0,0,0,0,0,0],
            weakestSkill: res.data.weakestSkill || null,
            insights: res.data.insights || [],
            totalLessonsCompleted: res.data.totalLessonsCompleted || 0,
            accuracy: res.data.accuracy || 0,
            weeklyProgressDays: res.data.weeklyProgressDays || 0
          });
        } else if (results[0].status === "rejected") {
          console.error("Failed to load analytics summary:", results[0].reason);
        }
        
        if (coursesRes?.data) {
          setCourses(coursesRes.data);
        } else if (results[1].status === "rejected") {
          console.error("Failed to load courses:", results[1].reason);
        }
        
        if (badgesRes?.data) {
          setAchievements(badgesRes.data);
        } else if (results[2].status === "rejected") {
          console.error("Failed to load badges:", results[2].reason);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };
    fetchSummary();
  }, [state.user?.streak]);

  const [announcements, setAnnouncements] = React.useState(() => {
    const list = JSON.parse(window.localStorage.getItem("beyondwords_announcements") || "[]");
    const dismissed = JSON.parse(window.localStorage.getItem(`beyondwords_dismissed_${state.user?.email}`) || "[]");
    return list.filter(a => a.status === "active" && !dismissed.includes(a.id));
  });

  const handleDismissAnnouncement = (id) => {
    const dismissed = JSON.parse(window.localStorage.getItem(`beyondwords_dismissed_${state.user?.email}`) || "[]");
    dismissed.push(id);
    window.localStorage.setItem(`beyondwords_dismissed_${state.user?.email}`, JSON.stringify(dismissed));
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  // Handle continuing to learn
  const handleContinueLearning = () => {
    navigate("/learn/syllabus");
  };

  const levelsProgression = courses.map((course, index) => {
    const courseId = course.id;
    // Calculate progress based on state.progress.completedLessons and course lessons
    let totalCourseLessons = 0;
    let completedCourseLessons = 0;
    
    if (course.modules) {
      course.modules.forEach(mod => {
        if (mod.lessons) {
          totalCourseLessons += mod.lessons.length;
          mod.lessons.forEach(lesson => {
            if (state.progress?.completedLessons?.includes(lesson.id)) {
              completedCourseLessons++;
            }
          });
        }
      });
    }

    let progress = totalCourseLessons > 0 ? (completedCourseLessons / totalCourseLessons) * 100 : 0;
    let status = progress === 100 ? "completed" : (progress > 0 ? "in-progress" : "locked");
    // Unlock first course if all are locked
    if (index === 0 && status === "locked") status = "in-progress";

    return {
      levelNumber: index + 1,
      title: course.title,
      subtitle: course.description,
      status: status,
      starsEarned: status === "completed" ? 3 : (status === "in-progress" ? 2 : 0),
      totalStars: 3,
      progress: progress,
      requiredXp: index * 500,
    };
  });

  // Days of week for weekly goal card
  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"].map((name, i) => ({
    name,
    completed: summaryData.weeklyStudyTime[i] > 0
  }));

  // AI recommendations based on weak areas
  const aiRecommendations = summaryData.weakestSkill ? [
    {
      title: `Review: ${summaryData.weakestSkill}`,
      reason: "Based on recent quiz accuracy",
      xp: "+100 XP",
      type: "AI Coach",
    },
    {
      title: "General Practice",
      reason: "Daily recommended drill",
      xp: "+30 XP",
      type: "Practice",
    }
  ] : [];

  // Get last 3 earned achievements
  const recentAchievements = achievements.slice(0, 3);

  // Get last 5 learning activities
  const recentActivity = summaryData.recentActivity || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col gap-6"
    >
      {/* Active Announcement Banners */}
      {announcements.map((ann) => {
        let bannerStyle = "bg-blue-500/10 border-blue-500/20 text-blue-400";
        if (ann.type === "success") bannerStyle = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
        if (ann.type === "warning") bannerStyle = "bg-amber-500/10 border-amber-500/20 text-amber-400";

        return (
          <div
            key={ann.id}
            className={`flex items-start justify-between p-4 border rounded-2xl ${bannerStyle} backdrop-blur-md shadow-lg animate-fadeIn text-left`}
          >
            <div className="flex flex-col gap-1 pr-4">
              <span className="font-extrabold text-xs text-textPrimary uppercase tracking-wide">
                📢 {ann.title}
              </span>
              <p className="text-xs text-textSecondary leading-relaxed mt-0.5">
                {ann.message}
              </p>
            </div>
            <button
              onClick={() => handleDismissAnnouncement(ann.id)}
              className="p-1 hover:bg-white/10 rounded-lg text-textSecondary shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}

      {/* Page Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Welcome Card */}
          <GlassCard className="p-6 md:p-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 border-none text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_10px_30px_rgba(99,102,241,0.2)]">
            {/* Background design accents */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="flex-1 flex flex-col items-start gap-2 relative z-10">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {t("welcomeBack").replace("{name}", state.user.name.split(" ")[0])}
                </h2>
              </div>
              <p className="text-sm text-indigo-100 max-w-md mt-1">
                {JSON.parse(window.localStorage.getItem("beyondwords_site_settings") || "{}").welcomeBannerMessage || t("streakDescription").replace("{streak}", summaryData.streak)}
              </p>
              <button
                onClick={handleContinueLearning}
                className="mt-5 px-5 py-2.5 bg-white text-indigo-600 hover:bg-indigo-50 hover:shadow-lg text-sm font-bold rounded-xl flex items-center gap-2 transition-all duration-300 active:scale-95 group"
              >
                {t("continueLearning")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Decorative sign-language hand wave */}
            <div className="w-32 h-32 md:w-40 md:h-40 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center text-6xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] shrink-0 select-none animate-bounce relative z-10" style={{ animationDuration: '3s' }}>
              👋
            </div>
          </GlassCard>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title={t("streak")}
              value={`${summaryData.streak || 0} Days`}
              icon={<Flame className="w-5 h-5" />}
              color="orange"
              subtext={summaryData.streak > 0 ? "Keep it up!" : "Start a streak!"}
            />
            <StatCard
              title={t("xpEarned")}
              value={<AnimatedCounter from={0} to={xp || 0} duration={0.8} />}
              icon={<Zap className="w-5 h-5" />}
              color="purple"
              subtext={t("levelN").replace("{n}", level || 1)}
            />
            <StatCard
              title={t("accuracy")}
              value={`${Math.round(summaryData.accuracy || 0)}%`}
              icon={<Target className="w-5 h-5" />}
              color="green"
              subtext={summaryData.accuracy > 80 ? "Great accuracy!" : "Keep practicing!"}
            />
            <StatCard
              title={t("lessonsDone")}
              value={<AnimatedCounter from={0} to={summaryData.totalLessonsCompleted || 0} duration={0.8} />}
              icon={<BookOpen className="w-5 h-5" />}
              color="blue"
              subtext={summaryData.dailyCompleted > 0 ? t("plusToday").replace("{count}", summaryData.dailyCompleted) : "None today"}
            />
          </div>

          {/* Level Progression */}
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
              <Trophy className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-textPrimary tracking-wider uppercase">{t("levelProgression")}</h3>
            </div>
            <div className="flex flex-col">
              {levelsProgression.map((lvl, index) => (
                <LevelCard
                  key={lvl.levelNumber}
                  levelNumber={lvl.levelNumber}
                  title={lvl.title}
                  subtitle={lvl.subtitle}
                  status={lvl.status}
                  starsEarned={lvl.starsEarned}
                  totalStars={lvl.totalStars}
                  progress={lvl.progress}
                  requiredXp={lvl.requiredXp}
                  showConnector={index < levelsProgression.length - 1}
                  onAction={() => navigate(lvl.status === "completed" ? "/practice/quiz" : "/learn/syllabus")}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="flex flex-col gap-6">
          {/* Daily Goal Card */}
          <GlassCard className="p-6 flex flex-col items-center gap-4 text-center">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">{t("dailyGoal")}</h3>
              {summaryData.dailyCompleted >= summaryData.dailyGoal ? (
                <p className="text-xs font-bold text-emerald-400">Daily goal completed!</p>
              ) : (
                <p className="text-xs text-textSecondary">{t("dailyGoalDesc")}</p>
              )}
            </div>
            {/* SVG Circular Ring */}
            <ProgressRing percentage={summaryData.dailyGoal > 0 ? (Math.min(summaryData.dailyCompleted, summaryData.dailyGoal) / summaryData.dailyGoal) * 100 : 0} size={130} strokeWidth={11} />
            <div className="text-xs text-textSecondary font-mono mt-1 flex flex-col items-center gap-1">
              <span className="text-textPrimary font-bold flex items-center gap-1">
                {summaryData.dailyCompleted >= summaryData.dailyGoal && <span className="text-emerald-400">✓</span>}
                {t("completedToday").replace("{completed}", Math.min(summaryData.dailyCompleted, summaryData.dailyGoal)).replace("{total}", summaryData.dailyGoal)}
              </span>
            </div>
          </GlassCard>

          {/* Weekly Streak Tracker */}
          <GlassCard className="p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">{t("weeklyProgress")}</span>
              <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-0.5">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {t("daysGoal").replace("{current}", summaryData.weeklyProgressDays || 0).replace("{total}", 7)}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono transition-all border",
                      day.completed
                        ? "bg-gradient-amber text-white border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                        : "bg-white/[0.02] border-white/[0.06] text-textTertiary"
                    )}
                  >
                    {day.completed ? "🔥" : day.name}
                  </div>
                  <span className="text-[10px] text-textTertiary font-semibold">{day.name}</span>
                </div>
              ))}
            </div>
          </GlassCard>



          {/* Recent Activity */}
          <GlassCard className="p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">{t("recentActivity")}</span>
              <button
                onClick={() => navigate("/history")}
                className="text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors"
              >
                {t("viewHistory")}
              </button>
            </div>
            <div className="flex flex-col gap-3.5">
              {recentActivity.length > 0 ? (
                recentActivity.map((act) => {
                  return (
                    <div
                      key={act.id || Math.random().toString()}
                      className="flex items-start gap-3 p-1.5 rounded-xl hover:bg-white/[0.03] transition-all select-none group"
                    >
                      <div className="p-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-indigo-400 shrink-0 mt-0.5 group-hover:bg-purple-500/10 group-hover:text-purple-400 transition-colors">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-textPrimary truncate group-hover:text-purple-400 transition-colors">
                          {act.activityType === "LESSON_COMPLETE" 
                            ? (act.description === act.activityType ? "Introduction to ISL" : act.description)
                            : act.activityType === "FINAL_QUIZ_COMPLETE"
                            ? `${act.description === act.activityType ? "Introduction to ISL" : act.description} - Final Quiz`
                            : (act.activityType || "").toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className="text-[10px] text-textSecondary truncate">
                          {act.activityType === "LESSON_COMPLETE" 
                            ? "Lesson 1 Completed"
                            : act.activityType === "FINAL_QUIZ_COMPLETE"
                            ? "Successfully completed"
                            : act.description === act.activityType ? "Successfully completed" : act.description}
                        </span>
                        <span className="text-[9px] text-textTertiary mt-0.5 font-mono">
                          {new Date(act.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-textTertiary text-center py-4">No recent activity</div>
              )}
            </div>
          </GlassCard>

          {/* Achievements Preview */}
          <GlassCard className="p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">{t("achievements")}</span>
              <button
                onClick={() => navigate("/profile")}
                className="text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors"
              >
                {t("seeAll")}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {recentAchievements.length > 0 ? recentAchievements.map((ach, idx) => (
                <div
                  key={ach.id || idx}
                  className="flex flex-col items-center gap-1.5 text-center p-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl shadow-inner relative group"
                >
                  <div className="text-2xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">{ach.icon}</div>
                  <span className="text-[10px] text-textPrimary font-semibold truncate w-full">{ach.title}</span>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 bg-bgTertiary border border-white/10 p-2 rounded-lg text-[9px] text-textSecondary w-36 pointer-events-none transition-all z-10 shadow-lg">
                    {ach.description}
                  </div>
                </div>
              )) : (
                <div className="col-span-3 text-center py-4 text-xs text-textTertiary">Complete lessons to earn badges!</div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
