import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Play,
  Save,
  Check,
  ChevronDown,
  Info,
  Clock,
  Zap,
  BookOpen,
  Award,
  X,
  LayoutGrid,
  BrainCircuit
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { GlassCard } from "../../components/shared/GlassCard";
import { ModuleQuiz } from "./ModuleQuiz";
import { GradientBadge } from "../../components/shared/GradientBadge";
import { cn } from "../../lib/utils";
import { learningApi } from "../../lib/api";
import { useXP } from "../../hooks/useXP";

const getLessonIcon = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("greet") || t.includes("hello")) return "👋";
  if (t.includes("thank") || t.includes("sorry")) return "🙏";
  if (t.includes("alphabet") || t.includes("a-z") || t.includes("letter")) return "🔠";
  if (t.includes("number")) return "🔢";
  if (t.includes("family")) return "👨‍👩‍👧‍👦";
  if (t.includes("food") || t.includes("drink")) return "🍎";
  if (t.includes("animal")) return "🐶";
  if (t.includes("color")) return "🎨";
  if (t.includes("travel") || t.includes("airport")) return "✈️";
  if (t.includes("emergency") || t.includes("hospital") || t.includes("doctor")) return "🚑";
  if (t.includes("school") || t.includes("church")) return "🏫";
  if (t.includes("job") || t.includes("office") || t.includes("profession")) return "💼";
  if (t.includes("baby") || t.includes("toddler")) return "👶";
  if (t.includes("conversation") || t.includes("word") || t.includes("interpreter")) return "💬";
  return "🤟"; // default ASL sign
};

export function LessonPage() {
  const { moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const { state, completeLesson, t } = useApp();

  const mId = parseInt(moduleId);
  const lId = parseInt(lessonId);

  // States
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const getEmbedUrl = (url) => {
    if (!url) return null;
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/watch")) {
      try {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get("v");
      } catch (e) {
        // Fallback for invalid URL construction
      }
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : url;
  };
  const [isPlaying, setIsPlaying] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(false);
  
  const [bookmarked, setBookmarked] = useState(() => {
    try {
      const saved = window.localStorage.getItem(`bookmark_lesson_${lId}`);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [notes, setNotes] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  // Fetch course data and notes on mount or lesson change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [courseRes, notesRes] = await Promise.all([
          learningApi.get("/api/courses/active"),
          learningApi.get(`/api/courses/lessons/${lId}/notes`)
        ]);
        setCourseData(courseRes.data);
        if (notesRes.data && notesRes.data.notesText) {
          setNotes(notesRes.data.notesText);
        } else {
          setNotes("");
        }
      } catch (err) {
        console.error("Failed to load lesson data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    setIsPlaying(false);
    setAiExpanded(false);
    
    const savedBookmark = window.localStorage.getItem(`bookmark_lesson_${lId}`);
    setBookmarked(savedBookmark ? JSON.parse(savedBookmark) : false);
  }, [lId]);

  // Debounced note save
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (notes.trim() !== "") {
        try {
          await learningApi.post(`/api/courses/lessons/${lId}/notes`, { notesText: notes });
          setNoteSaved(true);
          setTimeout(() => setNoteSaved(false), 1200);
        } catch (e) {
          console.error("Failed to save notes", e);
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [notes, lId]);

  // Sync bookmarks
  useEffect(() => {
    try {
      window.localStorage.setItem(`bookmark_lesson_${lId}`, JSON.stringify(bookmarked));
    } catch (e) {
      console.error(e);
    }
  }, [bookmarked, lId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Find module and lesson
  const backendModules = courseData?.modules || [];
  let currentModule = backendModules.find((m) => m.id === mId);
  let currentLesson = currentModule?.lessons?.find((l) => l.id === lId);

  // Fallback: If not found in backend, check frontend state (for virtual lessons like Quizzes)
  if (!currentLesson || !currentModule) {
    const stateModule = state.modules?.find(m => m.id === mId);
    if (stateModule) {
      currentModule = stateModule;
      currentLesson = stateModule.lessons?.find(l => l.id === lId);
    }
  }

  if (!currentModule || !currentLesson) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-red-400">{t("lessonNotFound")}</h3>
        <Link to="/learn/syllabus" className="text-purple-400 hover:underline mt-2 inline-block">
          {t("returnToSyllabus")}
        </Link>
      </div>
    );
  }

  // Calculate index for navigation
  const lessonList = (currentModule?.lessons || []).filter((l) => !l.quiz && l.title);
  const currentIdx = lessonList.findIndex((l) => l.id === lId);
  const prevLesson = currentIdx > 0 ? lessonList[currentIdx - 1] : null;
  const nextLesson = currentIdx < lessonList.length - 1 ? lessonList[currentIdx + 1] : null;

  const isCompleted = state.progress.completedLessons.includes(lId);

  // Audio synthesis for pronunciation
  const handlePronounce = () => {
    if ("speechSynthesis" in window) {
      const textToSpeak = currentLesson.title;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleComplete = () => {
    // Add 20 XP, log in history, set completed
    completeLesson(lId, mId, currentLesson.title, currentModule.title, 12);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
    >
      {/* Left Column: Main Multimedia Content (2/3 width) */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Progress Navigation Header */}
        <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded">
              {t("moduleTag").replace("{mId}", mId)}
            </span>
            <span className="text-xs font-semibold text-textSecondary truncate max-w-[200px]">
              {t("lessonProgressText").replace("{current}", currentIdx + 1).replace("{total}", lessonList.length).replace("{moduleTitle}", currentModule.title)}
            </span>
          </div>
          <Link
            to="/learn/syllabus"
            className="text-xs font-bold text-textSecondary hover:text-textPrimary transition-colors flex items-center gap-1"
          >
            {t("syllabusLink")} <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Video Placeholder (16:9) */}
        <GlassCard className="overflow-hidden relative aspect-video bg-black flex items-center justify-center border border-white/[0.08] shadow-2xl">
          {currentLesson.videoUrl && isPlaying ? (
            getEmbedUrl(currentLesson.videoUrl)?.includes("youtube.com/embed") ? (
              <iframe
                src={getEmbedUrl(currentLesson.videoUrl)}
                title={currentLesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <video
                src={currentLesson.videoUrl}
                autoPlay
                controls
                loop
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <div className="absolute inset-0 bg-gradient-brand-subtle flex flex-col items-center justify-center p-6 text-center select-none">
              {/* Overlay graphics */}
              <div className="w-16 h-16 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 flex items-center justify-center cursor-pointer transition-all duration-300 text-white shadow-lg backdrop-blur" onClick={() => setIsPlaying(true)}>
                <Play className="w-7 h-7 fill-white translate-x-0.5" />
              </div>
              <span className="text-xs font-bold text-textPrimary mt-4 tracking-wide">
                {t("aslVideoDemo")}
              </span>
              <p className="text-[10px] text-textSecondary mt-1.5 max-w-sm">
                {t("lessonVideoDemoDesc").replace("{title}", currentLesson.title)}
              </p>
            </div>
          )}
        </GlassCard>

        {/* Sign Animation & Meaning row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sign visualizer */}
          <GlassCard className="p-5 flex flex-col items-center justify-center text-center gap-3 md:col-span-1 border-purple-500/10">
              <span className="text-xs font-bold font-mono text-textTertiary uppercase">{t("signAsset")}</span>
              <div className="w-20 h-20 bg-gradient-cyan rounded-2xl flex items-center justify-center text-5xl shadow-glow-cyan animate-pulse select-none">
                {currentLesson.signAnimation || getLessonIcon(currentLesson.title)}
              </div>
              <span className="text-xs font-bold text-textPrimary mt-1">{t("manualGesture")}</span>
          </GlassCard>

          {/* Meaning / Pronunciation */}
          <GlassCard className="p-6 md:col-span-2 flex flex-col gap-4">
            <div>
              <span className="text-xs font-bold font-mono text-textTertiary uppercase">{t("definitionMeaning")}</span>
              <p className="text-xs text-textSecondary leading-relaxed mt-2">
                {currentLesson.meaning}
              </p>
            </div>

            {/* Pronunciation block */}
            <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl mt-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono text-textTertiary uppercase">{t("phonetics")}</span>
                <span className="text-sm font-bold font-mono text-textAccent">{currentLesson.pronunciation}</span>
              </div>
              <button
                onClick={handlePronounce}
                className="p-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-textSecondary hover:text-textPrimary transition-all duration-200"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Example Sentence */}
        <GlassCard className="p-6 flex flex-col gap-3">
          <span className="text-xs font-bold font-mono text-textTertiary uppercase">{t("exampleTranslation")}</span>
          <blockquote className="border-l-2 border-purple-500 pl-4 py-1.5 mt-1">
            <p className="text-sm italic font-semibold text-textPrimary">"{currentLesson.exampleSentence}"</p>
            <cite className="text-[10px] text-textSecondary mt-1.5 block not-italic">
              {t("englishContextTranslation")}
            </cite>
          </blockquote>
        </GlassCard>

        {/* AI Explanation collapsible */}
        <GlassCard className="p-4 border-cyan-500/10">
          <button
            onClick={() => setAiExpanded(!aiExpanded)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                {t("aiLinguisticExplanation")}
              </span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-textTertiary transition-transform duration-200", aiExpanded && "transform rotate-180")} />
          </button>

          <AnimatePresence>
            {aiExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3 text-xs text-textSecondary leading-relaxed flex flex-col gap-2 border-t border-white/[0.06] pt-3 pl-1"
              >
                <p>{currentLesson.aiExplanation}</p>
                <div className="bg-cyan-500/[0.02] border border-cyan-500/10 p-2.5 rounded-lg text-[10px] text-cyan-400 flex gap-1.5 mt-1">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{t("aiCoachTip")}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* Previous / Next Navigation row */}
        <div className="flex items-center justify-between mt-4">
          {prevLesson ? (
            <button
              onClick={() => navigate(`/learn/syllabus/module/${mId}/lesson/${prevLesson.id}`)}
              className="px-4 py-2 border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] text-textSecondary hover:text-textPrimary text-xs font-semibold rounded-xl flex items-center gap-1 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> {t("previousLesson")}
            </button>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <button
              onClick={() => navigate(`/learn/syllabus/module/${mId}/lesson/${nextLesson.id}`)}
              className="px-4 py-2 border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] text-textSecondary hover:text-textPrimary text-xs font-semibold rounded-xl flex items-center gap-1 transition-all"
            >
              {t("nextLesson")} <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div />
          )}
        </div>

        {/* Complete Lesson CTA */}
        <div className="mt-2 border-t border-white/[0.06] pt-6">
          {isCompleted ? (
            <div className="w-full py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold rounded-xl flex items-center justify-center gap-2">
              <Check className="w-5 h-5" /> {t("completedXpEarned")}
            </div>
          ) : (
            <button
              onClick={handleComplete}
              className="w-full py-3.5 bg-gradient-brand hover:shadow-glow-purple text-white text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-99"
            >
              <Zap className="w-4 h-4 fill-white" /> {t("completeLessonXp")}
            </button>
          )}
        </div>
      </div>

      {/* Right Column: Sticky controls & notes (1/3 width) */}
      <div className="flex flex-col gap-6 lg:sticky lg:top-6">
        {/* Actions panel */}
        <GlassCard className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">{t("lessonActions")}</span>
            <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded flex items-center gap-0.5">
              <Zap className="w-3.5 h-3.5 fill-purple-400" /> +20 XP
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Bookmark button */}
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={cn(
                "flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                bookmarked
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-white/[0.02] border-white/[0.07] text-textSecondary hover:text-textPrimary hover:bg-white/[0.04]"
              )}
            >
              <Bookmark className={cn("w-4 h-4", bookmarked && "fill-amber-400")} />
              <span>{bookmarked ? t("bookmarked") : t("bookmark")}</span>
            </button>
          </div>
        </GlassCard>

        {/* Notes Panel */}
        <GlassCard className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">{t("lessonNotes")}</span>
            <span className="text-[10px] text-textTertiary font-mono">{t("autoSaved")}</span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("lessonNotesPlaceholder")}
            className="w-full h-40 bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.12] focus:border-purple-500/40 rounded-xl p-3 text-xs outline-none text-textPrimary placeholder-textTertiary transition-all resize-none leading-relaxed"
          />
          <div className="flex justify-between items-center text-[10px] text-textTertiary">
            <span>{t("charCount").replace("{count}", notes.length)}</span>
            {noteSaved && (
              <span className="text-emerald-400 flex items-center gap-0.5">
                <Check className="w-3 h-3" /> {t("saved")}
              </span>
            )}
          </div>
        </GlassCard>

        {/* Related Lessons */}
        <GlassCard className="p-5 flex flex-col gap-3">
          <div className="flex items-center gap-1.5 border-b border-white/[0.06] pb-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">{t("moduleSyllabus")}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {currentModule.lessons.map((les) => {
              const completed = state.progress.completedLessons.includes(les.id);
              const active = les.id === lId;

              return (
                <Link
                  key={les.id}
                  to={`/learn/syllabus/module/${mId}/lesson/${les.id}`}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg text-[11px] font-semibold transition-all",
                    active
                      ? "bg-purple-500/10 text-white border-l-2 border-purple-500"
                      : "text-textSecondary hover:text-textPrimary hover:bg-white/[0.02]"
                  )}
                >
                  <span className="truncate">{les.title}</span>
                  {completed && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />}
                </Link>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
