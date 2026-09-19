import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Award, ExternalLink, ArrowRight, CheckCircle2 } from "lucide-react";
import { analyticsApi } from "../lib/api";
import { GlassCard } from "../components/shared/GlassCard";
import { GradientBadge } from "../components/shared/GradientBadge";

export function SharedBadgeView() {
  const { shareId } = useParams();
  const [badgeData, setBadgeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Fetch the shared badge publicly
    analyticsApi
      .get(`/api/public/shared-badge/${shareId}`)
      .then((res) => {
        setBadgeData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load shared badge", err);
        setError(true);
        setLoading(false);
      });
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06060c] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !badgeData) {
    return (
      <div className="min-h-screen bg-[#06060c] flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full p-8 text-center flex flex-col items-center gap-4 border-red-500/20 bg-red-500/[0.02]">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 text-2xl">
            😕
          </div>
          <h2 className="text-xl font-bold text-white">Badge Not Found</h2>
          <p className="text-sm text-white/60">
            This shared badge link is invalid or has expired.
          </p>
          <Link
            to="/"
            className="mt-4 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-all"
          >
            Go Home
          </Link>
        </GlassCard>
      </div>
    );
  }

  const dateStr = new Date(badgeData.sharedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getTierColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case "platinum":
        return "brand";
      case "gold":
        return "amber";
      case "silver":
        return "gray";
      case "bronze":
      default:
        return "orange";
    }
  };

  const getTierBorder = (tier) => {
    switch (tier?.toLowerCase()) {
      case "platinum":
        return "border-indigo-500/40 shadow-[0_0_30px_rgba(99,102,241,0.2)]";
      case "gold":
        return "border-amber-400/40 shadow-[0_0_30px_rgba(251,191,36,0.15)]";
      case "silver":
        return "border-slate-300/40 shadow-[0_0_30px_rgba(203,213,225,0.1)]";
      case "bronze":
      default:
        return "border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.1)]";
    }
  };

  return (
    <div className="min-h-screen bg-[#06060c] relative flex flex-col items-center justify-center p-4 overflow-hidden select-none">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-32 w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-[30rem] h-[30rem] bg-purple-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg z-10"
      >
        <GlassCard className={`p-0 overflow-hidden border ${getTierBorder(badgeData.badgeTier)}`}>
          {/* Header Area */}
          <div className="relative pt-12 pb-8 px-8 flex flex-col items-center text-center bg-gradient-to-b from-white/[0.05] to-transparent">
            {/* The Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="text-8xl drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] mb-6"
            >
              {badgeData.badgeIcon || "🏆"}
            </motion.div>

            <h1 className="text-3xl font-extrabold text-white mb-2">
              {badgeData.badgeTitle}
            </h1>
            
            <div className="flex items-center gap-3 mb-6">
              <GradientBadge label={badgeData.badgeTier || "Bronze"} gradient={getTierColor(badgeData.badgeTier)} />
              {badgeData.badgeXp > 0 && (
                <div className="px-2.5 py-1 bg-white/10 rounded-lg text-xs font-mono font-bold text-white/80">
                  +{badgeData.badgeXp} XP
                </div>
              )}
            </div>

            <p className="text-white/70 text-sm leading-relaxed max-w-sm">
              {badgeData.badgeDescription}
            </p>
          </div>

          {/* User Earned Section */}
          <div className="border-t border-white/[0.08] bg-black/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {badgeData.userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">{badgeData.userName}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-xs text-white/50 font-mono">Earned {dateStr}</span>
              </div>
            </div>

            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold text-white transition-all shrink-0 group"
            >
              <span>Join BeyondWords</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </GlassCard>
      </motion.div>

      <div className="mt-8 text-center z-10 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest">
          <Award className="w-4 h-4" />
          <span>Verified Achievement</span>
        </div>
      </div>
    </div>
  );
}
