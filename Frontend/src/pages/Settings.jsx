import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Shield, Bell, Eye, Globe, Check, Save } from "lucide-react";
import { GlassCard } from "../components/shared/GlassCard";
import { GradientBadge } from "../components/shared/GradientBadge";
import { useApp } from "../context/AppContext";
import { userApi, analyticsApi } from "../lib/api";
import { useNavigate } from "react-router-dom";

export function Settings() {
  const { state, updateSettings, t } = useApp();
  const [activeTab, setActiveTab] = useState("account");

  // Form states
  const [name, setName] = useState(state.user.name);
  const [username, setUsername] = useState(state.user.username);
  const [email, setEmail] = useState("alex.rivera@example.com");
  const [notifications, setNotifications] = useState(state.settings.notifications);
  const [soundEffects, setSoundEffects] = useState(state.settings.soundEffects);
  const [language, setLanguage] = useState(state.settings.language || "English");
  const [theme, setTheme] = useState(state.settings.theme || "dark");
  const [privacyVisible, setPrivacyVisible] = useState(true);

  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await userApi.get("/api/users/me/settings");
        if (res.data) {
          setName(res.data.name || state.user.name);
          setUsername(res.data.username || state.user.username);
          setNotifications(res.data.notificationsEnabled ?? state.settings.notifications);
          setSoundEffects(res.data.autoplayEnabled ?? state.settings.soundEffects);
          
          let backendLang = res.data.language || state.settings.language || "English";
          if (backendLang === "en") backendLang = "English";
          if (backendLang === "ta") backendLang = "Tamil";
          setLanguage(backendLang);
          
          setTheme(res.data.theme || state.settings.theme || "dark");
          if (res.data.privacyVisible !== undefined) {
            setPrivacyVisible(res.data.privacyVisible);
          }
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const newSettings = {
      name,
      username,
      notifications,
      soundEffects,
      language,
      theme,
      privacyVisible,
      notificationsEnabled: notifications,
      autoplayEnabled: soundEffects,
    };
    updateSettings(newSettings);
    try {
      await userApi.put("/api/users/me/settings", newSettings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col gap-6 max-w-3xl mx-auto"
    >
      <div className="flex flex-col gap-0.5 border-b border-white/[0.08] pb-4">
        <h2 className="text-xl font-bold text-textPrimary">{t("settingsTitle")}</h2>
        <p className="text-xs text-textSecondary">
          {t("settingsDesc")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Left Side: Tabs */}
        <div className="flex md:flex-col overflow-x-auto p-1 md:p-0 bg-white/[0.02] border md:border-0 border-white/[0.06] rounded-xl shrink-0 gap-1 md:col-span-1 select-none">
          {[
            { id: "account", label: t("accountTab"), icon: <User className="w-4 h-4" /> },
            { id: "appearance", label: t("appearanceTab"), icon: <Eye className="w-4 h-4" /> },
            { id: "notifications", label: t("notificationsTab"), icon: <Bell className="w-4 h-4" /> },
            { id: "privacy", label: t("privacyTab"), icon: <Shield className="w-4 h-4" /> },
            { id: "language", label: t("languageTab"), icon: <Globe className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap md:text-left ${
                activeTab === tab.id
                  ? "bg-gradient-brand text-white shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                  : "text-textSecondary hover:text-textPrimary hover:bg-white/[0.02]"
              }`}
            >
              {tab.icon}
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Right Side: Tab Panels */}
        <div className="md:col-span-3">
          <form onSubmit={handleSave}>
            <GlassCard className="p-6 flex flex-col gap-5 border-purple-500/10">
              {/* ACCOUNT TAB */}
              {activeTab === "account" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
                    <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">{t("accountCredentials")}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-textTertiary uppercase font-mono">{t("fullName")}</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.12] focus:border-purple-500/40 rounded-xl px-4 py-2.5 text-xs outline-none text-textPrimary placeholder-textTertiary transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-textTertiary uppercase font-mono">{t("username")}</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.12] focus:border-purple-500/40 rounded-xl px-4 py-2.5 text-xs outline-none text-textPrimary placeholder-textTertiary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-textTertiary uppercase font-mono">{t("emailAddress")}</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="bg-white/[0.01] border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs outline-none text-textTertiary cursor-not-allowed select-none opacity-60"
                    />
                  </div>

                  <div className="p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-xl flex items-center justify-between mt-2">
                    <span className="text-[11px] text-textSecondary">{t("registeredDate") || "Registered Date"}</span>
                    <span className="text-xs font-mono font-semibold text-textPrimary">{state.user.joinedDate}</span>
                  </div>

                  {/* Danger Zone: Delete Account */}
                  <div className="mt-4 pt-4 border-t border-red-500/20">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Danger Zone</span>
                      <p className="text-[10px] text-textSecondary">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <button
                        type="button"
                        onClick={async () => {
                          const confirmDelete = window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.");
                          if (!confirmDelete) return;

                          try {
                            // 1. Delete all progress, XP, and badges from Analytics service
                            await analyticsApi.delete("/api/progress/me").catch(err => console.warn("Failed to delete progress, but continuing...", err));
                            
                            // 2. Delete the user account from User service
                            await userApi.delete("/api/users/me");
                            
                            logout();
                            navigate("/");
                          } catch (err) {
                            console.error("Failed to delete account:", err);
                            alert("Failed to delete account. Please try again.");
                          }
                        }}
                        className="self-start px-4 py-2 mt-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold rounded-xl transition-all"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* APPEARANCE TAB */}
              {activeTab === "appearance" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
                    <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">{t("interfaceAppearance")}</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-textTertiary uppercase font-mono">{t("colorTheme")}</label>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="bg-white/[0.02] border border-white/[0.08] text-xs text-textPrimary rounded-xl px-3 py-2.5 outline-none cursor-pointer focus:border-purple-500/40"
                    >
                      <option value="dark">Premium Dark</option>
                      <option value="light">Premium Light</option>
                    </select>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === "notifications" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
                    <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">{t("alertConfigs")}</span>
                  </div>

                  {/* Toggle Notifications */}
                  <div className="flex items-center justify-between p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-textPrimary">{t("systemAlerts")}</span>
                      <span className="text-[10px] text-textTertiary mt-0.5">{t("streakReminder")}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      className="w-4 h-4 cursor-pointer accent-purple-500 rounded border-white/20 bg-transparent"
                    />
                  </div>

                  {/* Toggle Sound */}
                  <div className="flex items-center justify-between p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-textPrimary">{t("hapticAudio")}</span>
                      <span className="text-[10px] text-textTertiary mt-0.5">{t("clickFeedback")}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={soundEffects}
                      onChange={(e) => setSoundEffects(e.target.checked)}
                      className="w-4 h-4 cursor-pointer accent-purple-500 rounded border-white/20 bg-transparent"
                    />
                  </div>
                </div>
              )}

              {/* PRIVACY TAB */}
              {activeTab === "privacy" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
                    <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">{t("privacySettings")}</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-textPrimary">{t("leaderboardVisibility")}</span>
                      <span className="text-[10px] text-textTertiary mt-0.5">{t("leaderboardDesc")}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacyVisible}
                      onChange={(e) => setPrivacyVisible(e.target.checked)}
                      className="w-4 h-4 cursor-pointer accent-purple-500 rounded border-white/20 bg-transparent"
                    />
                  </div>
                </div>
              )}

              {/* LANGUAGE TAB */}
              {activeTab === "language" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
                    <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">{t("localizationDefaults")}</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-textTertiary uppercase font-mono">{t("systemTranslation")}</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-white/[0.02] border border-white/[0.08] text-xs text-textPrimary rounded-xl px-3 py-2.5 outline-none cursor-pointer focus:border-purple-500/40"
                    >
                      <option value="English">English</option>
                      <option value="Tamil">Tamil</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Footer Save Button */}
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 mt-3">
                <span className="text-[10px] text-textTertiary font-mono">{t("settingsVersion")}</span>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-brand hover:shadow-glow-purple text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all duration-300 active:scale-97"
                >
                  {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  <span>{saved ? t("settingsSaved") : t("saveChanges")}</span>
                </button>
              </div>
            </GlassCard>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
