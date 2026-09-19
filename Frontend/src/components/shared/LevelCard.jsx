import React from "react";
import { GlassCard } from "./GlassCard";
import { GradientBadge } from "./GradientBadge";
import { Star, Check, Lock, Play } from "lucide-react";
import { cn } from "../../lib/utils";

export function LevelCard({
  levelNumber,
  title,
  subtitle,
  status, // "completed" | "in-progress" | "locked"
  starsEarned = 0,
  totalStars = 3,
  progress = 0,
  requiredXp,
  onAction,
  showConnector = true,
}) {
  const isCompleted = status === "completed";
  const isInProgress = status === "in-progress";
  const isLocked = status === "locked";

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      <GlassCard
        className={cn(
          "w-full p-6 transition-all duration-300 relative",
          isLocked && "opacity-60 border-white/[0.04] bg-white/[0.01]",
          isInProgress && "border-purple-500/30 bg-purple-500/[0.02] shadow-[0_0_25px_rgba(139,92,246,0.15)]",
          isCompleted && "border-emerald-500/20 bg-emerald-500/[0.01]"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold font-mono tracking-wider text-textSecondary uppercase">
                Level {levelNumber}
              </span>
              {isCompleted && (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> COMPLETED
                </span>
              )}
              {isInProgress && (
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> IN PROGRESS
                </span>
              )}
              {isLocked && (
                <span className="flex items-center gap-1 text-xs font-semibold text-textTertiary">
                  <Lock className="w-3 h-3" /> LOCKED
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-textPrimary">{title}</h3>
            <p className="text-sm text-textSecondary mt-1 italic">"{subtitle}"</p>

            {/* Stars display */}
            <div className="flex items-center gap-1 mt-3">
              {[...Array(totalStars)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    i < starsEarned
                      ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                      : "text-white/10"
                  )}
                />
              ))}
              <span className="text-xs font-mono text-textTertiary ml-1">
                ({starsEarned}/{totalStars} stars)
              </span>
            </div>

            {/* Progress Bar for In Progress */}
            {isInProgress && (
              <div className="mt-4">
                <div className="flex justify-between text-xs font-mono text-textSecondary mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-white/[0.04] h-2 rounded-full overflow-hidden border border-white/[0.06]">
                  <div
                    className="bg-gradient-brand h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Lock requirement for Locked */}
            {isLocked && requiredXp && (
              <p className="text-xs text-textTertiary mt-3">
                Complete Level {levelNumber - 1} or reach{" "}
                <span className="font-mono text-purple-400">{requiredXp} XP</span> to unlock.
              </p>
            )}
          </div>

          <div className="flex flex-col justify-center items-end self-center">
            {isInProgress && (
              <button
                onClick={onAction}
                className="px-4 py-2 bg-gradient-brand hover:shadow-glow-purple text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-all duration-300 active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" /> Continue
              </button>
            )}
            {isCompleted && (
              <button
                onClick={onAction}
                className="px-4 py-2 border border-white/[0.1] hover:border-white/[0.2] bg-white/[0.02] hover:bg-white/[0.04] text-textSecondary hover:text-textPrimary text-sm font-semibold rounded-xl transition-all duration-300 active:scale-95"
              >
                Practice Again
              </button>
            )}
            {isLocked && (
              <button
                disabled
                className="px-4 py-2 border border-white/[0.02] bg-white/[0.01] text-textTertiary text-sm font-semibold rounded-xl cursor-not-allowed flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" /> Locked
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Dotted Connecting Line */}
      {showConnector && (
        <div className="flex flex-col items-center my-3 gap-0.5">
          <div className="w-0.5 h-2 bg-white/10 rounded-full" />
          <div className="w-0.5 h-2 bg-white/10 rounded-full" />
          <div className="w-0.5 h-2 bg-white/10 rounded-full" />
        </div>
      )}
    </div>
  );
}
