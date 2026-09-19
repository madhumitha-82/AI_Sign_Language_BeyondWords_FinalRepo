import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import { GlassCard } from "../../components/shared/GlassCard";

export function LessonsManager() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <GlassCard className="max-w-md p-8 border-white/[0.08] bg-bgSecondary/80 backdrop-blur-2xl flex flex-col items-center gap-5 shadow-2xl rounded-2xl">
        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-glow-purple">
          <BookOpen className="w-6 h-6" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className="text-base font-extrabold text-textPrimary">Unified Syllabus Manager</h3>
          <p className="text-xs text-textSecondary leading-relaxed">
            Lessons are now managed directly inside the **Course & Modules stepper**. 
            This allows lesson durations to automatically calculate the total module duration in real-time.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/modules")}
          className="mt-2 w-full py-2.5 bg-gradient-brand text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:shadow-glow-purple transition-all duration-300 active:scale-[0.98]"
        >
          <span>Go to Course & Modules Editor</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </GlassCard>
    </div>
  );
}
