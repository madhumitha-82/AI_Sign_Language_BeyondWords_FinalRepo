import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2, Bookmark, Sparkles, Play,
  Check, ChevronDown, Info, Zap, ChevronLeft
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { GlassCard } from "../../components/shared/GlassCard";
import { CourseQuiz } from "./CourseQuiz";
import { cn } from "../../lib/utils";
import { learningApi, userApi } from "../../lib/api";

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
  return "🤟";
};

export function LessonPage() {
  const { courseId, lessonId } = useParams();
  const location = useLocation();
  const { state, completeLesson, t } = useApp();

  const cId = parseInt(courseId);
  const lId = lessonId ? parseInt(lessonId) : null;
  const isQuiz = location.pathname.endsWith("quiz");

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
      } catch (e) {}
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : url;
  };
  const [isPlaying, setIsPlaying] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(false);
  
  const [bookmarked, setBookmarked] = useState(false);

  const [notes, setNotes] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const courseRes = await learningApi.get("/api/courses");
        const found = courseRes.data.find(c => c.id === cId);
        setCourseData(found || null);
      } catch (err) {
        console.error("Failed to load course", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [cId]);

  useEffect(() => {
    if (lId) {
      const fetchNotes = async () => {
        try {
          const notesRes = await learningApi.get(`/api/courses/lessons/${lId}/notes`);
          if (notesRes.data && notesRes.data.notesText) {
            setNotes(notesRes.data.notesText);
          } else {
            setNotes("");
          }
        } catch(e) {}
      };
      fetchNotes();
      setIsPlaying(false);
      setAiExpanded(false);
      
      const fetchBookmark = async () => {
        try {
          const res = await learningApi.get("/api/courses/bookmarks");
          const bookmarks = res.data || [];
          setBookmarked(bookmarks.includes(lId));
        } catch(e) {}
      };
      fetchBookmark();
    }
  }, [lId]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (notes.trim() !== "" && lId) {
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

  const toggleBookmark = async () => {
    const newValue = !bookmarked;
    setBookmarked(newValue);
    if (!lId) return;
    try {
      if (newValue) {
        await learningApi.post(`/api/courses/bookmarks/${lId}`);
      } else {
        await learningApi.delete(`/api/courses/bookmarks/${lId}`);
      }
    } catch (e) {
      console.error("Failed to toggle bookmark", e);
      setBookmarked(!newValue); // revert on failure
    }
  };

  if (loading && !courseData) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-red-400">Course Not Found</h3>
        <Link to="/learn/syllabus" className="text-purple-400 hover:underline mt-2 inline-block">
          Return to Syllabus
        </Link>
      </div>
    );
  }

  const backendModules = courseData.modules || [];

  let currentModule = null;
  let currentLesson = null;
  if (!isQuiz && lId) {
    currentModule = backendModules.find(m => m.lessons?.some(l => l.id === lId));
    currentLesson = currentModule?.lessons?.find(l => l.id === lId);
  }

  const handlePronounce = () => {
    if ("speechSynthesis" in window && currentLesson) {
      const textToSpeak = currentLesson.title;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleComplete = () => {
    if (currentLesson && currentModule) {
      completeLesson(lId, currentModule.id, currentLesson.title, currentModule.title, 12);
    }
  };

  const isCompleted = lId ? state.progress?.completedLessons?.includes(lId) : false;

  return (
    <div className="flex relative min-h-[calc(100vh-100px)] w-full">
      <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col gap-4">
        <div className="flex items-center">
          <Link 
            to="/learn/syllabus" 
            className="flex items-center gap-1.5 text-xs font-bold text-textTertiary hover:text-purple-400 transition-colors uppercase tracking-widest bg-white/[0.02] border border-white/[0.05] hover:border-purple-500/30 px-3 py-2 rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Course Catalog
          </Link>
        </div>
        <AnimatePresence mode="wait">
          {isQuiz ? (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <CourseQuiz 
                courseId={cId} 
                courseTitle={courseData.title} 
                onComplete={async (score) => {
                  // Mark all lessons in the course as completed
                  if (courseData && courseData.modules) {
                    const allLessons = courseData.modules.flatMap(m => m.lessons || []).filter(l => !l.quiz);
                    for (const l of allLessons) {
                      completeLesson(l.id, null, l.title, courseData.title, 0);
                    }
                  }
                  // The backend analytics-service automatically handles awarding the 20 XP completion bonus 
                  // with proper anti-farming protection when the quiz triggers the completion endpoint.
                }}
              />
            </motion.div>
          ) : !currentLesson ? (
             <div className="text-center py-20">
               <h3 className="text-xl font-bold text-textPrimary">Welcome to {courseData.title}</h3>
               <p className="text-textSecondary mt-2">Select a lesson from the syllabus in the sidebar to begin learning.</p>
             </div>
          ) : (
            <motion.div
              key={`lesson-${lId}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start"
            >
              <div className="xl:col-span-2 flex flex-col gap-6">
                <GlassCard className="overflow-hidden relative aspect-video bg-black flex items-center justify-center border border-white/[0.08] shadow-2xl">
                  {currentLesson.videoUrl && isPlaying ? (
                    getEmbedUrl(currentLesson.videoUrl)?.includes("youtube.com/embed") ? (
                      <iframe src={getEmbedUrl(currentLesson.videoUrl)} title={currentLesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full border-0" />
                    ) : (
                      <video src={currentLesson.videoUrl} autoPlay controls loop className="w-full h-full object-cover" />
                    )
                  ) : (
                    <div className="absolute inset-0 bg-gradient-brand-subtle flex flex-col items-center justify-center p-6 text-center select-none">
                      <div className="w-16 h-16 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 flex items-center justify-center cursor-pointer transition-all duration-300 text-white shadow-lg backdrop-blur" onClick={() => setIsPlaying(true)}>
                        <Play className="w-7 h-7 fill-white translate-x-0.5" />
                      </div>
                      <span className="text-xs font-bold text-textPrimary mt-4 tracking-wide">{t("aslVideoDemo")}</span>
                      <p className="text-[10px] text-textSecondary mt-1.5 max-w-sm">
                        {t("lessonVideoDemoDesc").replace("{title}", currentLesson.title)}
                      </p>
                    </div>
                  )}
                </GlassCard>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <GlassCard className="p-5 flex flex-col items-center justify-center text-center gap-3 md:col-span-1 border-purple-500/10">
                      <span className="text-xs font-bold font-mono text-textTertiary uppercase">{t("signAsset")}</span>
                      <div className="w-20 h-20 bg-gradient-cyan rounded-2xl flex items-center justify-center text-5xl shadow-glow-cyan animate-pulse select-none">
                        {currentLesson.signAnimation || getLessonIcon(currentLesson.title)}
                      </div>
                      <span className="text-xs font-bold text-textPrimary mt-1">{t("manualGesture")}</span>
                  </GlassCard>

                  <GlassCard className="p-6 md:col-span-2 flex flex-col gap-4">
                    <div>
                      <span className="text-xs font-bold font-mono text-textTertiary uppercase">{t("definitionMeaning")}</span>
                      <p className="text-xs text-textSecondary leading-relaxed mt-2">{currentLesson.meaning}</p>
                    </div>
                    <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl mt-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-mono text-textTertiary uppercase">{t("phonetics")}</span>
                        <span className="text-sm font-bold font-mono text-textAccent">{currentLesson.pronunciation}</span>
                      </div>
                      <button onClick={handlePronounce} className="p-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-textSecondary hover:text-textPrimary transition-all duration-200">
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </GlassCard>
                </div>

                <GlassCard className="p-6 flex flex-col gap-3">
                  <span className="text-xs font-bold font-mono text-textTertiary uppercase">{t("exampleTranslation")}</span>
                  <blockquote className="border-l-2 border-purple-500 pl-4 py-1.5 mt-1">
                    <p className="text-sm italic font-semibold text-textPrimary">"{currentLesson.exampleSentence}"</p>
                    <cite className="text-[10px] text-textSecondary mt-1.5 block not-italic">{t("englishContextTranslation")}</cite>
                  </blockquote>
                </GlassCard>

                <GlassCard className="p-4 border-cyan-500/10">
                  <button onClick={() => setAiExpanded(!aiExpanded)} className="w-full flex items-center justify-between text-left">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">{t("aiLinguisticExplanation")}</span>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-textTertiary transition-transform duration-200", aiExpanded && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {aiExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3 text-xs text-textSecondary leading-relaxed flex flex-col gap-2 border-t border-white/[0.06] pt-3 pl-1">
                        <p>{currentLesson.aiExplanation}</p>
                        <div className="bg-cyan-500/[0.02] border border-cyan-500/10 p-2.5 rounded-lg text-[10px] text-cyan-400 flex gap-1.5 mt-1">
                          <Info className="w-4 h-4 shrink-0" />
                          <span>{t("aiCoachTip")}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>

                <div className="mt-2 border-t border-white/[0.06] pt-6">
                  {isCompleted ? (
                    <div className="w-full py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold rounded-xl flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" /> {t("completedXpEarned")}
                    </div>
                  ) : (
                    <button onClick={handleComplete} className="w-full py-3.5 bg-gradient-brand hover:shadow-glow-purple text-white text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-99">
                      <Zap className="w-4 h-4 fill-white" /> {t("completeLessonXp")}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-6 xl:sticky xl:top-6">
                <GlassCard className="p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">{t("lessonActions")}</span>
                    <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded flex items-center gap-0.5">
                      <Zap className="w-3.5 h-3.5 fill-purple-400" /> +20 XP
                    </span>
                  </div>
                  <button onClick={toggleBookmark} className={cn("py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5", bookmarked ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-white/[0.02] border-white/[0.07] text-textSecondary hover:text-textPrimary hover:bg-white/[0.04]")}>
                    <Bookmark className={cn("w-4 h-4", bookmarked && "fill-amber-400")} />
                    <span>{bookmarked ? t("bookmarked") : t("bookmark")}</span>
                  </button>
                </GlassCard>

                <GlassCard className="p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">{t("lessonNotes")}</span>
                    <span className="text-[10px] text-textTertiary font-mono">{t("autoSaved")}</span>
                  </div>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("lessonNotesPlaceholder")} className="w-full h-40 bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.12] focus:border-purple-500/40 rounded-xl p-3 text-xs outline-none text-textPrimary placeholder-textTertiary transition-all resize-none leading-relaxed" />
                  <div className="flex justify-between items-center text-[10px] text-textTertiary">
                    <span>{t("charCount").replace("{count}", notes.length)}</span>
                    {noteSaved && <span className="text-emerald-400 flex items-center gap-0.5"><Check className="w-3 h-3" /> {t("saved")}</span>}
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
