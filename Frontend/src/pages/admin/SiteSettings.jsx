import React, { useState, useEffect } from "react";
import { Save, Settings, Layers, FileQuestion, Star, Construction, ShieldAlert, Sliders } from "lucide-react";
import { GlassCard } from "../../components/shared/GlassCard";
import { cn } from "../../lib/utils";
import { userApi } from "../../lib/api";

export function SiteSettings() {
  const [activeTab, setActiveTab] = useState("general"); // "general" | "content" | "quiz" | "xp" | "maintenance"
  const [toastMessage, setToastMessage] = useState("");

  // Load settings from API or fall back to sensible defaults
  const [settings, setSettings] = useState({
    platformName: "BeyondWords",
    platformTagline: "AI Sign Language Learning Suite",
    featuredCourseId: "1",
    welcomeMessage: "Ready to practice fingerspelling and daily vocabulary signs? Let's go!",
    
    defaultLessonStatus: "Unlocked",
    defaultModuleStatus: "Unlocked",
    allowRevisitLessons: true,
    showLessonDuration: true,

    defaultQuizTimeLimit: 30,
    defaultPassPercentage: 70,
    showCorrectAnswerAfterWrong: true,
    allowQuizRetries: true,

    xpPerLevel: {
      "Level 1": 500,
      "Level 2": 1000,
      "Level 3": 2000,
      "Level 4": 3000,
      "Level 5": 5000
    },
    xpLessonComplete: 20,
    xpQuizPass: 150,
    xpDailyLogin: 10,
    xpStreakMaintain: 25,

    maintenanceMode: false,
    maintenanceMessage: "The site is currently undergoing scheduled maintenance. We will be back shortly!",
    expectedBackTime: ""
  });

  useEffect(() => {
    userApi.get("/api/admin/settings")
      .then(res => {
        if (res.data) setSettings(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await userApi.put("/api/admin/settings", settings);
      setToastMessage("Settings updated successfully! ✅");
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const updateField = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateXpLevel = (lvl, val) => {
    setSettings(prev => ({
      ...prev,
      xpPerLevel: {
        ...prev.xpPerLevel,
        [lvl]: parseInt(val) || 0
      }
    }));
  };

  // Retrieve courses list to populate selector
  const coursesList = JSON.parse(localStorage.getItem("beyondwords_admin_data") || "[]");

  return (
    <div className="flex flex-col gap-6 text-textPrimary select-none">
      
      {/* Header and Toast */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 relative">
        <div>
          <h2 className="text-xl font-extrabold text-textPrimary">Site Settings</h2>
          <p className="text-xs text-textTertiary mt-1 font-semibold">
            Manage brand assets, lessons rules, XP level rewards, and maintenance schedules
          </p>
        </div>
        
        {toastMessage && (
          <div className="absolute top-0 right-0 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl animate-bounce">
            {toastMessage}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Side Tab Navigation */}
        <GlassCard className="p-3.5 flex flex-col gap-1 w-full lg:w-56 border-white/[0.08]">
          {[
            { id: "general", label: "General tab", icon: Settings },
            { id: "content", label: "Content rules", icon: Layers },
            { id: "quiz", label: "Quiz limits", icon: FileQuestion },
            { id: "xp", label: "XP & Levels", icon: Star },
            { id: "maintenance", label: "Maintenance", icon: Construction }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all",
                  activeTab === tab.id 
                    ? "bg-gradient-brand text-white shadow-glow-purple" 
                    : "text-textSecondary hover:text-textPrimary hover:bg-white/[0.03]"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </GlassCard>

        {/* Right Side Settings Form View */}
        <form onSubmit={handleSave} className="flex-1 w-full flex flex-col gap-6">
          <GlassCard className="p-6 border-white/[0.08] flex flex-col gap-5 text-xs text-textSecondary">
            
            {/* 1. GENERAL TAB */}
            {activeTab === "general" && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-extrabold text-textPrimary uppercase tracking-wide border-b border-white/[0.04] pb-2 mb-2">General Brand Settings</h3>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-textSecondary">Platform Name</label>
                  <input
                    type="text"
                    required
                    value={settings.platformName}
                    onChange={e => updateField("platformName", e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3.5 py-2.5 text-xs text-textPrimary"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-textSecondary">Platform Tagline</label>
                  <input
                    type="text"
                    required
                    value={settings.platformTagline}
                    onChange={e => updateField("platformTagline", e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3.5 py-2.5 text-xs text-textPrimary"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-textSecondary">Featured Course</label>
                  <select
                    value={settings.featuredCourseId}
                    onChange={e => updateField("featuredCourseId", e.target.value)}
                    className="w-full bg-black/60 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3.5 py-2.5 text-xs text-textPrimary"
                  >
                    <option value="1">Intro to Fingerspelling (Default)</option>
                    {coursesList.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-textTertiary uppercase tracking-wider">Welcome Banner Message</label>
                  <textarea
                    rows={2}
                    value={settings.welcomeMessage}
                    onChange={e => updateField("welcomeMessage", e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3.5 py-2.5 text-xs text-textPrimary resize-none"
                  />
                </div>
              </div>
            )}

            {/* 2. CONTENT TAB */}
            {activeTab === "content" && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-extrabold text-textPrimary uppercase tracking-wide border-b border-white/[0.04] pb-2 mb-2">Content Delivery Rules</h3>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-textSecondary">Default Lesson Status when Created</label>
                  <select
                    value={settings.defaultLessonStatus}
                    onChange={e => updateField("defaultLessonStatus", e.target.value)}
                    className="w-full bg-black/60 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3.5 py-2.5 text-xs text-textPrimary"
                  >
                    <option value="Unlocked">Unlocked by Default</option>
                    <option value="Locked">Locked until Pre-requisite is Met</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-textSecondary">Default Module Status when Created</label>
                  <select
                    value={settings.defaultModuleStatus}
                    onChange={e => updateField("defaultModuleStatus", e.target.value)}
                    className="w-full bg-black/60 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3.5 py-2.5 text-xs text-textPrimary"
                  >
                    <option value="Unlocked">Unlocked by Default</option>
                    <option value="Locked">Locked until Pre-requisite is Met</option>
                  </select>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-textPrimary text-xs">Allow Lessons Revisit</span>
                    <span className="text-[9.5px] text-textTertiary mt-0.5">Let students click back on completed study cards</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.allowRevisitLessons}
                    onChange={e => updateField("allowRevisitLessons", e.target.checked)}
                    className="w-4 h-4 rounded accent-purple-500"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-textPrimary text-xs">Show Lesson Duration</span>
                    <span className="text-[9.5px] text-textTertiary mt-0.5">Display estimated study times inside module rows</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showLessonDuration}
                    onChange={e => updateField("showLessonDuration", e.target.checked)}
                    className="w-4 h-4 rounded accent-purple-500"
                  />
                </div>
              </div>
            )}

            {/* 3. QUIZ TAB */}
            {activeTab === "quiz" && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-extrabold text-textPrimary uppercase tracking-wide border-b border-white/[0.04] pb-2 mb-2">Quiz Configs</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-textSecondary">Time Limit (Sec/Question)</label>
                    <input
                      type="number"
                      required
                      min={5}
                      value={settings.defaultQuizTimeLimit}
                      onChange={e => updateField("defaultQuizTimeLimit", parseInt(e.target.value) || 30)}
                      className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3 py-2 text-xs text-textPrimary"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-textSecondary">Pass Percentage (%)</label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={100}
                      value={settings.defaultPassPercentage}
                      onChange={e => updateField("defaultPassPercentage", parseInt(e.target.value) || 70)}
                      className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3 py-2 text-xs text-textPrimary"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-textPrimary text-xs">Reveal Answers immediately</span>
                    <span className="text-[9.5px] text-textTertiary mt-0.5">Show correct answer choice when user triggers incorrect click</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showCorrectAnswerAfterWrong}
                    onChange={e => updateField("showCorrectAnswerAfterWrong", e.target.checked)}
                    className="w-4 h-4 rounded accent-purple-500"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-textPrimary text-xs">Allow Quiz Retries</span>
                    <span className="text-[9.5px] text-textTertiary mt-0.5">Allow users to play level multiple times for XP</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.allowQuizRetries}
                    onChange={e => updateField("allowQuizRetries", e.target.checked)}
                    className="w-4 h-4 rounded accent-purple-500"
                  />
                </div>
              </div>
            )}

            {/* 4. XP & LEVELS TAB */}
            {activeTab === "xp" && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-extrabold text-textPrimary uppercase tracking-wide border-b border-white/[0.04] pb-2 mb-2">XP Thresholds & Rewards</h3>
                
                {/* Level Thresholds Table */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase text-textSecondary">XP Thresholds Per Rank</span>
                  <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-black/20">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-white/[0.06] bg-white/[0.01] text-[9px] font-bold text-textTertiary uppercase font-mono">
                          <th className="p-2.5 pl-3">Milestone Rank</th>
                          <th className="p-2.5 pr-3 text-right">Required XP Pool</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04] text-xs font-mono">
                        {Object.entries(settings.xpPerLevel).map(([lvl, xpVal]) => (
                          <tr key={lvl}>
                            <td className="p-2 pl-3 font-bold text-textSecondary">{lvl}</td>
                            <td className="p-2 pr-3 text-right">
                              <input
                                type="number"
                                required
                                value={xpVal}
                                onChange={e => updateXpLevel(lvl, e.target.value)}
                                className="w-24 bg-black/60 border border-white/10 outline-none rounded-lg px-2 py-1 text-xs text-right text-purple-400 font-bold font-mono focus:border-purple-500/50"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Actions rewards */}
                <div className="grid grid-cols-2 gap-4 border-t border-white/[0.04] pt-3 mt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-textSecondary">XP / Lesson Completion</label>
                    <input
                      type="number"
                      required
                      value={settings.xpLessonComplete}
                      onChange={e => updateField("xpLessonComplete", parseInt(e.target.value) || 20)}
                      className="bg-black/40 border border-white/10 outline-none rounded-xl px-3 py-2 text-xs text-textPrimary"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-textSecondary">XP / Quiz Pass</label>
                    <input
                      type="number"
                      required
                      value={settings.xpQuizPass}
                      onChange={e => updateField("xpQuizPass", parseInt(e.target.value) || 150)}
                      className="bg-black/40 border border-white/10 outline-none rounded-xl px-3 py-2 text-xs text-textPrimary"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-textSecondary">XP / Daily Check-in</label>
                    <input
                      type="number"
                      required
                      value={settings.xpDailyLogin}
                      onChange={e => updateField("xpDailyLogin", parseInt(e.target.value) || 10)}
                      className="bg-black/40 border border-white/10 outline-none rounded-xl px-3 py-2 text-xs text-textPrimary"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-textSecondary">XP / Streak Maintain</label>
                    <input
                      type="number"
                      required
                      value={settings.xpStreakMaintain}
                      onChange={e => updateField("xpStreakMaintain", parseInt(e.target.value) || 25)}
                      className="bg-black/40 border border-white/10 outline-none rounded-xl px-3 py-2 text-xs text-textPrimary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. MAINTENANCE TAB */}
            {activeTab === "maintenance" && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-extrabold text-textPrimary uppercase tracking-wide border-b border-white/[0.04] pb-2 mb-2">System Maintenance</h3>
                
                <div className="flex items-center justify-between bg-yellow-500/5 border border-yellow-500/10 p-3.5 rounded-2xl gap-3">
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-yellow-400 text-xs flex items-center gap-1.5">
                      <Construction className="w-4 h-4" /> Trigger Maintenance Mode
                    </span>
                    <span className="text-[9.5px] text-textTertiary mt-0.5 max-w-xs">
                      Lock student access and show the maintenance banner. Admin panel remains accessible.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={e => updateField("maintenanceMode", e.target.checked)}
                    className="w-4.5 h-4.5 rounded accent-yellow-500 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-textSecondary">Maintenance Notice message</label>
                  <textarea
                    rows={3}
                    value={settings.maintenanceMessage}
                    onChange={e => updateField("maintenanceMessage", e.target.value)}
                    placeholder="We will be back shortly..."
                    className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3.5 py-2.5 text-xs text-textPrimary resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-textSecondary">Expected Resume Date/Time</label>
                  <input
                    type="datetime-local"
                    value={settings.expectedBackTime}
                    onChange={e => updateField("expectedBackTime", e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3.5 py-2.5 text-xs text-textPrimary"
                  />
                </div>
              </div>
            )}

            {/* Save Buttons */}
            <div className="border-t border-white/[0.06] pt-4 mt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-brand text-white text-xs font-bold rounded-xl hover:shadow-glow-purple transition-all duration-300 active:scale-95 shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>Save Configs</span>
              </button>
            </div>

          </GlassCard>
        </form>
      </div>

    </div>
  );
}
