import React from "react";
import { motion } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Zap, Award, Flame, Clock, Target, Sparkles, TrendingUp, HelpCircle } from "lucide-react";
import { GlassCard } from "../components/shared/GlassCard";
import { GradientBadge } from "../components/shared/GradientBadge";
import { StatCard } from "../components/shared/StatCard";
import { ActivityHeatmap } from "../components/shared/ActivityHeatmap";
import { useApp } from "../context/AppContext";
import { useXP } from "../hooks/useXP";
import { analyticsApi, userApi } from "../lib/api";

// Mock data for charts that don't have backend history yet
const monthlyData = [
  { name: "Jan", lessons: 10 },
  { name: "Feb", lessons: 15 },
  { name: "Mar", lessons: 12 },
  { name: "Apr", lessons: 22 },
  { name: "May", lessons: 18 },
  { name: "Jun", lessons: 25 },
];

const accuracyData = [
  { week: "Wk 1", accuracy: 82 },
  { week: "Wk 2", accuracy: 85 },
  { week: "Wk 3", accuracy: 89 },
  { week: "Wk 4", accuracy: 94 },
];

const xpHistoryData = [
  { week: "Wk 1", xp: 1200 },
  { week: "Wk 2", xp: 1600 },
  { week: "Wk 3", xp: 2100 },
  { week: "Wk 4", xp: 2450 },
];

export function Progress() {
  const { state, t } = useApp();
  const { level, xp } = useXP();
  
  const [heatmapData, setHeatmapData] = React.useState(null);
  const [summaryData, setSummaryData] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [heatmapRes, summaryRes] = await Promise.all([
          analyticsApi.get("/api/progress/heatmap"),
          analyticsApi.get("/api/progress/summary")
        ]);
        setHeatmapData(heatmapRes.data);
        setSummaryData(summaryRes.data);
      } catch (err) {
        console.error("Failed to fetch progress data:", err);
      }
    };
    fetchData();
  }, []);

  const weeklyData = React.useMemo(() => {
    if (!summaryData?.weeklyStudyTime) return [];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return summaryData.weeklyStudyTime.map((minutes, idx) => ({
      day: days[idx],
      minutes: minutes
    }));
  }, [summaryData]);

  // Custom tooltips for Recharts
  const CustomTooltip = ({ active, payload, label, unit = "" }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bgTertiary border border-white/10 p-2 rounded-lg text-xs font-mono shadow-md">
          <p className="text-textSecondary">{label}</p>
          <p className="text-purple-400 font-bold">
            {payload[0].value} {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  const accuracyStr = summaryData?.accuracy ? summaryData.accuracy.toFixed(1) : (state.user?.accuracy || 0);
  const streakDays = summaryData?.streak || state.user?.streak || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col gap-6 max-w-5xl mx-auto select-none pb-12"
    >
      <div className="flex flex-col gap-0.5 border-b border-white/[0.08] pb-4">
        <h2 className="text-xl font-bold text-textPrimary">{t("progressAnalyticsTitle") || "Progress Analytics"}</h2>
        <p className="text-xs text-textSecondary">
          {t("progressAnalyticsDesc") || "Track your signing accuracy, streaks, and time spent learning."}
        </p>
      </div>

      {/* Summary stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title={t("totalXp") || "Total XP"} value={xp} icon={<Zap className="w-5 h-5" />} />
        <StatCard title={t("currentLevel") || "Level"} value={`${t("levelCol") || "Lvl"} ${level}`} icon={<Award className="w-5 h-5" />} />
        <StatCard title={t("streakCol") || "Streak"} value={`${streakDays} ${t("daysText") || "days"}`} icon={<Flame className="w-5 h-5" />} glowType="amber" />
        <StatCard title={t("studyDuration") || "Study Time"} value={summaryData?.weeklyStudyTime ? `${summaryData.weeklyStudyTime.reduce((a,b)=>a+b, 0)} mins` : "0 mins"} icon={<Clock className="w-5 h-5" />} />
        <StatCard title={t("avgAccuracy") || "Accuracy"} value={`${accuracyStr}%`} icon={<Target className="w-5 h-5" />} glowType="green" />
      </div>

      {/* GitHub Activity Heatmap Section */}
      <GlassCard className="p-5 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-white/[0.06] pb-2">
          <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">{t("heatmapTitle") || "Activity Heatmap"}</span>
          <GradientBadge label={t("allYear") || "All Time"} gradient="brand" />
        </div>
        <ActivityHeatmap data={heatmapData} />
      </GlassCard>

      {/* Charts row (Weekly Bar / Monthly Line) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Learning time */}
        <GlassCard className="p-5 flex flex-col gap-3">
          <span className="text-xs font-bold text-textPrimary uppercase tracking-wider border-b border-white/[0.06] pb-2">
            {t("weeklyStudyTime") || "Weekly Study Time"}
          </span>
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip unit="mins" />} cursor={{ fill: "rgba(255,255,255,0.01)" }} />
                <Bar dataKey="minutes" fill="url(#barGrad)" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Monthly Lessons Completed */}
        <GlassCard className="p-5 flex flex-col gap-3">
          <span className="text-xs font-bold text-textPrimary uppercase tracking-wider border-b border-white/[0.06] pb-2">
            {t("monthlyLessonsCompleted") || "Historical Trends"}
          </span>
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip unit="lessons" />} />
                <Line type="monotone" dataKey="lessons" stroke="#06b6d4" strokeWidth={3} dot={{ stroke: "#06b6d4", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Skills Analysis */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold text-textPrimary uppercase tracking-wider border-b border-white/[0.06] pb-1">
          {t("signSkillsProfile") || "Skill Analysis"}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GlassCard className="p-4 flex flex-col gap-2 border-white/[0.05]">
            <span className="text-[10px] font-mono text-textTertiary uppercase font-bold">{t("strongestSkill") || "Strongest Skill"}</span>
            <div className="flex flex-col gap-0.5 mt-1">
              <span className="text-sm font-bold text-textPrimary leading-tight">{summaryData?.strongestSkill || "Not Enough Data"}</span>
              <p className="text-[10px] text-textSecondary mt-0.5">{summaryData?.strongestSkillDescription || "Keep learning to unlock insights"}</p>
            </div>
            <GradientBadge label="Verified" gradient="green" className="self-start mt-2 scale-90 origin-left" />
          </GlassCard>

          <GlassCard className="p-4 flex flex-col gap-2 border-white/[0.05]">
            <span className="text-[10px] font-mono text-textTertiary uppercase font-bold">{t("weakestSkill") || "Needs Improvement"}</span>
            <div className="flex flex-col gap-0.5 mt-1">
              <span className="text-sm font-bold text-textPrimary leading-tight">{summaryData?.weakestSkill || "No weak areas detected"}</span>
              <p className="text-[10px] text-textSecondary mt-0.5">{summaryData?.weakestSkillDescription || "Great job!"}</p>
            </div>
            {summaryData?.weakestSkill && <GradientBadge label="Practice Needed" gradient="amber" className="self-start mt-2 scale-90 origin-left" />}
          </GlassCard>
        </div>
      </div>

      {/* Mid row: Streaks & Accuracy Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Streak details */}
        <GlassCard className="p-5 flex flex-col gap-4 lg:col-span-1">
          <span className="text-xs font-bold text-textPrimary uppercase tracking-wider border-b border-white/[0.06] pb-2">
            {t("streakCol") || "Streak"}
          </span>
          <div className="flex flex-col gap-4 flex-grow justify-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                🔥
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold font-mono text-textPrimary">{streakDays} {t("daysText") || "days"}</span>
                <span className="text-[10px] text-textSecondary">{t("currentStreak") || "Current Streak"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-white/[0.05] pt-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xl">
                ⚡
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold font-mono text-textPrimary">{Math.max(streakDays, 12)} {t("daysText") || "days"}</span>
                <span className="text-[10px] text-textSecondary">{t("longestRecordedStreak") || "Longest Streak"}</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Accuracy trends line chart */}
        <GlassCard className="p-5 flex flex-col gap-3 lg:col-span-2">
          <span className="text-xs font-bold text-textPrimary uppercase tracking-wider border-b border-white/[0.06] pb-2">
            {t("quizAccuracyTime") || "Accuracy Timeline"}
          </span>
          <div className="h-48 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="week" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip unit="%" />} />
                <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={3} dot={{ stroke: "#10b981", strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Bottom row: AI Insights & XP History Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insight report */}
        <GlassCard className="p-5 flex flex-col gap-3 border-cyan-500/15">
          <div className="flex justify-between items-center border-b border-white/[0.06] pb-2">
            <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">{t("aiInsightEngine") || "AI Insights"}</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 font-mono bg-cyan-400/10 px-2 py-0.5 rounded">
              <Sparkles className="w-3 h-3" /> {t("coachFeedback") || "Generated by AI"}
            </span>
          </div>
          <ul className="flex flex-col gap-3 text-xs text-textSecondary leading-relaxed py-2 list-disc pl-4">
            {summaryData?.insights?.map((insight, idx) => (
              <li key={idx}>{insight}</li>
            ))}
            {!summaryData?.insights?.length && (
               <li>Complete more lessons and quizzes to generate AI insights about your performance!</li>
            )}
          </ul>
        </GlassCard>

        {/* XP History area chart */}
        <GlassCard className="p-5 flex flex-col gap-3">
          <span className="text-xs font-bold text-textPrimary uppercase tracking-wider border-b border-white/[0.06] pb-2">
            {t("xpHistoryProgression") || "XP Progression"}
          </span>
          <div className="h-44 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={xpHistoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip unit="XP" />} />
                <Area type="monotone" dataKey="xp" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
