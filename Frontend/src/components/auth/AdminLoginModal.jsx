import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, X, AlertTriangle } from "lucide-react";
import { GlassCard } from "../shared/GlassCard";
import { userApi } from "../../lib/api";
import { setToken, setRefresh } from "../../lib/tokenStorage";
import { useApp } from "../../context/AppContext";

export function AdminLoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotHint, setShowForgotHint] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { fetchUserProfile } = useApp();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 1. Call login API
      const { data } = await userApi.post("/api/auth/login", { email, password });
      
      // 2. Temporarily save tokens to fetch profile
      setToken(data.accessToken);
      setRefresh(data.refreshToken);
      
      // 3. Fetch profile to verify role
      const profileRes = await userApi.get("/api/users/me");
      
      if (profileRes.data.role === "ROLE_ADMIN") {
        // Correct credentials and is admin
        sessionStorage.setItem("admin_session", "true");
        // Also refresh AppContext state if needed, though admin dashboard might not need the full user object
        // but we'll fetch it anyway so the header shows the admin's avatar
        if (fetchUserProfile) await fetchUserProfile();
        onClose();
        navigate("/admin");
      } else {
        // Not an admin
        setError("Invalid credentials. Access denied. (Not an admin)");
      }
    } catch (err) {
      // Incorrect credentials or other error
      setError(err?.response?.data?.message || err?.response?.data || "Invalid credentials. Access denied.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-[24px]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-md relative z-10"
          >
            <GlassCard className="p-6 md:p-8 bg-bgSecondary/90 border-glassBorder shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.06] text-textSecondary hover:text-textPrimary transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Title Header */}
              <div className="flex flex-col items-center text-center mb-6 mt-2">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-extrabold text-textPrimary">Admin Login</h2>
                <p className="text-xs text-textTertiary mt-1 font-semibold">
                  Restricted access — authorized personnel only
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Form Fields */}
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-textTertiary tracking-wider">
                    Email ID
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter admin email ID"
                    className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-xs text-textPrimary placeholder-textTertiary focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.05] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-textTertiary tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter admin password"
                      className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-xs text-textPrimary placeholder-textTertiary focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.05] pr-10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textTertiary hover:text-textSecondary"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex justify-end mt-1.5">
                    <button
                      type="button"
                      onClick={() => setShowForgotHint(!showForgotHint)}
                      className="text-[10px] text-purple-400 hover:text-purple-300 font-bold transition-all"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {showForgotHint && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-textSecondary"
                  >
                    <p className="font-bold text-purple-400 mb-1">Temporary Access Key Hint:</p>
                    <ul className="list-disc list-inside space-y-0.5 font-mono text-[9px] text-textSecondary leading-normal">
                      <li>ssangamithra363@gmail.com: <span className="text-purple-300 font-bold">sangu</span></li>
                      <li>natarajannivetha110@gmail.com: <span className="text-purple-300 font-bold">nive</span></li>
                      <li>madhumithagopal82@gmail.com: <span className="text-purple-300 font-bold">madhu</span></li>
                    </ul>
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="w-full mt-1 py-3 bg-gradient-brand text-white font-extrabold text-xs rounded-xl hover:shadow-glow-purple flex items-center justify-center transition-all duration-300 active:scale-98"
                >
                  Sign In
                </button>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
