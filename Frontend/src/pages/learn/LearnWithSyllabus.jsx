import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { GlassCard } from "../../components/shared/GlassCard";
import { GradientBadge } from "../../components/shared/GradientBadge";
import { useProgress } from "../../hooks/useProgress";
import { useApp } from "../../context/AppContext";
import { learningApi } from "../../lib/api";
import { CheckCircle2, PlayCircle, Award, ArrowRight } from "lucide-react";

const CourseSlider = ({ title, courses, completedLessons, navigate }) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  if (!courses || courses.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-textPrimary tracking-tight border-l-4 border-purple-500 pl-3">
          {title}
        </h3>
        <div className="flex gap-2">
          <button onClick={() => scroll("left")} className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] transition-colors">
            <ChevronLeft className="w-4 h-4 text-textSecondary" />
          </button>
          <button onClick={() => scroll("right")} className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] transition-colors">
            <ChevronRight className="w-4 h-4 text-textSecondary" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-6 snap-x snap-mandatory pb-4 hide-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        
        {courses.map((course) => {
          const courseMods = course.modules || [];
          const lessons = courseMods.flatMap(m => m.lessons || []).filter(l => !l.quiz);
          const totalLessons = lessons.length;
          const completedCount = lessons.filter(l => completedLessons.includes(l.id)).length;
          
          let status = 'NOT_STARTED';
          if (totalLessons > 0 && completedCount === totalLessons) status = 'COMPLETED';
          else if (completedCount > 0) status = 'IN_PROGRESS';

          const progressPercent = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);

          let diffGrad = "brand";
          if (course.difficulty === "Beginner") diffGrad = "green";
          else if (course.difficulty === "Intermediate") diffGrad = "cyan";
          else if (course.difficulty === "Advanced") diffGrad = "rose";

          return (
            <motion.div
              key={course.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                window.localStorage.setItem("beyondwords_active_course_id", course.id);
                let targetLessonId = null;
                for (const m of courseMods) {
                  const modsLessons = m.lessons || [];
                  const uncompleted = modsLessons.find(l => !completedLessons.includes(l.id));
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
              className="cursor-pointer snap-start shrink-0 w-[300px] h-[350px]"
            >
              <GlassCard className="p-0 border-white/[0.08] hover:border-purple-500/30 flex flex-col justify-between h-full overflow-hidden transition-all duration-300">
                <div className="h-40 overflow-hidden relative">
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
                    className="w-full h-full object-cover brightness-[0.8] hover:scale-105 transition-transform duration-700 pointer-events-none"
                  />
                  <div className="absolute top-3 left-3">
                    <GradientBadge label={course.difficulty || "Beginner"} gradient={diffGrad} />
                  </div>
                  {status === 'COMPLETED' && (
                    <div className="absolute inset-0 bg-emerald-900/60 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-md">
                        <CheckCircle2 className="w-5 h-5" />
                        Completed
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-base font-extrabold text-textPrimary leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-[11px] text-textSecondary line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 mt-1">
                    <div className="flex justify-between items-center text-[10px] font-mono text-textSecondary">
                      <span>{courseMods.length} Modules | {totalLessons} Lessons</span>
                      <span className={status === 'COMPLETED' ? 'text-emerald-400 font-bold' : ''}>
                        {progressPercent}%
                      </span>
                    </div>
                    
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-gradient-brand'}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

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

  // Categorize courses by strict status definitions
  const categorizedCourses = courses.map(course => {
    const mods = course.modules || [];
    const lessons = mods.flatMap(m => m.lessons || []).filter(l => !l.quiz);
    const total = lessons.length;
    const completed = lessons.filter(l => completedLessons.includes(l.id)).length;
    
    let status = 'NOT_STARTED';
    if (total > 0 && completed === total) status = 'COMPLETED';
    else if (completed > 0) status = 'IN_PROGRESS';

    return { ...course, completed, total, status };
  });

  const completedCourses = categorizedCourses.filter(c => c.status === 'COMPLETED');
  const inProgressCourses = categorizedCourses.filter(c => c.status === 'IN_PROGRESS');
  const notStartedCourses = categorizedCourses.filter(c => c.status === 'NOT_STARTED');

  // Compute Next Course Recommendation Algorithm
  let nextCourse = null;
  if (completedCourses.length > 0) {
    if (inProgressCourses.length > 0) {
      nextCourse = inProgressCourses[0];
    } else if (notStartedCourses.length > 0) {
      nextCourse = notStartedCourses[0];
    }
  } else if (inProgressCourses.length > 0) {
    nextCourse = inProgressCourses[0];
  } else if (notStartedCourses.length > 0) {
    nextCourse = notStartedCourses[0];
  }

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
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className="flex flex-col gap-1 border-b border-glassBorder pb-6 mb-4">
            <h2 className="text-2xl font-black text-textPrimary">Course Catalog</h2>
            <p className="text-sm text-textSecondary">
              Select a study syllabus to start learning visual signs and vocabulary
            </p>
          </div>

          {/* HERO: Next Course Recommendation */}
          {completedCourses.length > 0 && nextCourse === null && (
            <GlassCard className="p-8 border-emerald-500/30 bg-emerald-900/10 flex flex-col items-center justify-center text-center mb-6">
              <Award className="w-16 h-16 text-emerald-400 mb-4" />
              <h3 className="text-2xl font-black text-textPrimary">Congratulations!</h3>
              <p className="text-textSecondary mt-2">You have completed all available courses.</p>
            </GlassCard>
          )}

          {nextCourse && (
            <div className="mb-8">
              <h3 className="text-sm font-extrabold text-textPrimary tracking-tight border-l-4 border-cyan-500 pl-3 mb-4">
                Continue with Next Course
              </h3>
              <GlassCard className="p-6 border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 to-transparent flex flex-col md:flex-row gap-6 items-center">
                <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden shadow-lg border border-white/5 shrink-0">
                   <img 
                      src={nextCourse.thumbnail || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=640"}
                      alt={nextCourse.title}
                      className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex-1 flex flex-col gap-3 w-full">
                  <div>
                    <div className="flex gap-2 items-center mb-1">
                      <GradientBadge label={nextCourse.difficulty || "Beginner"} gradient="cyan" />
                      <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded">
                        {nextCourse.status === 'IN_PROGRESS' ? 'IN PROGRESS' : 'NOT STARTED'}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-textPrimary">{nextCourse.title}</h4>
                    <p className="text-xs text-textSecondary line-clamp-2 mt-1">{nextCourse.description}</p>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 mt-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-textSecondary">{nextCourse.completed} / {nextCourse.total} Lessons</span>
                      <span className="text-cyan-400">{Math.round((nextCourse.completed / Math.max(nextCourse.total, 1)) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-cyan rounded-full" style={{ width: `${(nextCourse.completed / Math.max(nextCourse.total, 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
                
                <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
                  <button 
                    onClick={() => {
                      window.localStorage.setItem("beyondwords_active_course_id", nextCourse.id);
                      navigate(`/learn/course/${nextCourse.id}/quiz`);
                    }}
                    className="w-full md:w-auto px-8 py-3 bg-gradient-cyan text-white font-bold rounded-xl hover:shadow-glow-cyan transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <CourseSlider 
              title="Continue Learning" 
              courses={inProgressCourses.length > 0 ? inProgressCourses : null} 
              completedLessons={completedLessons}
              navigate={navigate}
            />

            <CourseSlider 
              title="Not Started" 
              courses={notStartedCourses.length > 0 ? notStartedCourses : null} 
              completedLessons={completedLessons}
              navigate={navigate}
            />

            <CourseSlider 
              title="Completed Courses" 
              courses={completedCourses.length > 0 ? completedCourses : null} 
              completedLessons={completedLessons}
              navigate={navigate}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
