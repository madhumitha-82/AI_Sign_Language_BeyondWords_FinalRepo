import React from "react";
import { Check, ArrowRight, UserCheck } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { GlassCard } from "../../components/shared/GlassCard";

export function LoginSuccess() {
  const { state, completeAuthAndLogin } = useApp();
  const userName = state.tempLoginUser?.name || state.user?.name || "Learner";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-textPrimary relative flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md flex flex-col items-center gap-6 relative z-10 select-none">
        {/* Logo box */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center text-white shadow-glow-purple">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 9V5a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4" />
            <path d="M18 10V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4" />
            <path d="M10 11.5V9a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4" />
            <path d="M6 14V11a2 2 0 0 0-2-2 2 2 0 0 0-2 2v5a7 7 0 0 0 7 7h1a8 8 0 0 0 8-8v-2a2 2 0 0 0-2-2 2 2 0 0 0-2 2" />
          </svg>
        </div>

        <div className="flex flex-col gap-1 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white">Verification Complete</h2>
          <p className="text-xs text-textSecondary">You are ready to enter BeyondWords</p>
        </div>

        {/* Success Card panel */}
        <GlassCard className="w-full p-8 flex flex-col items-center text-center gap-6 border-white/[0.08] shadow-[0_24px_48px_rgba(0,0,0,0.6)]">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(16,185,129,0.15)] animate-pulse">
            <UserCheck className="w-8 h-8" />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-base font-extrabold text-white">Welcome back, {userName}!</span>
            <p className="text-xs text-textSecondary leading-relaxed px-4">
              You have successfully logged in and your active secure session has been established.
            </p>
          </div>

          {/* CTA Button to proceed to dashboard */}
          <button
            onClick={completeAuthAndLogin}
            className="w-full py-3 bg-gradient-brand hover:shadow-glow-purple text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 active:scale-97 hover:scale-101 shadow-lg"
          >
            <span>Proceed to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </GlassCard>
      </div>
    </div>
  );
}
