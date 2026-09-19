import React, { useEffect, useMemo, useState } from "react";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { GlassCard } from "../../components/shared/GlassCard";
import { cn } from "../../lib/utils";
import { userApi } from "../../lib/api";

export function ResetPassword() {
  const { setAuthStep } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const token = query.get("token") || "";

  useEffect(() => {
    if (!token) {
      setError("Missing password reset token. Please request a fresh reset link.");
    }
  }, [token]);

  const passwordRules = useMemo(() => ({
    minLength: newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(newPassword),
    hasLower: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  }), [newPassword]);

  const isPasswordValid = Object.values(passwordRules).every(Boolean);
  const passwordsMatch = newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Reset token missing. Please use the link from your email.");
      return;
    }
    if (!isPasswordValid) {
      setError("Please choose a stronger password.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await userApi.post("/api/auth/reset-password", {
        token,
        newPassword,
      });

      setSuccess(response.data?.message || "Password reset successfully. You can now sign in.");
      setLoading(false);
      setAuthStep("login");
      setTimeout(() => {
        navigate("/");
      }, 2500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to reset password. Please try again.");
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
          <p className="text-xs text-textSecondary">Enter a new password for your account.</p>
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
                <Lock className="absolute left-4 top-[14px] w-4 h-4 text-textTertiary" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.12] focus:border-purple-500/40 rounded-xl pl-11 pr-11 py-3 text-xs outline-none text-textPrimary placeholder-textTertiary transition-colors w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[12px] p-1 text-textTertiary hover:text-textPrimary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <Lock className="absolute left-4 top-[14px] w-4 h-4 text-textTertiary" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.12] focus:border-purple-500/40 rounded-xl pl-11 pr-11 py-3 text-xs outline-none text-textPrimary placeholder-textTertiary transition-colors w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-[12px] p-1 text-textTertiary hover:text-textPrimary transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-textSecondary">
                <div className={cn("rounded-xl p-3 border", passwordRules.minLength ? "border-emerald-400/30 bg-emerald-500/5" : "border-white/[0.08]")}>Min 8 characters</div>
                <div className={cn("rounded-xl p-3 border", passwordRules.hasUpper ? "border-emerald-400/30 bg-emerald-500/5" : "border-white/[0.08]")}>Uppercase letter</div>
                <div className={cn("rounded-xl p-3 border", passwordRules.hasLower ? "border-emerald-400/30 bg-emerald-500/5" : "border-white/[0.08]")}>Lowercase letter</div>
                <div className={cn("rounded-xl p-3 border", passwordRules.hasNumber ? "border-emerald-400/30 bg-emerald-500/5" : "border-white/[0.08]")}>Number</div>
                <div className={cn("rounded-xl p-3 border col-span-2", passwordRules.hasSpecial ? "border-emerald-400/30 bg-emerald-500/5" : "border-white/[0.08]")}>Special character</div>
              </div>

              <button
                type="submit"
                disabled={!isPasswordValid || !passwordsMatch || loading}
                className="w-full py-3 bg-gradient-brand hover:shadow-glow-purple disabled:opacity-40 disabled:hover:shadow-none text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-97"
              >
                <span>{loading ? "Resetting..." : "Reset Password"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => {
              setAuthStep("login");
              navigate("/");
            }}
            className="text-center text-xs text-purple-400 hover:text-purple-300 hover:underline transition-colors"
          >
            Back to sign in
          </button>
        </GlassCard>
      </div>
    </div>
  );
}
