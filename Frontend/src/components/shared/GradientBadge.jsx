import React from "react";
import { cn } from "../../lib/utils";

export function GradientBadge({ label, gradient = "brand", className }) {
  const gradients = {
    brand: "from-indigo-500 via-purple-500 to-pink-500",
    cyan: "from-cyan-400 to-blue-500",
    amber: "from-amber-400 to-orange-500",
    green: "from-emerald-400 to-teal-500",
    rose: "from-rose-400 to-pink-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold select-none",
        "bg-gradient-to-r text-white",
        gradients[gradient] || gradients.brand,
        className
      )}
    >
      {label}
    </span>
  );
}
