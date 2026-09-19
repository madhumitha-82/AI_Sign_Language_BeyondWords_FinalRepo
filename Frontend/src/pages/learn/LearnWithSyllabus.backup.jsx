import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { GlassCard } from "../../components/shared/GlassCard";
import { GradientBadge } from "../../components/shared/GradientBadge";
import { useProgress } from "../../hooks/useProgress";
import { useApp } from "../../context/AppContext";
import { learningApi } from "../../lib/api";

export function LearnWithSyllabus() {
  const navigate = useNavigate();
  const { t } = useApp();
  const { completedLessons } = useProgress();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await learningApi.get("/api/courses");
        setCourses(res.data);
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const [catalogPage, setCatalogPage] = useState(1);
  const catalogItemsPerPage = 10;
  const totalCatalogPages = Math.ceil(courses.length / catalogItemsPerPage);
  const startCatalogIndex = (catalogPage - 1) * catalogItemsPerPage;
  const paginatedCourses = courses.slice(startCatalogIndex, startCatalogIndex + catalogItemsPerPage);



  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col gap-6 pb-10 max-w-6xl mx-auto w-full px-4 text-textPrimary select-none text-left"
    >
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {!loading && (
        <div className="flex flex-col gap-8 animate-fadeIn">
          <div className="flex flex-col gap-1 border-b border-glassBorder pb-4">
            <h2 className="text-xl font-black text-textPrimary">Sign Language Courses</h2>
            <p className="text-xs text-textSecondary">
              Select a study syllabus to start learning visual signs and vocabulary
            </p>
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-textPrimary tracking-tight border-l-4 border-purple-500 pl-3">
                All Courses
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCourses.map(course => {
                      const courseMods = course.modules || [];
                      const totalLessons = courseMods.reduce((sum, m) => sum + (m.lessons || []).filter(l => !l.quiz).length, 0);

                      let diffGrad = "brand";
                      if (course.difficulty === "Beginner") diffGrad = "green";
                      else if (course.difficulty === "Intermediate") diffGrad = "cyan";
                      else if (course.difficulty === "Advanced") diffGrad = "rose";

                      return (
                        <motion.div
                          key={course.id}
                          whileHover={{ scale: 1.01 }}
                          onClick={() => {
                            window.localStorage.setItem("beyondwords_active_course_id", course.id);
                            
                            let targetLessonId = null;
                            for (const m of courseMods) {
                              const lessons = m.lessons || [];
                              const uncompleted = lessons.find(l => !completedLessons.includes(l.id));
                              if (uncompleted) {
                                targetLessonId = uncompleted.id;
                                break;
                              }
                            }
                            if (!targetLessonId && courseMods.length > 0 && courseMods[0].lessons?.length > 0) {
                                targetLessonId = courseMods[0].lessons[0].id;
                            }
                            
                            if (targetLessonId) {
                                navigate(`/learn/course/${course.id}/lesson/${targetLessonId}`);
                            } else {
                                navigate(`/learn/course/${course.id}/quiz`);
                            }
                          }}
                          className="cursor-pointer h-full"
                        >
                          <GlassCard className="p-0 border-white/[0.08] hover:border-purple-500/30 flex flex-col justify-between h-full overflow-hidden transition-all duration-300">
                            <div className="h-44 overflow-hidden relative">
                              <img 
                                src={course.thumbnail || [
                                  "https://images.unsplash.com/photo-1528699633788-424224dc89b5?q=80&w=640",
                                  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=640",
                                  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=640",
                                  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=640",
                                  "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=640",
                                  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=640",
                                  "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=640",
                                  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=640"
                                ][course.id % 8]}
                                alt={course.title}
                                className="w-full h-full object-cover brightness-[0.8] hover:scale-105 transition-transform duration-700"
                              />
                              <div className="absolute top-3 left-3">
                                <GradientBadge label={course.difficulty || "Beginner"} gradient={diffGrad} />
                              </div>
                            </div>

                            <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                              <div className="flex flex-col gap-2">
                                <h3 className="text-base font-extrabold text-textPrimary leading-snug">
                                  {course.title}
                                </h3>
                                <p className="text-xs text-textSecondary line-clamp-3 leading-relaxed">
                                  {course.description}
                                </p>
                              </div>

                              <div className="flex justify-between items-center text-[10px] font-mono text-textSecondary border-t border-white/[0.04] pt-4 mt-2">
                                <span>{courseMods.length} Modules | {totalLessons} Lessons</span>
                              </div>
                            </div>
                          </GlassCard>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
          </div>

          {totalCatalogPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4 select-none w-full border-t border-white/[0.04] pt-6">
              <button
                disabled={catalogPage === 1}
                onClick={() => setCatalogPage((p) => Math.max(p - 1, 1))}
                className="p-2 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] text-textSecondary hover:text-textPrimary disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[...Array(totalCatalogPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCatalogPage(i + 1)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    catalogPage === i + 1
                      ? "bg-gradient-brand text-white shadow-glow-purple"
                      : "border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] text-textSecondary hover:text-textPrimary"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={catalogPage === totalCatalogPages}
                onClick={() => setCatalogPage((p) => Math.min(p + 1, totalCatalogPages))}
                className="p-2 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] text-textSecondary hover:text-textPrimary disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
