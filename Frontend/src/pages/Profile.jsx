import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Flame, Target, BookOpen, Settings, Zap, Mail, Calendar, User, ChevronRight, Share2, Copy } from "lucide-react";
import { GlassCard } from "../components/shared/GlassCard";
import { GradientBadge } from "../components/shared/GradientBadge";
import { useApp } from "../context/AppContext";
import { useXP } from "../hooks/useXP";
import { userApi, analyticsApi } from "../lib/api";

export function Profile() {
  const { state, t } = useApp();
  const { level, xp } = useXP();
  const [toastMessage, setToastMessage] = useState("");
  const [userData, setUserData] = useState(state.user);
  const [badgesData, setBadgesData] = useState([]);
  const [allBadges, setAllBadges] = useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, badgesRes, allBadgesRes] = await Promise.all([
          userApi.get("/api/users/me"),
          userApi.get("/api/users/me/badges"),
          userApi.get("/api/users/me/badges/all")
        ]);
        if (userRes.data) setUserData(userRes.data);
        if (badgesRes.data) setBadgesData(badgesRes.data);
        if (allBadgesRes.data) setAllBadges(allBadgesRes.data);
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
      }
    };
    fetchData();
  }, []);

  const completedCount = state.progress?.completedLessons?.length || 0;
  const quizzesCount = state.progress?.quizScores ? Object.keys(state.progress.quizScores).length : 0;

  const achievementsList = React.useMemo(() => {
    const earnedBadgeNames = badgesData.map(b => b.name?.toLowerCase());

    return allBadges.map(b => {
      const isEarned = earnedBadgeNames.includes(b.name?.toLowerCase());
      const earnedInfo = isEarned ? badgesData.find(earned => earned.name?.toLowerCase() === b.name?.toLowerCase()) : null;
      
      return {
        id: b.id || `badge-${b.name?.toLowerCase().replace(/\s+/g, '-')}`,
        title: b.name,
        description: b.description,
        xpValue: 100,
        icon: b.emoji || "🏆",
        tier: "gold",
        earned: isEarned,
        earnedDate: isEarned && earnedInfo?.earnedAt ? earnedInfo.earnedAt : null
      };
    });
  }, [badgesData, allBadges]);

  const handleShare = async (ach) => {
    try {
      // 1. Generate the share link from backend
      const res = await analyticsApi.post("/api/progress/badges/share", {
        id: ach.id,
        title: ach.title,
        description: ach.description,
        icon: ach.icon,
        tier: ach.tier,
        xpValue: ach.xpValue,
        userName: displayName,
      });

      const shareId = res.data.shareId;
      const url = `${window.location.origin}/shared/badge/${shareId}`;
      const text = `I just earned the "${ach.title}" achievement on BeyondWords! 🏆\nCheck it out here:`;

      // 2. Share using Web Share API if available
      if (navigator.share) {
        try {
          await navigator.share({
            title: `BeyondWords Achievement: ${ach.title}`,
            text: text,
            url: url,
          });
          return;
        } catch (err) {
          if (err.name !== "AbortError") console.log("Error sharing:", err);
        }
      }

      // 3. Fallback to clipboard
      await navigator.clipboard.writeText(`${text} ${url}`);
      setToastMessage(`Share link copied to clipboard!`);
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      console.error("Failed to share badge:", err);
      setToastMessage("Failed to generate share link.");
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  const handleCopyProfileUrl = async () => {
    try {
      const username = userData.username || userData.email?.split("@")[0];
      const url = `${window.location.origin}/u/${username}`;
      await navigator.clipboard.writeText(url);
      setToastMessage("Profile URL copied to clipboard!");
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const displayName = userData.name || userData.fullName || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col gap-6 max-w-4xl mx-auto select-none"
    >
      {/* Profile Header Banner */}
      <GlassCard className="overflow-hidden border border-white/[0.08] relative p-0 flex flex-col">
        {/* Banner Gradient */}
        <div className="w-full h-36 bg-gradient-brand relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        </div>

        {/* Profile Info Overlay Row */}
        <div className="px-6 pb-6 pt-0 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-5 -mt-10 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            {/* Avatar Circle */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 border-4 border-bgSecondary flex items-center justify-center text-white text-3xl font-extrabold shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              {initials}
            </div>

            <div className="flex flex-col gap-1 sm:mb-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-bold text-textPrimary leading-none">{displayName}</h2>
                <GradientBadge label={`Lvl ${level}`} gradient="brand" />
              </div>
              <p className="text-xs text-textSecondary italic">"{t("profileMotto")}"</p>
              <span className="text-[10px] text-textTertiary font-mono">@{userData.username}</span>
            </div>
          </div>

          <Link
            to="/settings"
            className="px-4 py-2 border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] text-textSecondary hover:text-textPrimary text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all sm:mb-2"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{t("editProfile")}</span>
          </Link>
        </div>
      </GlassCard>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: t("totalXp"), value: `${xp.toLocaleString()}`, icon: <Zap className="w-4 h-4 text-purple-400" /> },
          { label: t("lessonsDone"), value: completedCount, icon: <BookOpen className="w-4 h-4 text-indigo-400" /> },
          { label: t("quizzesDone"), value: quizzesCount, icon: <Award className="w-4 h-4 text-amber-400" /> },
          { label: t("accuracyCol"), value: `${userData.accuracy || 100}%`, icon: <Target className="w-4 h-4 text-emerald-400" /> },
          { label: t("streakCol"), value: `${userData.streak || 0} ${t("daysText")}`, icon: <Flame className="w-4 h-4 text-rose-400" /> },
        ].map((stat, idx) => (
          <GlassCard key={idx} className="p-4 flex flex-col items-center text-center gap-1.5 hover:scale-[1.02] transition-transform">
            <div className="p-2 bg-white/[0.03] border border-white/[0.05] rounded-xl">
              {stat.icon}
            </div>
            <span className="text-[10px] font-bold text-textTertiary uppercase font-mono">{stat.label}</span>
            <span className="text-base font-bold font-mono text-textPrimary">{stat.value}</span>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Columns: Achievements Gallery */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-1.5 border-b border-white/[0.08] pb-2">
            <Award className="w-5 h-5 text-purple-400" />
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">{t("achievementsGallery")}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievementsList.map((ach) => {
              const borderStyle = ach.earned
                ? ach.tier === "platinum"
                  ? "border-indigo-500/30 bg-indigo-500/[0.02]"
                  : ach.tier === "gold"
                  ? "border-amber-400/20 bg-amber-400/[0.01]"
                  : "border-purple-500/20 bg-purple-500/[0.01]"
                : "border-white/[0.02] opacity-40 bg-white/[0.005]";

              return (
                <GlassCard
                  key={ach.id}
                  className={`p-4 flex gap-3.5 border relative ${borderStyle} ${
                    ach.earned ? "shadow-[0_0_15px_rgba(139,92,246,0.06)] hover:scale-[1.01]" : ""
                  }`}
                >
                  <div className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.15)] shrink-0 self-center">
                    {ach.icon}
                  </div>
                  <div className="flex flex-col gap-0.5 justify-center min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-textPrimary truncate">{ach.title}</span>
                      <GradientBadge label={ach.tier} gradient={ach.tier === "platinum" ? "brand" : ach.tier === "gold" ? "amber" : "cyan"} className="scale-75 origin-left" />
                    </div>
                    <p className="text-[10px] text-textSecondary leading-snug line-clamp-2">{ach.description}</p>
                    {ach.earned && ach.earnedDate && (
                      <span className="text-[8px] font-mono text-textTertiary mt-1">{t("completed")} {ach.earnedDate}</span>
                    )}
                  </div>

                  {ach.earned && (
                    <button
                      onClick={() => handleShare(ach)}
                      title="Share Achievement"
                      className="absolute right-3 top-3 p-1.5 hover:bg-white/10 rounded-lg text-textTertiary hover:text-textPrimary transition-all duration-200 z-10"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {!ach.earned && (
                    <div className="absolute right-3 top-3 px-1.5 py-0.5 bg-black/40 border border-white/10 rounded text-[8px] text-textTertiary font-mono uppercase font-bold">
                      {t("locked")}
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Right Column: Account Meta details */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-1.5 border-b border-white/[0.08] pb-2">
            <User className="w-5 h-5 text-purple-400" />
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">{t("accountInformation")}</h3>
          </div>

          <GlassCard className="p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1 border-b border-white/[0.05] pb-3">
              <span className="text-[9px] font-bold text-textTertiary uppercase font-mono">{t("contactEmail")}</span>
              <div className="flex items-center gap-2 text-xs text-textSecondary">
                <Mail className="w-3.5 h-3.5 text-textTertiary" />
                <span>{userData.email || "No email provided"}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 border-b border-white/[0.05] pb-3">
              <span className="text-[9px] font-bold text-textTertiary uppercase font-mono">{t("profileUrl")}</span>
              <div className="flex items-center justify-between gap-2 text-xs text-textSecondary font-mono">
                <span className="truncate text-purple-400 select-all">{window.location.origin}/u/{userData.username || userData.email?.split("@")[0]}</span>
                <button 
                  onClick={handleCopyProfileUrl}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-textTertiary hover:text-white transition-colors shrink-0"
                  title="Copy Profile URL"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-textTertiary uppercase font-mono">{t("joinedDate")}</span>
              <div className="flex items-center gap-2 text-xs text-textSecondary">
                <Calendar className="w-3.5 h-3.5 text-textTertiary" />
                <span>{userData.joinedDate || new Date().toISOString().split("T")[0]}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-bgSecondary/95 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-xl flex items-center gap-2.5 backdrop-blur-md"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-textPrimary">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
