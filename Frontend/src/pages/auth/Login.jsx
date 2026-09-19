import React, { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { GlassCard } from "../../components/shared/GlassCard";
import { cn } from "../../lib/utils";
import { useGoogleLogin } from "@react-oauth/google";

export function Login() {
  const { login, setAuthStep, loginWithGoogle } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Email format validation states
  const [emailError, setEmailError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  // Authentication error state (generic, secure message)
  const [authError, setAuthError] = useState("");

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        await loginWithGoogle(tokenResponse.access_token);
      } catch (err) {
        setAuthError("Failed to login with Google");
        setLoading(false);
      }
    },
    onError: () => setAuthError("Google login failed")
  });

  // Save credential prompt modal state
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  // Autofill saved credentials on mount
  useEffect(() => {
    const saved = localStorage.getItem("beyondwords_saved_credentials");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEmail(parsed.emailOrUsername || "");
        setPassword(parsed.password || "");
      } catch (e) {
        console.error("Error parsing saved credentials", e);
      }
    }
  }, []);

  const validateEmail = (val) => {
    // Basic format validation: allow username or format name@domain.tld
    // If it contains '@', check format name@domain.tld. Otherwise, check length as a plain username.
    const clean = val.trim();
    if (!clean) {
      setEmailError("");
      return;
    }
    if (clean.includes("@")) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(clean)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("");
      }
    } else {
      // Username validation: minimum 3 characters
      if (clean.length < 3) {
        setEmailError("Username must be at least 3 characters");
      } else {
        setEmailError("");
      }
    }
  };

  const handleEmailChange = (val) => {
    setEmail(val);
    setAuthError(""); // clear login errors on typing
    if (emailTouched) {
      validateEmail(val);
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    validateEmail(email);
  };

  const isFormValid = email.trim() && password.trim() && !emailError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);
    setAuthError("");
    try {
      await login(email, password);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || "Invalid email or password";
      setAuthError(typeof msg === "string" ? msg : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="text-2xl font-bold tracking-tight text-white">Sign in to BeyondWords</h2>
          <p className="text-xs text-textSecondary">Enter your credentials to continue learning</p>
        </div>

        {/* Login panel */}
        <GlassCard className="w-full p-6 flex flex-col gap-5 border-white/[0.08] shadow-[0_24px_48px_rgba(0,0,0,0.6)]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Auth Error Display (Generic) */}
            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl text-left">
                {authError}
              </div>
            )}

            {/* Email / Username input */}
            <div className="flex flex-col gap-1.5 relative">
              <Mail className="absolute left-4 top-[14px] w-4 h-4 text-textTertiary" />
              <input
                type="text"
                placeholder="Email address or username"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={handleEmailBlur}
                required
                className={cn(
                  "bg-white/[0.02] border focus:border-purple-500/40 rounded-xl pl-11 pr-4 py-3 text-xs outline-none text-textPrimary placeholder-textTertiary transition-colors w-full",
                  emailError ? "border-red-500/40 hover:border-red-500/60" : "border-white/[0.08] hover:border-white/[0.12]"
                )}
              />
              {emailError && (
                <span className="text-[10px] text-red-400 text-left mt-0.5 ml-1">{emailError}</span>
              )}
            </div>

            {/* Password input */}
            <div className="flex flex-col gap-1.5 relative">
              <Lock className="absolute left-4 top-[14px] w-4 h-4 text-textTertiary" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setAuthError("");
                }}
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

            {/* Submit btn */}
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="mt-2 w-full py-3 bg-gradient-brand hover:shadow-glow-purple disabled:opacity-40 disabled:hover:shadow-none text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-97"
            >
              {loading ? (
                <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Signing in...</span>
              ) : (
                <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            {/* Forgot password positioned BELOW login button */}
            <div className="text-center mt-1">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-xs text-purple-400 hover:text-purple-300 hover:underline transition-colors font-semibold"
              >
                Forgot password?
              </button>
            </div>
          </form>

          {/* Or divider */}
          <div className="flex items-center justify-center gap-3 w-full select-none text-[10px] font-mono text-textTertiary uppercase">
            <div className="h-[1px] bg-white/[0.06] flex-1" />
            <span>or</span>
            <div className="h-[1px] bg-white/[0.06] flex-1" />
          </div>

          {/* Google SSO Button */}
          <button
            type="button"
            onClick={() => googleLogin()}
            className="w-full py-3 bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.12] hover:bg-white/[0.04] rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 transition-all active:scale-97 text-textPrimary"
          >
            {/* Google G Symbol in SVG */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.478 0-6.3-2.822-6.3-6.3s2.822-6.3 6.3-6.3c1.63 0 3.107.625 4.225 1.722l3.045-3.045C19.317 2.76 15.995 1.5 12.24 1.5c-5.795 0-10.5 4.705-10.5 10.5s4.705 10.5 10.5 10.5c5.385 0 9.873-3.86 9.873-10.5 0-.585-.052-1.155-.15-1.715H12.24z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Toggle link */}
          <div className="text-center text-xs text-textSecondary select-none mt-1">
            Don't have an account?{" "}
            <button
              onClick={() => setAuthStep("signup")}
              className="text-purple-400 font-bold hover:text-purple-300 hover:underline transition-colors"
            >
              Sign up
            </button>
          </div>
        </GlassCard>
      </div>

    </div>
  );
}
