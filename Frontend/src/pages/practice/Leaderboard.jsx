import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, Target, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { GlassCard } from "../../components/shared/GlassCard";
import { GradientBadge } from "../../components/shared/GradientBadge";
import { analyticsApi } from "../../lib/api";
import { cn } from "../../lib/utils";
import { useApp } from "../../context/AppContext";

export function Leaderboard() {
  const { t } = useApp();
  const [timeframe, setTimeframe] = useState("weekly"); // "weekly" | "monthly" | "alltime"
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [timeframe]);

  const [sortedPlayers, setSortedPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const res = await analyticsApi.get(`/api/leaderboard/${timeframe}`);
        setSortedPlayers(res.data);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        setSortedPlayers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, [timeframe]);

  // Top 3 players
  const topThree = useMemo(() => {
    const top = sortedPlayers.slice(0, 3);
    // Order them: 2nd, 1st, 3rd for podium visualization
    return {
      first: top[0],
      second: top[1],
      third: top[2],
    };
  }, [sortedPlayers]);

  // Remaining players (rank 4+)
  const remainingPlayers = useMemo(() => {
    return sortedPlayers.slice(3);
  }, [sortedPlayers]);

  const totalPages = Math.ceil(remainingPlayers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPlayers = useMemo(() => {
    return remainingPlayers.slice(startIndex, startIndex + itemsPerPage);
  }, [remainingPlayers, startIndex, itemsPerPage]);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col gap-6 max-w-4xl mx-auto"
    >
      {/* Header and Filter tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-xl font-bold text-textPrimary">{t("leaderboardTitle")}</h2>
          <p className="text-textSecondary text-sm max-w-2xl mx-auto mb-10">
            {t("leaderboardPageDesc")}
          </p>
        </div>

        {/* Tab filters */}
        <div className="flex p-1 bg-white/[0.02] border border-white/[0.06] rounded-xl self-start shrink-0">
          {["weekly", "monthly", "alltime"].map((tab) => (
            <button
              key={tab}
              onClick={() => setTimeframe(tab)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all",
                timeframe === tab
                  ? "bg-gradient-brand text-white shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                  : "text-textSecondary hover:text-textPrimary"
              )}
            >
              {tab === "weekly" ? t("weekly") : tab === "monthly" ? t("monthly") : t("allTime")}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 items-end mt-4 max-w-2xl mx-auto w-full select-none">
        {/* 2nd place (Left) */}
        {topThree.second && (
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 border-2 border-slate-300 flex items-center justify-center text-textPrimary font-bold text-sm md:text-base">
                {getInitials(topThree.second.name)}
              </div>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">🥈</span>
            </div>
            <GlassCard className="w-full p-4 flex flex-col items-center text-center bg-white/[0.02] border-slate-500/10 h-28 justify-center gap-1 rounded-t-2xl rounded-b-none">
              <span className="text-xs font-bold text-textPrimary truncate w-full">{topThree.second.name}</span>
              <span className="text-[10px] text-textSecondary font-mono">{topThree.second.xp} XP</span>
              <GradientBadge label={`${t("levelCol")} ${topThree.second.level}`} gradient="cyan" className="scale-90" />
            </GlassCard>
          </div>
        )}

        {/* 1st place (Center) */}
        {topThree.first && (
          <div className="flex flex-col items-center">
            <div className="relative mb-3">
              <div className="w-18 h-18 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border-2 border-amber-400 flex items-center justify-center text-bgPrimary font-bold text-base md:text-lg shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse" style={{ animationDuration: '3s' }}>
                {getInitials(topThree.first.name)}
              </div>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl animate-bounce" style={{ animationDuration: '2s' }}>👑</span>
            </div>
            <GlassCard className="w-full p-5 flex flex-col items-center text-center bg-white/[0.04] border-purple-500/20 h-36 justify-center gap-1 rounded-t-2xl rounded-b-none shadow-[0_0_25px_rgba(139,92,246,0.15)] relative">
              <span className="text-xs font-bold text-textPrimary truncate w-full">{topThree.first.name}</span>
              <span className="text-[11px] text-purple-400 font-bold font-mono">{topThree.first.xp} XP</span>
              <GradientBadge label={`${t("levelCol")} ${topThree.first.level}`} gradient="brand" className="scale-95" />
            </GlassCard>
          </div>
        )}

        {/* 3rd place (Right) */}
        {topThree.third && (
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-amber-800 to-amber-600 border-2 border-amber-700 flex items-center justify-center text-textPrimary font-bold text-xs md:text-sm">
                {getInitials(topThree.third.name)}
              </div>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">🥉</span>
            </div>
            <GlassCard className="w-full p-3.5 flex flex-col items-center text-center bg-white/[0.01] border-amber-900/10 h-24 justify-center gap-0.5 rounded-t-2xl rounded-b-none">
              <span className="text-xs font-bold text-textPrimary truncate w-full">{topThree.third.name}</span>
              <span className="text-[10px] text-textSecondary font-mono">{topThree.third.xp} XP</span>
              <GradientBadge label={`${t("levelCol")} ${topThree.third.level}`} gradient="green" className="scale-85" />
            </GlassCard>
          </div>
        )}
      </div>

      {/* Leaderboard Remaining Entries List */}
      <GlassCard className="p-4 md:p-6 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] font-bold text-textTertiary uppercase tracking-wider">
                <th className="pb-3 pl-3">{t("rankCol")}</th>
                <th className="pb-3 pl-2">{t("studentCol")}</th>
                <th className="pb-3 text-center">{t("levelCol")}</th>
                <th className="pb-3 text-right">{t("xpPointsCol")}</th>
                <th className="pb-3 text-center">{t("accuracyCol")}</th>
                <th className="pb-3 pr-3 text-right">{t("streakCol")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {paginatedPlayers.map((player, idx) => {
                const globalRank = startIndex + idx + 4; // Podium is 1,2,3
                const isUser = player.isCurrentUser;

                return (
                  <tr
                    key={player.id}
                    className={cn(
                      "transition-all duration-150 hover:bg-white/[0.02]",
                      isUser && "bg-purple-500/[0.08] border-l-[3px] border-purple-500 shadow-[inset_4px_0_10px_rgba(139,92,246,0.1)]"
                    )}
                  >
                    {/* Rank */}
                    <td className="py-3.5 pl-3 font-mono font-bold text-textSecondary">
                      #{globalRank}
                    </td>

                    {/* Student Info */}
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[10px] text-textSecondary font-bold">
                          {getInitials(player.name)}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-textPrimary">{player.name}</span>
                            {isUser && (
                              <span className="px-1.5 py-0.5 text-[8px] bg-purple-500/20 text-purple-400 font-bold rounded tracking-wide uppercase select-none">
                                {t("youBadge")}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-textTertiary">@{player.username}</span>
                        </div>
                      </div>
                    </td>

                    {/* Level */}
                    <td className="py-3.5 text-center">
                      <span className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-[10px] text-textSecondary font-semibold">
                        {t("levelCol")} {player.level}
                      </span>
                    </td>

                    {/* XP */}
                    <td className="py-3.5 text-right font-mono font-bold text-purple-400">
                      {player.xp.toLocaleString()} XP
                    </td>

                    {/* Accuracy */}
                    <td className="py-3.5 text-center font-mono text-textSecondary">
                      {player.accuracy}%
                    </td>

                    {/* Streak */}
                    <td className="py-3.5 pr-3 text-right font-mono text-amber-500 font-bold">
                      {player.streak > 0 ? `🔥 ${player.streak}` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 mt-4 select-none">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] text-xs font-semibold text-textSecondary hover:text-textPrimary disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> {t("previous")}
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-bold font-mono transition-all",
                    currentPage === page
                      ? "bg-gradient-brand text-white shadow-glow-purple"
                      : "text-textSecondary hover:text-textPrimary hover:bg-white/[0.04]"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] text-xs font-semibold text-textSecondary hover:text-textPrimary disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              {t("next")} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}
