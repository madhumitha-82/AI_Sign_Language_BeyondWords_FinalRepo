import React from "react";
import { GlassCard } from "./GlassCard";
import { cn } from "../../lib/utils";

export function StatCard({ title, value, icon, badge, subtext, color = "purple", className }) {
  const colorStyles = {
    orange: {
      bg: "bg-orange-500/10 dark:bg-orange-500/5 border-orange-500/10",
      icon: "text-orange-500",
    },
    purple: {
      bg: "bg-indigo-500/10 dark:bg-indigo-500/5 border-indigo-500/10",
      icon: "text-indigo-500",
    },
    green: {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/5 border-emerald-500/10",
      icon: "text-emerald-500",
    },
    blue: {
      bg: "bg-sky-500/10 dark:bg-sky-500/5 border-sky-500/10",
      icon: "text-sky-500",
    },
  };

  const style = colorStyles[color] || colorStyles.purple;

  return (
    <GlassCard
      className={cn(
        "p-5 flex items-center gap-4 hover:scale-[1.015] hover:-translate-y-0.5 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)]",
        className
      )}
    >
      {/* Icon on the Left */}
      <div className={cn("p-3.5 rounded-2xl border shrink-0 flex items-center justify-center", style.bg, style.icon)}>
        {icon}
      </div>

      {/* Content on the Right */}
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">{title}</span>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-xl font-extrabold text-textPrimary truncate">{value}</span>
          {badge}
        </div>
        {subtext && (
          <span className="text-[10px] text-textTertiary font-medium mt-0.5 truncate">{subtext}</span>
        )}
      </div>
    </GlassCard>
  );
}
