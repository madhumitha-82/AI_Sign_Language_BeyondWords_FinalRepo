import React from "react";
import { cn } from "../../lib/utils";

export function GlassCard({ children, className, glow, onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-glassBorder bg-bgCard",
        "backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300",
        glow && "shadow-[0_0_20px_rgba(139,92,246,0.20)] border-purple-500/20",
        onClick && "cursor-pointer hover:border-glassBorderHover hover:bg-glassLight",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
