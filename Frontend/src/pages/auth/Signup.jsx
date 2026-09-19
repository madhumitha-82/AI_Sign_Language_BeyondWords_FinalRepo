import React, { useState, useMemo } from "react";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, X, ChevronLeft } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { GlassCard } from "../../components/shared/GlassCard";
import { cn } from "../../lib/utils";
import { useGoogleLogin } from "@react-oauth/google";

export function Signup() {
  const { signup, setAuthStep, loginWithGoogle } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        await loginWithGoogle(tokenResponse.access_token);
      } catch (err) {
        setSignupError("Failed to signup with Google");
        setLoading(false);
      }
    },
    onError: () => setSignupError("Google signup failed")
  });

  // Email validation states
  const [emailError, setEmailError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  // Password validation rules
  const passwordRules = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  }, [password]);

  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  const validateEmail = (val) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) {
      setEmailError("");
    } else if (!regex.test(val.trim())) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleEmailChange = (val) => {
    setEmail(val);
    if (emailTouched) {
      validateEmail(val);
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    validateEmail(email);
  };

  const isFormValid = name.trim() && email.trim() && !emailError && isPasswordValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);
    setSignupError("");
    try {
      await signup(name, email, password);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || "Registration failed. Please try again.";
      setSignupError(typeof msg === "string" ? msg : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-textPrimary relative flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Decorative radials */}
      <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md flex flex-col items-center gap-6 relative z-10 select-none">
        {/* Rounded square gradient logo block */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center text-white shadow-glow-purple">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 9V5a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4" />
            <path d="M18 10V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4" />
            <path d="M10 11.5V9a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4" />
            <path d="M6 14V11a2 2 0 0 0-2-2 2 2 0 0 0-2 2v5a7 7 0 0 0 7 7h1a8 8 0 0 0 8-8v-2a2 2 0 0 0-2-2 2 2 0 0 0-2 2" />
          </svg>
        </div>

        <div className="flex flex-col gap-1 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white">Create account</h2>
          <p className="text-xs text-textSecondary">Join 10,000+ ISL learners today</p>
        </div>

        {/* Signup form card */}
        <GlassCard className="w-full p-6 flex flex-col gap-5 border-white/[0.08] shadow-[0_24px_48px_rgba(0,0,0,0.6)]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Signup Error Display */}
            {signupError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl text-left">
                {signupError}
              </div>
            )}
            {/* Full Name input */}
            <div className="flex flex-col gap-1.5 relative">
              <User className="absolute left-4 top-[14px] w-4 h-4 text-textTertiary" />
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.12] focus:border-purple-500/40 rounded-xl pl-11 pr-4 py-3 text-xs outline-none text-textPrimary placeholder-textTertiary transition-colors w-full"
              />
            </div>

            {/* Email input */}
            <div className="flex flex-col gap-1.5 relative">
              <Mail className="absolute left-4 top-[14px] w-4 h-4 text-textTertiary" />
              <input
                type="email"
                placeholder="Email address"
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
                onChange={(e) => setPassword(e.target.value)}
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

            {/* Password Strength Checklist */}
            {password && (
              <div className="flex flex-col gap-1.5 text-left bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl">
                <span className="text-[10px] font-bold font-mono uppercase text-textTertiary">Password Strength Checklist:</span>
                <ul className="flex flex-col gap-1.5 text-[10px]">
                  <li className={`flex items-center gap-1.5 ${passwordRules.minLength ? "text-emerald-400 font-semibold" : "text-textTertiary"}`}>
                    <span className="shrink-0">{passwordRules.minLength ? "✓" : "○"}</span>
                    <span>At least 8 characters</span>
                  </li>
                  <li className={`flex items-center gap-1.5 ${passwordRules.hasUpper ? "text-emerald-400 font-semibold" : "text-textTertiary"}`}>
                    <span className="shrink-0">{passwordRules.hasUpper ? "✓" : "○"}</span>
                    <span>At least 1 uppercase letter</span>
                  </li>
                  <li className={`flex items-center gap-1.5 ${passwordRules.hasLower ? "text-emerald-400 font-semibold" : "text-textTertiary"}`}>
                    <span className="shrink-0">{passwordRules.hasLower ? "✓" : "○"}</span>
                    <span>At least 1 lowercase letter</span>
                  </li>
                  <li className={`flex items-center gap-1.5 ${passwordRules.hasNumber ? "text-emerald-400 font-semibold" : "text-textTertiary"}`}>
                    <span className="shrink-0">{passwordRules.hasNumber ? "✓" : "○"}</span>
                    <span>At least 1 number</span>
                  </li>
                  <li className={`flex items-center gap-1.5 ${passwordRules.hasSpecial ? "text-emerald-400 font-semibold" : "text-textTertiary"}`}>
                    <span className="shrink-0">{passwordRules.hasSpecial ? "✓" : "○"}</span>
                    <span>At least 1 special character (e.g. !@#$%^&*)</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Create Button */}
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="mt-2 w-full py-3 bg-gradient-brand hover:shadow-glow-purple disabled:opacity-40 disabled:hover:shadow-none text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-97"
            >
              {loading ? (
                <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Creating account...</span>
              ) : (
                <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
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

          {/* Toggle to sign in */}
          <div className="text-center text-xs text-textSecondary select-none mt-1">
            Already have an account?{"  "}
            <button
              onClick={() => setAuthStep("login")}
              className="text-purple-400 font-bold hover:text-purple-300 hover:underline transition-colors"
            >
              Sign in
            </button>
          </div>

          {/* Back to login redirect link */}
          <button
            type="button"
            onClick={() => setAuthStep("login")}
            className="flex items-center justify-center gap-1.5 text-xs text-textTertiary hover:text-textPrimary transition-colors w-full mt-1.5"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back to login</span>
          </button>
        </GlassCard>
      </div>
    </div>
  );
}
