import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, Flame, Zap, Target, BookOpen, Globe } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { AdminLoginModal } from "../../components/auth/AdminLoginModal";

export function LandingPage() {
  const { setAuthStep } = useApp();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminHovered, setIsAdminHovered] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-textPrimary relative flex flex-col justify-between overflow-hidden">
      {/* Radial decorative backdrops */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Header bar */}
      <header className="max-w-6xl w-full mx-auto px-6 h-20 flex items-center justify-between z-20 relative select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9V5a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4" />
              <path d="M18 10V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4" />
              <path d="M10 11.5V9a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4" />
              <path d="M6 14V11a2 2 0 0 0-2-2 2 2 0 0 0-2 2v5a7 7 0 0 0 7 7h1a8 8 0 0 0 8-8v-2a2 2 0 0 0-2-2 2 2 0 0 0-2 2" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white leading-none">
              {JSON.parse(window.localStorage.getItem("beyondwords_site_settings") || "{}").platformName || "BeyondWords"}
            </span>
            <span className="text-[8px] text-textTertiary tracking-wider uppercase font-mono mt-0.5">AI SIGN LANGUAGE</span>
          </div>
        </div>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-textSecondary uppercase tracking-wider">
          <a href="#features" className="hover:text-textPrimary transition-colors">Features</a>
          <a href="#lessons" className="hover:text-textPrimary transition-colors">Lessons</a>
          <a href="#pricing" className="hover:text-textPrimary transition-colors">Pricing</a>
          <a href="#about" className="hover:text-textPrimary transition-colors">About</a>
        </nav>

        {/* Auth CTA */}
        <div className="flex items-center gap-3">
          {/* Admin Button Wrapper */}
          <div className="relative flex items-center">
            <button
              onMouseEnter={() => setIsAdminHovered(true)}
              onMouseLeave={() => setIsAdminHovered(false)}
              onClick={() => setIsAdminModalOpen(true)}
              className="px-3 py-2 bg-gradient-to-r from-purple-600/80 to-indigo-600/80 hover:from-purple-500 hover:to-indigo-500 border border-white/[0.08] text-xs font-bold rounded-xl text-white shadow-glow-purple transition-all duration-200"
            >
              Admin
            </button>

            {/* Premium Hover Tooltip */}
            <AnimatePresence>
              {isAdminHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-3 right-0 w-52 p-3 rounded-xl border border-glassBorder bg-[#0f0f15]/95 shadow-[0_12px_40px_rgba(0,0,0,0.15)] backdrop-blur-3xl text-center z-50 select-none pointer-events-none"
                >
                  {/* Arrow Pointer up */}
                  <div className="absolute -top-1 right-6.5 w-2 h-2 bg-[#0f0f15] border-l border-t border-glassBorder transform rotate-45" />
                  <span className="text-[10px] leading-relaxed text-textPrimary block font-semibold">
                    Only admin should login who changes the website
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setAuthStep("login")}
            className="px-4 py-2 border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] text-xs font-bold rounded-xl transition-all"
          >
            Login
          </button>
          <button
            onClick={() => setAuthStep("signup")}
            className="px-4 py-2 bg-gradient-brand hover:shadow-glow-purple text-white text-xs font-bold rounded-xl transition-all active:scale-97"
          >
            Get Started
          </button>
        </div>

        {/* Admin Login Modal */}
        {isAdminModalOpen && (
          <AdminLoginModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} />
        )}
      </header>

      {/* Main Hero Container */}
      <main className="max-w-6xl w-full mx-auto px-6 flex-grow flex flex-col md:flex-row items-center justify-between gap-12 z-10 relative py-12">
        {/* Left Column: Heading and description */}
        <div className="flex-1 flex flex-col items-start text-left gap-6">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.02] border border-white/[0.07] rounded-full text-[10px] text-purple-400 font-mono font-bold select-none uppercase tracking-wider">
              <span>✨ AI-Powered • Accessible • Free to Try</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-white select-none">
              Break Communication <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
                Barriers with AI
              </span>
            </h1>
          </div>

          <p className="text-sm md:text-base leading-relaxed text-textSecondary max-w-lg">
            Learn Indian Sign Language using <span className="text-textPrimary font-semibold">AI-powered lessons</span>, live gesture recognition, quizzes, and real-time translation — accessible to everyone.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-2">
            <button
              onClick={() => setAuthStep("signup")}
              className="px-6 py-3.5 bg-gradient-brand hover:shadow-glow-purple text-white text-sm font-bold rounded-2xl flex items-center gap-2 transition-all duration-300 active:scale-95 group shadow-lg"
            >
              <span>Start Learning Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => setAuthStep("login")}
              className="px-6 py-3.5 border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] text-textSecondary hover:text-textPrimary text-sm font-bold rounded-2xl flex items-center gap-2 transition-all"
            >
              <Play className="w-4 h-4 fill-textSecondary group-hover:fill-textPrimary" />
              <span>Watch Demo</span>
            </button>
          </div>
        </div>

        {/* Right Column: Hand skeleton illustration with stats overlays */}
        <div className="flex-1 flex items-center justify-center relative select-none">
          {/* Skeleton circle grid */}
          <div className="w-[300px] h-[300px] md:w-[380px] md:h-[380px] rounded-full border border-purple-500/10 flex items-center justify-center relative animate-pulse" style={{ animationDuration: '6s' }}>
            {/* Glowing background */}
            <div className="absolute inset-0 rounded-full bg-purple-500/5 blur-[50px] pointer-events-none" />

            {/* Hand Skeleton Tracing SVG */}
            <svg viewBox="0 0 200 200" className="w-[85%] h-[85%] text-indigo-400/30">
              <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
              <circle cx="100" cy="100" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />

              {/* Skeleton joints & paths */}
              {/* Wrist base */}
              <circle cx="100" cy="170" r="3" fill="#6366f1" />
              <circle cx="100" cy="145" r="2.5" fill="#8b5cf6" />
              <line x1="100" y1="170" x2="100" y2="145" stroke="#8b5cf6" strokeWidth="1" />

              {/* Thumb */}
              <circle cx="75" cy="130" r="2" fill="#a855f7" />
              <circle cx="60" cy="120" r="2" fill="#a855f7" />
              <line x1="100" y1="145" x2="75" y2="130" stroke="#a855f7" strokeWidth="1" />
              <line x1="75" y1="130" x2="60" y2="120" stroke="#a855f7" strokeWidth="1" />

              {/* Index */}
              <circle cx="85" cy="110" r="2" fill="#6366f1" />
              <circle cx="80" cy="85" r="2" fill="#6366f1" />
              <circle cx="78" cy="65" r="2" fill="#6366f1" />
              <line x1="100" y1="145" x2="85" y2="110" stroke="#6366f1" strokeWidth="1" />
              <line x1="85" y1="110" x2="80" y2="85" stroke="#6366f1" strokeWidth="1" />
              <line x1="80" y1="85" x2="78" y2="65" stroke="#6366f1" strokeWidth="1" />

              {/* Middle */}
              <circle cx="100" cy="105" r="2" fill="#8b5cf6" />
              <circle cx="100" cy="78" r="2" fill="#8b5cf6" />
              <circle cx="100" cy="55" r="2" fill="#8b5cf6" />
              <line x1="100" y1="145" x2="100" y2="105" stroke="#8b5cf6" strokeWidth="1" />
              <line x1="100" y1="105" x2="100" y2="78" stroke="#8b5cf6" strokeWidth="1" />
              <line x1="100" y1="78" x2="100" y2="55" stroke="#8b5cf6" strokeWidth="1" />

              {/* Ring */}
              <circle cx="115" cy="110" r="2" fill="#a855f7" />
              <circle cx="120" cy="88" r="2" fill="#a855f7" />
              <circle cx="122" cy="70" r="2" fill="#a855f7" />
              <line x1="100" y1="145" x2="115" y2="110" stroke="#a855f7" strokeWidth="1" />
              <line x1="115" y1="110" x2="120" y2="88" stroke="#a855f7" strokeWidth="1" />
              <line x1="120" y1="88" x2="122" y2="70" stroke="#a855f7" strokeWidth="1" />

              {/* Pinky */}
              <circle cx="128" cy="122" r="2" fill="#6366f1" />
              <circle cx="138" cy="108" r="2" fill="#6366f1" />
              <circle cx="145" cy="98" r="2" fill="#6366f1" />
              <line x1="100" y1="145" x2="128" y2="122" stroke="#6366f1" strokeWidth="1" />
              <line x1="128" y1="122" x2="138" y2="108" stroke="#6366f1" strokeWidth="1" />
              <line x1="138" y1="108" x2="145" y2="98" stroke="#6366f1" strokeWidth="1" />
            </svg>
          </div>

          {/* Floating overlays */}
          {/* Recognition Card */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute top-[10%] left-[-5%] p-3.5 bg-[#0f0f1f]/80 border border-white/[0.08] backdrop-blur-md rounded-2xl flex items-center gap-3 shadow-[0_12px_24px_rgba(0,0,0,0.5)] select-none border-l-[3px] border-l-purple-500"
          >
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Target className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider font-mono">Recognition</span>
              <span className="text-sm font-black font-mono text-white">98%</span>
            </div>
          </motion.div>

          {/* Streak Card */}
          <motion.div
            initial={{ y: -15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-[20%] left-[5%] p-3.5 bg-[#0f0f1f]/80 border border-white/[0.08] backdrop-blur-md rounded-2xl flex items-center gap-3 shadow-[0_12px_24px_rgba(0,0,0,0.5)] select-none border-l-[3px] border-l-amber-500"
          >
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider font-mono">Streak</span>
              <span className="text-sm font-black font-mono text-white">12 days</span>
            </div>
          </motion.div>

          {/* XP Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="absolute bottom-[10%] right-[-10%] p-3.5 bg-[#0f0f1f]/80 border border-white/[0.08] backdrop-blur-md rounded-2xl flex items-center gap-3 shadow-[0_12px_24px_rgba(0,0,0,0.5)] select-none border-l-[3px] border-l-cyan-500"
          >
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <Zap className="w-5 h-5 fill-cyan-500" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider font-mono">XP Today</span>
              <span className="text-sm font-black font-mono text-white">+350</span>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer Metrics Row */}
      <footer className="w-full bg-[#07070b]/60 border-t border-white/[0.06] py-8 z-10 relative select-none">
        <div className="max-w-6xl w-full mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { metric: "10,000+", label: "Learners", icon: <User className="w-4 h-4 text-purple-400" /> },
            { metric: "98%", label: "AI Accuracy", icon: <Target className="w-4 h-4 text-cyan-400" /> },
            { metric: "500+", label: "Lessons", icon: <BookOpen className="w-4 h-4 text-indigo-400" /> },
            { metric: "45+", label: "Languages", icon: <Globe className="w-4 h-4 text-amber-400" /> },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              <div className="flex items-baseline gap-1.5 justify-center">
                <span className="text-xl md:text-2xl font-black font-mono text-white">{item.metric}</span>
              </div>
              <span className="text-xs text-textSecondary tracking-wide">{item.label}</span>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}

// Inline User icon mock representation since it was not imported
function User(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
