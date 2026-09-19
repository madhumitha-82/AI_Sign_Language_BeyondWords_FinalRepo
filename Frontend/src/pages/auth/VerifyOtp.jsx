import React, { useState, useRef } from "react";
import { ChevronLeft, ArrowRight, Check } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { GlassCard } from "../../components/shared/GlassCard";

export function VerifyOtp() {
  const { verifyOtp, setAuthStep } = useApp();
  const [code, setCode] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newCode = [...code];
    // Keep only the last character entered
    newCode[index] = val.substring(val.length - 1);
    setCode(newCode);

    // Jump to next input
    if (val && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Jump back on backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalCode = code.join("");
    if (finalCode.length < 6) return;
    verifyOtp(finalCode);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-textPrimary relative flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background radial */}
      <div className="absolute top-[20%] right-[20%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md flex flex-col items-center gap-6 relative z-10 select-none">
        {/* Rounded square gradient logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center text-white text-3xl font-extrabold shadow-glow-purple">
          🫵
        </div>

        <div className="flex flex-col gap-1 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white">Verify OTP</h2>
          <p className="text-xs text-textSecondary">Enter the 6-digit code sent to your email</p>
        </div>

        {/* OTP card panel */}
        <GlassCard className="w-full p-6 flex flex-col gap-6 border-white/[0.08] shadow-[0_24px_48px_rgba(0,0,0,0.6)]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* 6 input cells grid */}
            <div className="grid grid-cols-6 gap-2.5">
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="w-full aspect-square bg-white/[0.02] border border-white/[0.08] focus:border-purple-500/40 rounded-xl text-center text-lg font-bold font-mono outline-none text-white transition-all"
                />
              ))}
            </div>

            {/* CTA Verify */}
            <button
              type="submit"
              disabled={code.some((d) => !d)}
              className="w-full py-3 bg-gradient-brand hover:shadow-glow-purple disabled:opacity-40 disabled:hover:shadow-none text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-97"
            >
              <span>Verify & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Resend details */}
          <div className="text-center text-xs text-textSecondary select-none">
            Didn't receive?{" "}
            <button
              onClick={() => alert("Simulated: OTP code has been re-sent to your address.")}
              className="text-purple-400 font-bold hover:text-purple-300 transition-colors"
            >
              Resend
            </button>
          </div>

          {/* Back link */}
          <button
            onClick={() => setAuthStep("login")}
            className="flex items-center justify-center gap-1 text-xs text-textTertiary hover:text-textPrimary transition-colors w-full"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back to login</span>
          </button>
        </GlassCard>
      </div>
    </div>
  );
}
