import React, { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "../../components/shared/GlassCard";
import { cn } from "../../lib/utils";
import { userApi } from "../../lib/api";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value.trim());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !validateEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await userApi.post("/api/auth/forgot-password", {
        email: trimmedEmail,
      });

      setSuccess(response.data?.message || "If the account exists, a password reset link has been sent to your email.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to send password reset email. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-textPrimary relative flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute top-[20%] right-[20%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />
      <div className="w-full max-w-md flex flex-col items-center gap-6 relative z-10 select-none">
        <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center text-white shadow-glow-purple">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 9V5a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4" />
            <path d="M18 10V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4" />
            <path d="M10 11.5V9a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4" />
            <path d="M6 14V11a2 2 0 0 0-2-2 2 2 0 0 0-2 2v5a7 7 0 0 0 7 7h1a8 8 0 0 0 8-8v-2a2 2 0 0 0-2-2 2 2 0 0 0-2 2" />
          </svg>
        </div>

        <div className="flex flex-col gap-1 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white">Reset Password</h2>
          <p className="text-xs text-textSecondary">Enter your registered email and we will send a reset link.</p>
        </div>

        <GlassCard className="w-full p-6 flex flex-col gap-5 border-white/[0.08] shadow-[0_24px_48px_rgba(0,0,0,0.6)]">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl text-left">
              {error}
            </div>
          )}

          {success ? (
            <div className="p-5 bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 rounded-2xl text-sm text-center">
              {success}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 relative">
                <Mail className="absolute left-4 top-[14px] w-4 h-4 text-textTertiary" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={cn(
                    "bg-white/[0.02] border focus:border-purple-500/40 rounded-xl pl-11 pr-4 py-3 text-xs outline-none text-textPrimary placeholder-textTertiary transition-colors w-full",
                    error ? "border-red-500/40 hover:border-red-500/60" : "border-white/[0.08] hover:border-white/[0.12]"
                  )}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-3 bg-gradient-brand hover:shadow-glow-purple disabled:opacity-40 disabled:hover:shadow-none text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-97"
              >
                <span>{loading ? "Sending..." : "Send Reset Link"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-center text-xs text-purple-400 hover:text-purple-300 hover:underline transition-colors"
          >
            Back to sign in
          </button>
        </GlassCard>
      </div>
    </div>
  );
}
