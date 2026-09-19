import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { History as HistoryIcon, Award, Search, Mic, BookOpen, Clock, Calendar, Check, Trash2, HelpCircle } from "lucide-react";
import { GlassCard } from "../components/shared/GlassCard";
import { GradientBadge } from "../components/shared/GradientBadge";
import { useApp } from "../context/AppContext";
import { analyticsApi, learningApi } from "../lib/api";

export function History() {
  const { state, removeSearch, clearAllSearches, t } = useApp();
  const [activeTab, setActiveTab] = useState("learning");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");

  const [historyData, setHistoryData] = useState({
    learning: state.history.learning || [],
    quizAttempts: state.history.quizAttempts || [],
    speechSessions: state.history.speechSessions || [],
    searches: state.history.searches || []
  });

  React.useEffect(() => {
    const fetchHistoryAndCourses = async () => {
      try {
        const [historyRes, coursesRes, quizzesRes] = await Promise.all([
          analyticsApi.get("/api/progress/history"),
          learningApi.get("/api/courses").catch(() => ({ data: [] })),
          learningApi.get("/api/quizzes/categories").catch(() => ({ data: [] }))
        ]);

        if (historyRes.data) {
          const courses = coursesRes.data || [];
          const quizCategories = quizzesRes.data || [];
          const learningLogs = historyRes.data.learning || [];
          const quizLogs = historyRes.data.quizAttempts || [];
          
          const enrichedLearning = learningLogs.map(log => {
             let lessonTitle = null;
             let moduleTitle = null;
             for (const course of courses) {
                if (course.modules) {
                   for (const module of course.modules) {
                      if (module.lessons) {
                         const lesson = module.lessons.find(l => l.id === log.lessonId);
                         if (lesson) {
                            lessonTitle = lesson.title;
                            moduleTitle = module.title;
                            break;
                         }
                      }
                   }
                }
                if (lessonTitle) break;
             }
             return {
                ...log,
                title: lessonTitle || log.title || `Lesson ${log.lessonId || ''}`,
                moduleTitle: moduleTitle || log.moduleTitle || "UNKNOWN MODULE"
             };
          });

          const enrichedQuizzes = quizLogs.map(log => {
             let catName = null;
             let levelName = null;
             // log.levelName currently holds something like "Level 10103" from the backend
             // Let's extract the ID if possible, or assume log.levelName has the ID
             const extractedId = log.levelName ? parseInt(log.levelName.replace(/\D/g, ''), 10) : null;
             
             if (extractedId) {
                for (const cat of quizCategories) {
                   if (cat.levels) {
                      const lvl = cat.levels.find(l => l.id === extractedId);
                      if (lvl) {
                         catName = cat.name;
                         levelName = lvl.title || lvl.name || `Level ${lvl.levelOrder || ''}`;
                         break;
                      }
                   }
                }
             }
             
             let displayTitle = log.levelName;
             if (catName && levelName) {
                 displayTitle = `${catName} - ${levelName}`;
             } else if (catName) {
                 displayTitle = `${catName} - ${log.levelName}`;
             }

             return {
                 ...log,
                 levelName: displayTitle
             };
          });
          
          setHistoryData(prev => ({ 
             ...prev, 
             ...historyRes.data,
             learning: enrichedLearning,
             quizAttempts: enrichedQuizzes
          }));
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    };
    fetchHistoryAndCourses();
  }, []);

  const learningHistory = historyData.learning || [];
  const quizHistory = historyData.quizAttempts || [];
  const speechHistory = historyData.speechSessions || [];
  const searchHistory = historyData.searches || [];

  // Filtered Learning History
  const filteredLearning = useMemo(() => {
    return learningHistory.filter((item) => {
      const itemTitle = item.title || "Lesson " + (item.lessonId || "");
      const itemModule = item.moduleTitle || "Unknown Module";
      const matchesSearch = itemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            itemModule.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesModule = selectedModule === "all" || itemModule.includes(selectedModule);
      return matchesSearch && matchesModule;
    });
  }, [learningHistory, searchQuery, selectedModule]);

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col gap-6 max-w-4xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-xl font-bold text-textPrimary">{t("activityLogsTitle")}</h2>
          <p className="text-xs text-textSecondary">
            {t("activityLogsDesc")}
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex overflow-x-auto p-1 bg-white/[0.02] border border-white/[0.06] rounded-xl self-start shrink-0 select-none">
        {[
          { id: "learning", label: t("tabLearning"), icon: <BookOpen className="w-3.5 h-3.5" /> },
          { id: "quizzes", label: t("tabQuizzes"), icon: <Award className="w-3.5 h-3.5" /> },
          { id: "speech", label: t("tabSpeech"), icon: <Mic className="w-3.5 h-3.5" /> },
          { id: "searches", label: t("tabSearches"), icon: <Search className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchQuery("");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-gradient-brand text-white shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="flex flex-col gap-4">
        {/* 1. LEARNING HISTORY PANEL */}
        {activeTab === "learning" && (
          <div className="flex flex-col gap-4">
            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search bar */}
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.12] rounded-xl text-xs text-textSecondary transition-all">
                <Search className="w-4 h-4 text-textTertiary" />
                <input
                  type="text"
                  placeholder={t("searchLessons")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-0 outline-none text-textPrimary placeholder-textTertiary w-full"
                />
              </div>

              {/* Module Filter */}
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="bg-bgTertiary border border-white/10 hover:border-white/20 text-xs text-textSecondary rounded-xl px-3 py-2 outline-none cursor-pointer sm:w-48"
              >
                <option value="all">{t("allModules")}</option>
                <option value="Foundations">{t("foundationsOfSign")}</option>
                <option value="Everyday">{t("everydayExpressions")}</option>
                <option value="Conversational">{t("conversationalPhrases")}</option>
              </select>
            </div>

            {/* List */}
            <GlassCard className="p-4 md:p-6">
              {filteredLearning.length > 0 ? (
                <div className="flex flex-col gap-4 relative pl-4 border-l border-white/[0.06] ml-2">
                  {filteredLearning.map((item, idx) => (
                    <div key={item.id} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      {/* Timeline dot */}
                      <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-500 border border-bgPrimary shadow-[0_0_8px_rgba(139,92,246,0.6)]" />

                      <div className="flex flex-col gap-0.5">
                        <h4 className="text-sm font-bold text-textPrimary">{item.title}</h4>
                        <span className="text-[10px] text-textSecondary uppercase tracking-wider font-mono">
                          {item.moduleTitle}
                        </span>
                        <div className="flex items-center gap-3 text-[10px] text-textTertiary mt-1 font-mono">
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-3 h-3" /> {item.date ? formatDate(item.date) : formatDate(item.completedAt)}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> {item.timeSpent || "0m"} {t("spentText")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                        <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                          +{item.xpEarned} XP
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> {t("completed")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-textTertiary">
                  {t("noLearningLogs")}
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* 2. QUIZ ATTEMPTS PANEL */}
        {activeTab === "quizzes" && (
          <GlassCard className="p-4 md:p-6">
            {quizHistory.length > 0 ? (
              <div className="flex flex-col gap-4">
                {quizHistory.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="p-4 bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.05] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-amber-400 shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <h4 className="text-sm font-bold text-textPrimary">{attempt.levelName}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-textSecondary font-mono mt-1">
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-3 h-3 text-textTertiary" /> {formatDate(attempt.date)}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3 text-textTertiary" /> {attempt.timeTaken} {t("takenTime")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-stretch sm:self-center justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t border-white/[0.04] sm:border-0">
                      <div className="flex flex-col items-start sm:items-end">
                        <span className="text-[10px] font-mono text-textTertiary uppercase">{t("accuracyCol")}</span>
                        <span className="text-sm font-bold font-mono text-emerald-400">{attempt.accuracy}%</span>
                      </div>
                      <div className="flex flex-col items-start sm:items-end">
                        <span className="text-[10px] font-mono text-textTertiary uppercase">{t("scoreText")}</span>
                        <span className="text-sm font-bold font-mono text-textPrimary">
                          {attempt.score} / {attempt.totalQuestions}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                        +{attempt.xpEarned} XP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-textTertiary">
                {t("noQuizLogs")}
              </div>
            )}
          </GlassCard>
        )}



        {/* 4. SPEECH HUB PANEL */}
        {activeTab === "speech" && (
          <GlassCard className="p-4 md:p-6">
            {speechHistory.length > 0 ? (
              <div className="flex flex-col gap-4">
                {speechHistory.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.05] rounded-2xl flex flex-col gap-3 transition-all duration-200"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-bold text-textPrimary">
                          {session.type === "speech_to_text" ? t("speechToTextTitle") : session.type === "text_to_speech" ? t("textToSpeechTitle") : session.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-textTertiary font-mono">
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" /> {session.durationSeconds}s
                        </span>
                        <span>{t("wordsCount").replace("{count}", session.wordCount)}</span>
                        <span>{formatDate(session.timestamp)}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs font-mono text-textSecondary italic leading-relaxed whitespace-pre-wrap">
                      "{session.content}"
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-textTertiary">
                {t("noSpeechLogs")}
              </div>
            )}
          </GlassCard>
        )}

        {/* 5. SEARCH HISTORY PANEL */}
        {activeTab === "searches" && (
          <GlassCard className="p-4 md:p-6">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
              <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">{t("searchKeywords")}</span>
              {searchHistory.length > 0 && (
                <button
                  onClick={clearAllSearches}
                  className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> {t("clearAll")}
                </button>
              )}
            </div>

            {searchHistory.length > 0 ? (
              <div className="flex flex-col gap-1">
                {searchHistory.map((query, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center px-3 py-2 hover:bg-white/[0.02] rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-3 text-textSecondary">
                      <Search className="w-4 h-4 text-textTertiary" />
                      <span className="text-xs">{query}</span>
                    </div>
                    <button
                      onClick={() => removeSearch(query)}
                      className="p-1 text-textTertiary hover:text-red-400 hover:bg-white/[0.04] rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-textTertiary">{t("noSearchHistory")}</div>
            )}
          </GlassCard>
        )}
      </div>
    </motion.div>
  );
}

// Inline helper for SVG / Sparkles representation
function SparklesIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5 5 3Z" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" />
    </svg>
  );
}
