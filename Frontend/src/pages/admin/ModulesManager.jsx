import React, { useState, useEffect } from "react";
import { 
  Plus, Pencil, Trash2, Lock, Unlock, X, AlertTriangle, 
  ArrowLeft, ArrowRight, Check, Clock, Zap, BookOpen, 
  FileQuestion, HelpCircle, ChevronDown, ChevronUp, 
  Save, Eye, Layers, Sparkles, ArrowUp, ArrowDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../../context/AppContext";
import { GlassCard } from "../../components/shared/GlassCard";
import { GradientBadge } from "../../components/shared/GradientBadge";
import { cn } from "../../lib/utils";
import { learningApi } from "../../lib/api";

export function ModulesManager() {
  const { updateCoursesData } = useApp();
  
  const [courses, setCourses] = useState([]);

  // Course editing states
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [activeStep, setActiveStep] = useState(1); // 1 = Details, 2 = Modules, 3 = Review

  // Stepper Forms temporary states
  // Step 1: Course Info
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseThumbnail, setCourseThumbnail] = useState("");
  const [courseDifficulty, setCourseDifficulty] = useState("Beginner");
  const [courseTargetAudience, setCourseTargetAudience] = useState("");
  const [courseStatus, setCourseStatus] = useState("draft");

  // Step 2: Modules temporary controls
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [modTitle, setModTitle] = useState("");
  const [modDescription, setModDescription] = useState("");
  const [modOrder, setModOrder] = useState(1);
  const [modStatus, setModStatus] = useState("locked");

  // Lessons Form states
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonDurationMinutes, setLessonDurationMinutes] = useState(15);
  const [lessonOrder, setLessonOrder] = useState(1);
  const [lessonStatus, setLessonStatus] = useState("locked");
  const [lessonAiExplanation, setLessonAiExplanation] = useState("");
  const [lessonExampleSentence, setLessonExampleSentence] = useState("");

  // Quiz Form states
  const [isAddingQuiz, setIsAddingQuiz] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizXpReward, setQuizXpReward] = useState(250);
  const [quizTimeLimit, setQuizTimeLimit] = useState(30);
  const [quizPassPercent, setQuizPassPercent] = useState(70);
  const [quizQuestions, setQuizQuestions] = useState([]);

  // Question editing form nested inside Quiz Form
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [qText, setQText] = useState("");
  const [qOptA, setQOptA] = useState("");
  const [qOptB, setQOptB] = useState("");
  const [qOptC, setQOptC] = useState("");
  const [qOptD, setQOptD] = useState("");
  const [qCorrectAnswer, setQCorrectAnswer] = useState("A");
  const [qImageUrl, setQImageUrl] = useState("");

  // Trash Confirmations Modal
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);

  useEffect(() => {
    learningApi.get("/api/admin/courses")
      .then(res => setCourses(res.data || []))
      .catch(err => console.error(err));
  }, []);

  // Duration Helper Formatting
  const formatDuration = (totalMins) => {
    if (totalMins >= 60) {
      const hrs = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      return mins > 0 ? `${hrs}h ${mins}min` : `${hrs}h`;
    }
    return `${totalMins} min`;
  };

  // Stepper handlers
  const startNewCourse = () => {
    const newCourse = {
      id: Date.now(),
      title: "",
      description: "",
      difficulty: "Beginner",
      status: "draft",
      targetAudience: "",
      thumbnail: "",
      modules: []
    };
    setCurrentCourse(newCourse);
    
    // Reset forms
    setCourseTitle("");
    setCourseDescription("");
    setCourseThumbnail("");
    setCourseDifficulty("Beginner");
    setCourseTargetAudience("");
    setCourseStatus("draft");
    
    setActiveStep(1);
    setIsEditingCourse(true);
  };

  const startEditCourse = (course) => {
    setCurrentCourse(course);
    
    setCourseTitle(course.title || "");
    setCourseDescription(course.description || "");
    setCourseThumbnail(course.thumbnail || "");
    setCourseDifficulty(course.difficulty || "Beginner");
    setCourseTargetAudience(course.targetAudience || "");
    setCourseStatus(course.status || "draft");
    
    setActiveStep(1);
    setIsEditingCourse(true);
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await learningApi.delete(`/api/admin/courses/${courseId}`);
      const updated = courses.filter(c => c.id !== courseId);
      setCourses(updated);
      updateCoursesData(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const saveStep1 = (e) => {
    e.preventDefault();
    if (!courseTitle.trim()) return;

    setCurrentCourse(prev => ({
      ...prev,
      title: courseTitle,
      description: courseDescription,
      thumbnail: courseThumbnail,
      difficulty: courseDifficulty,
      targetAudience: courseTargetAudience,
      status: courseStatus
    }));

    setActiveStep(2);
  };

  // Modules CRUD
  const handleOpenAddModule = () => {
    setModTitle("");
    setModDescription("");
    setModOrder((currentCourse?.modules?.length || 0) + 1);
    setModStatus("locked");
    setEditingModuleId(null);
    setIsAddingModule(true);
  };

  const handleOpenEditModule = (mod) => {
    setModTitle(mod.title || "");
    setModDescription(mod.description || "");
    setModOrder(mod.order || 1);
    setModStatus(mod.status || "locked");
    setEditingModuleId(mod.id);
    setIsAddingModule(true);
  };

  const handleSaveModule = (e) => {
    e.preventDefault();
    if (!modTitle.trim()) return;

    const moduleData = {
      id: editingModuleId || Date.now(),
      courseId: currentCourse.id,
      title: modTitle,
      description: modDescription,
      order: parseInt(modOrder) || 1,
      status: modStatus,
      lessons: editingModuleId ? currentCourse.modules.find(m => m.id === editingModuleId)?.lessons || [] : [],
      quizzes: editingModuleId ? currentCourse.modules.find(m => m.id === editingModuleId)?.quizzes || [] : [],
    };

    // Recalculate duration & XP Reward
    moduleData.durationMinutes = moduleData.lessons.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
    moduleData.xpReward = moduleData.lessons.length * 20 + moduleData.quizzes.reduce((sum, q) => sum + (q.xpReward || 0), 0);

    let updatedModules;
    if (editingModuleId) {
      updatedModules = currentCourse.modules.map(m => m.id === editingModuleId ? moduleData : m);
    } else {
      updatedModules = [...currentCourse.modules, moduleData];
    }

    // Sort modules by order
    updatedModules.sort((a, b) => a.order - b.order);

    setCurrentCourse(prev => ({
      ...prev,
      modules: updatedModules
    }));

    setIsAddingModule(false);
  };

  const handleDeleteModule = (modId) => {
    const modToDelete = currentCourse?.modules?.find(m => m.id === modId);
    if (modToDelete) {
      try {
        const trash = JSON.parse(localStorage.getItem("beyondwords_trash_bin") || "[]");
        trash.push({
          id: Date.now() + Math.floor(Math.random() * 1000),
          type: "module",
          title: modToDelete.title,
          deletedAt: new Date().toISOString(),
          data: modToDelete,
          parentId: currentCourse.id
        });
        localStorage.setItem("beyondwords_trash_bin", JSON.stringify(trash));
      } catch (e) {
        console.error(e);
      }
    }
    const updatedModules = currentCourse.modules.filter(m => m.id !== modId);
    setCurrentCourse(prev => ({
      ...prev,
      modules: updatedModules
    }));
  };

  // Lessons CRUD
  const handleOpenAddLesson = (modId) => {
    setExpandedModuleId(modId);
    setLessonTitle("");
    setLessonDescription("");
    setLessonVideoUrl("");
    setLessonDurationMinutes(15);
    const mod = currentCourse.modules.find(m => m.id === modId);
    setLessonOrder((mod?.lessons?.length || 0) + 1);
    setLessonStatus("locked");
    setLessonAiExplanation("");
    setLessonExampleSentence("");
    setEditingLessonId(null);
    setIsAddingLesson(true);
  };

  const handleOpenEditLesson = (modId, les) => {
    setExpandedModuleId(modId);
    setLessonTitle(les.title || "");
    setLessonDescription(les.description || "");
    setLessonVideoUrl(les.videoUrl || "");
    setLessonDurationMinutes(les.durationMinutes || 15);
    setLessonOrder(les.order || 1);
    setLessonStatus(les.status || "locked");
    setLessonAiExplanation(les.aiExplanation || "");
    setLessonExampleSentence(les.exampleSentence || "");
    setEditingLessonId(les.id);
    setIsAddingLesson(true);
  };

  const handleSaveLesson = (e) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;

    const lessonData = {
      id: editingLessonId || (Date.now() + Math.floor(Math.random() * 1000)),
      moduleId: expandedModuleId,
      title: lessonTitle,
      description: lessonDescription,
      videoUrl: lessonVideoUrl,
      durationMinutes: parseInt(lessonDurationMinutes) || 15,
      order: parseInt(lessonOrder) || 1,
      status: lessonStatus,
      aiExplanation: lessonAiExplanation,
      exampleSentence: lessonExampleSentence
    };

    const updatedModules = currentCourse.modules.map(mod => {
      if (mod.id === expandedModuleId) {
        let lessons = [...(mod.lessons || [])];
        if (editingLessonId) {
          lessons = lessons.map(l => l.id === editingLessonId ? lessonData : l);
        } else {
          lessons.push(lessonData);
        }
        lessons.sort((a, b) => a.order - b.order);

        const durationMinutes = lessons.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
        const xpReward = lessons.length * 20 + (mod.quizzes || []).reduce((sum, q) => sum + (q.xpReward || 0), 0);

        return {
          ...mod,
          lessons,
          durationMinutes,
          xpReward
        };
      }
      return mod;
    });

    setCurrentCourse(prev => ({
      ...prev,
      modules: updatedModules
    }));

    setIsAddingLesson(false);
  };

  const handleDeleteLesson = (modId, lesId) => {
    const parentMod = currentCourse?.modules?.find(m => m.id === modId);
    const lesToDelete = parentMod?.lessons?.find(l => l.id === lesId);
    if (lesToDelete) {
      try {
        const trash = JSON.parse(localStorage.getItem("beyondwords_trash_bin") || "[]");
        trash.push({
          id: Date.now() + Math.floor(Math.random() * 1000),
          type: "lesson",
          title: lesToDelete.title,
          deletedAt: new Date().toISOString(),
          data: lesToDelete,
          parentId: modId,
          parentCourseId: currentCourse.id
        });
        localStorage.setItem("beyondwords_trash_bin", JSON.stringify(trash));
      } catch (e) {
        console.error(e);
      }
    }

    const updatedModules = currentCourse.modules.map(mod => {
      if (mod.id === modId) {
        const lessons = (mod.lessons || []).filter(l => l.id !== lesId);
        const durationMinutes = lessons.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
        const xpReward = lessons.length * 20 + (mod.quizzes || []).reduce((sum, q) => sum + (q.xpReward || 0), 0);

        return {
          ...mod,
          lessons,
          durationMinutes,
          xpReward
        };
      }
      return mod;
    });

    setCurrentCourse(prev => ({
      ...prev,
      modules: updatedModules
    }));
  };

  // Quizzes CRUD
  const handleOpenAddQuiz = (modId) => {
    setExpandedModuleId(modId);
    setQuizTitle("");
    setQuizXpReward(250);
    setQuizTimeLimit(30);
    setQuizPassPercent(70);
    setQuizQuestions([]);
    setEditingQuizId(null);
    setIsAddingQuiz(true);
  };

  const handleOpenEditQuiz = (modId, qz) => {
    setExpandedModuleId(modId);
    setQuizTitle(qz.title || "");
    setQuizXpReward(qz.xpReward || 250);
    setQuizTimeLimit(qz.timeLimitSeconds || 30);
    setQuizPassPercent(qz.passPercent || 70);
    setQuizQuestions(qz.questions || []);
    setEditingQuizId(qz.id);
    setIsAddingQuiz(true);
  };

  const handleSaveQuiz = (e) => {
    e.preventDefault();
    if (!quizTitle.trim()) return;

    const quizData = {
      id: editingQuizId || (Date.now() + Math.floor(Math.random() * 1000)),
      moduleId: expandedModuleId,
      title: quizTitle,
      xpReward: parseInt(quizXpReward) || 250,
      timeLimitSeconds: parseInt(quizTimeLimit) || 30,
      passPercent: parseInt(quizPassPercent) || 70,
      questions: quizQuestions
    };

    const updatedModules = currentCourse.modules.map(mod => {
      if (mod.id === expandedModuleId) {
        let quizzes = [...(mod.quizzes || [])];
        if (editingQuizId) {
          quizzes = quizzes.map(q => q.id === editingQuizId ? quizData : q);
        } else {
          quizzes = [quizData]; // Only 1 quiz per module supported in hierarchy
        }

        const xpReward = (mod.lessons || []).length * 20 + quizzes.reduce((sum, q) => sum + (q.xpReward || 0), 0);

        return {
          ...mod,
          quizzes,
          xpReward
        };
      }
      return mod;
    });

    setCurrentCourse(prev => ({
      ...prev,
      modules: updatedModules
    }));

    setIsAddingQuiz(false);
  };

  const handleDeleteQuiz = (modId, qzId) => {
    const updatedModules = currentCourse.modules.map(mod => {
      if (mod.id === modId) {
        const quizzes = (mod.quizzes || []).filter(q => q.id !== qzId);
        const xpReward = (mod.lessons || []).length * 20 + quizzes.reduce((sum, q) => sum + (q.xpReward || 0), 0);

        return {
          ...mod,
          quizzes,
          xpReward
        };
      }
      return mod;
    });

    setCurrentCourse(prev => ({
      ...prev,
      modules: updatedModules
    }));
  };

  // Questions Builder
  const handleOpenAddQuestion = () => {
    setQText("");
    setQOptA("");
    setQOptB("");
    setQOptC("");
    setQOptD("");
    setQCorrectAnswer("A");
    setQImageUrl("");
    setEditingQuestionId(null);
    setIsAddingQuestion(true);
  };

  const handleOpenEditQuestion = (q) => {
    setQText(q.text || "");
    setQOptA(q.options?.A || "");
    setQOptB(q.options?.B || "");
    setQOptC(q.options?.C || "");
    setQOptD(q.options?.D || "");
    setQCorrectAnswer(q.correctAnswer || "A");
    setQImageUrl(q.signImageUrl || "");
    setEditingQuestionId(q.id);
    setIsAddingQuestion(true);
  };

  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (!qText.trim()) return;

    const questionData = {
      id: editingQuestionId || (Date.now() + Math.floor(Math.random() * 1000)),
      text: qText,
      signImageUrl: qImageUrl,
      options: {
        A: qOptA,
        B: qOptB,
        C: qOptC,
        D: qOptD
      },
      correctAnswer: qCorrectAnswer
    };

    let updatedQuestions = [...quizQuestions];
    if (editingQuestionId) {
      updatedQuestions = updatedQuestions.map(q => q.id === editingQuestionId ? questionData : q);
    } else {
      updatedQuestions.push(questionData);
    }

    setQuizQuestions(updatedQuestions);
    setIsAddingQuestion(false);
  };

  const handleDeleteQuestion = (qId) => {
    setQuizQuestions(quizQuestions.filter(q => q.id !== qId));
  };

  const handleMoveQuestion = (index, direction) => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === quizQuestions.length - 1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...quizQuestions];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setQuizQuestions(updated);
  };

  // Final Step 3 Save Course
  const handleSaveCourse = async (status) => {
    const updatedCourse = {
      ...currentCourse,
      status: status
    };

    try {
      const isExisting = courses.some(c => c.id === currentCourse.id);
      if (isExisting) {
        await learningApi.put(`/api/admin/courses/${currentCourse.id}`, updatedCourse);
        const updatedCourses = courses.map(c => c.id === currentCourse.id ? updatedCourse : c);
        setCourses(updatedCourses);
        updateCoursesData(updatedCourses);
      } else {
        const res = await learningApi.post("/api/admin/courses", updatedCourse);
        const newCourses = [...courses, res.data];
        setCourses(newCourses);
        updateCoursesData(newCourses);
      }
      setIsEditingCourse(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-textPrimary select-none">
      
      {/* 1. Courses List View */}
      {!isEditingCourse && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-textPrimary">Course & Syllabus Manager</h2>
              <p className="text-xs text-textTertiary mt-1 font-semibold">
                Manage ASL courses, structured learning modules, lessons, and practice quizzes.
              </p>
            </div>
            <button
              onClick={startNewCourse}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-brand text-white text-xs font-bold rounded-xl hover:shadow-glow-purple transition-all duration-300 active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Course</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map(course => {
              const totalModules = course.modules?.length || 0;
              const totalLessons = course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0;
              const totalDuration = course.modules?.reduce((sum, m) => sum + (m.durationMinutes || 0), 0) || 0;
              const totalXP = course.modules?.reduce((sum, m) => sum + (m.xpReward || 0), 0) || 0;

              return (
                <GlassCard key={course.id} className="p-5 flex flex-col gap-4 border-white/[0.08] hover:scale-[1.01] transition-transform duration-300 relative group overflow-hidden">
                  <div className="flex items-start gap-4">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title} 
                        className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                        <Layers className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-sm text-textPrimary truncate max-w-[200px]">
                          {course.title || "Untitled Course"}
                        </h3>
                        <GradientBadge 
                          label={course.status === "published" ? "Published" : "Draft"}
                          gradient={course.status === "published" ? "green" : "amber"}
                          className="scale-90"
                        />
                      </div>
                      <p className="text-[10px] text-textSecondary line-clamp-2 mt-1 leading-relaxed">
                        {course.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/[0.06] text-center text-xs font-semibold">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-textTertiary uppercase">Modules</span>
                      <span className="text-textPrimary mt-0.5">{totalModules}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-textTertiary uppercase">Lessons</span>
                      <span className="text-textPrimary mt-0.5">{totalLessons}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-textTertiary uppercase">Duration</span>
                      <span className="text-cyan-400 mt-0.5">{formatDuration(totalDuration)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-textTertiary uppercase">Total XP</span>
                      <span className="text-purple-400 mt-0.5">+{totalXP} XP</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-1.5">
                    <button
                      onClick={() => startEditCourse(course)}
                      className="px-3 py-1.5 border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] text-textSecondary hover:text-textPrimary text-[10px] font-bold rounded-lg flex items-center gap-1 transition-all"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        setDeleteConfirmTarget({
                          type: "course",
                          id: course.id,
                          title: course.title
                        });
                      }}
                      className="px-3 py-1.5 border border-red-500/10 hover:border-red-500/20 bg-red-500/[0.03] hover:bg-red-500/[0.06] text-red-400 hover:text-red-300 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </GlassCard>
              );
            })}

            {courses.length === 0 && (
              <GlassCard className="col-span-2 p-10 flex flex-col items-center justify-center text-center border-dashed border-white/10 py-16">
                <Layers className="w-10 h-10 text-textTertiary mb-3" />
                <h3 className="font-extrabold text-sm text-textPrimary">No Courses Found</h3>
                <p className="text-[11px] text-textSecondary mt-1 max-w-sm">
                  Click the "+ New Course" button to set up your syllabus structure.
                </p>
              </GlassCard>
            )}
          </div>
        </div>
      )}

      {/* 2. Course Multi-step Wizard Editor */}
      {isEditingCourse && (
        <div className="flex flex-col gap-6">
          {/* Stepper Header Progress Indicator */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => setIsEditingCourse(false)}
              className="text-xs text-textTertiary hover:text-textSecondary flex items-center gap-1 self-start transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Course Gallery
            </button>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-textPrimary">
                {currentCourse.title ? `Edit Course: ${currentCourse.title}` : "Create a Brand New Course"}
              </h2>
              <GradientBadge 
                label={`Step ${activeStep} of 3`}
                gradient="brand"
              />
            </div>
            
            {/* Horizontal Stepper UI bar */}
            <div className="grid grid-cols-3 gap-1 px-1 bg-white/[0.02] border border-white/[0.05] p-1.5 rounded-2xl">
              {[
                { step: 1, label: "Course Details", desc: "Core info" },
                { step: 2, label: "Modules & Content", desc: "Lessons & quizzes" },
                { step: 3, label: "Review & Publish", desc: "Summary check" }
              ].map(s => {
                const isActive = activeStep === s.step;
                const isCompleted = activeStep > s.step;

                return (
                  <div
                    key={s.step}
                    className={cn(
                      "flex flex-col md:flex-row items-center gap-2 px-3 py-2 rounded-xl transition-all select-none text-center md:text-left",
                      isActive && "bg-gradient-brand text-white shadow-glow-purple",
                      !isActive && "text-textTertiary"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 border",
                      isActive && "bg-white text-purple-600 border-white",
                      isCompleted && "bg-emerald-500 border-emerald-500 text-white",
                      !isActive && !isCompleted && "border-white/10 bg-white/[0.01]"
                    )}>
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.step}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className={cn("text-[10px] font-bold tracking-wide leading-tight", isActive ? "text-white" : "text-textPrimary")}>
                        {s.label}
                      </span>
                      <span className="text-[8px] font-mono text-white/50 hidden md:block">
                        {s.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Panels */}
          {/* STEP 1: Course details form */}
          {activeStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={saveStep1} className="flex flex-col gap-5">
                <GlassCard className="p-6 flex flex-col gap-4 border-white/[0.08]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 col-span-2">
                      <label className="text-xs font-bold text-textSecondary uppercase">Course Title</label>
                      <input 
                        type="text" 
                        required
                        value={courseTitle} 
                        onChange={e => setCourseTitle(e.target.value)}
                        placeholder="e.g., American Sign Language (ASL) Foundations"
                        className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-4 py-2.5 text-xs text-textPrimary placeholder-textTertiary transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 col-span-2">
                      <label className="text-xs font-bold text-textSecondary uppercase">Course Description</label>
                      <textarea
                        rows={3}
                        value={courseDescription}
                        onChange={e => setCourseDescription(e.target.value)}
                        placeholder="Write a brief overview of what this course will cover..."
                        className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-4 py-2.5 text-xs text-textPrimary placeholder-textTertiary resize-none transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-textSecondary uppercase">Difficulty Level</label>
                      <select
                        value={courseDifficulty}
                        onChange={e => setCourseDifficulty(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-4 py-2.5 text-xs text-textPrimary transition-colors"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-textSecondary uppercase">Target Audience</label>
                      <input 
                        type="text" 
                        value={courseTargetAudience} 
                        onChange={e => setCourseTargetAudience(e.target.value)}
                        placeholder="e.g., Beginners, Deaf studies students"
                        className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-4 py-2.5 text-xs text-textPrimary placeholder-textTertiary transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 col-span-2">
                      <label className="text-xs font-bold text-textSecondary uppercase">Thumbnail Cover Image URL</label>
                      <input 
                        type="url" 
                        value={courseThumbnail} 
                        onChange={e => setCourseThumbnail(e.target.value)}
                        placeholder="e.g., https://images.unsplash.com/photo-..."
                        className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-4 py-2.5 text-xs text-textPrimary placeholder-textTertiary transition-colors"
                      />
                    </div>

                    <div className="flex items-center gap-3 col-span-2 pt-2 border-t border-white/[0.04]">
                      <span className="text-xs font-bold text-textSecondary uppercase">Status</span>
                      <button
                        type="button"
                        onClick={() => setCourseStatus(prev => prev === "published" ? "draft" : "published")}
                        className={cn(
                          "px-4 py-1.5 rounded-xl font-bold text-[10px] uppercase border transition-colors",
                          courseStatus === "published" 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        )}
                      >
                        {courseStatus === "published" ? "Published" : "Draft Mode"}
                      </button>
                    </div>
                  </div>
                </GlassCard>

                <div className="flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingCourse(false)}
                    className="px-4 py-2 border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] text-textSecondary hover:text-textPrimary text-xs font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-brand hover:shadow-glow-purple text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all duration-300"
                  >
                    <span>Next: Add Modules</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 2: Modules list and edit forms */}
          {activeStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5"
            >
              {/* Modules layout List */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">
                  Modules in this course ({currentCourse.modules?.length || 0})
                </span>
                {!isAddingModule && !isAddingLesson && !isAddingQuiz && (
                  <button
                    onClick={handleOpenAddModule}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-purple-500/20 bg-purple-500/[0.03] hover:bg-purple-500/[0.06] text-purple-400 hover:text-purple-300 text-[10px] font-black rounded-lg transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Module</span>
                  </button>
                )}
              </div>

              {/* Inline Add/Edit Module Form overlay panel */}
              <AnimatePresence mode="wait">
                {isAddingModule && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <form onSubmit={handleSaveModule} className="flex flex-col gap-4 bg-white/[0.02] border border-white/[0.08] p-5 rounded-2xl">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                        <span className="text-xs font-bold text-textPrimary">
                          {editingModuleId ? "Edit Module Info" : "Create New Module"}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => setIsAddingModule(false)}
                          className="p-1 hover:bg-white/10 rounded-lg text-textSecondary"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5 col-span-2">
                          <label className="text-[10px] font-bold text-textSecondary uppercase">Module Title</label>
                          <input 
                            type="text" 
                            required
                            value={modTitle} 
                            onChange={e => setModTitle(e.target.value)}
                            placeholder="e.g., Module 1 - Fingerspelling Basics"
                            className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3 py-2 text-xs text-textPrimary placeholder-textTertiary"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5 col-span-2">
                          <label className="text-[10px] font-bold text-textSecondary uppercase">Module Description</label>
                          <textarea 
                            rows={2}
                            value={modDescription} 
                            onChange={e => setModDescription(e.target.value)}
                            placeholder="e.g., Cover the alphabet shapes..."
                            className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3 py-2 text-xs text-textPrimary placeholder-textTertiary resize-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-textSecondary uppercase">Module Order (Order Rank)</label>
                          <input 
                            type="number" 
                            required
                            min={1}
                            value={modOrder} 
                            onChange={e => setModOrder(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3 py-2 text-xs text-textPrimary"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-textSecondary uppercase">Access Status</label>
                          <select
                            value={modStatus}
                            onChange={e => setModStatus(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3 py-2 text-xs text-textPrimary"
                          >
                            <option value="unlocked">Unlocked by Default</option>
                            <option value="locked">Locked by Default (Requires previous module completion)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2.5 pt-2 border-t border-white/[0.04]">
                        <button
                          type="button"
                          onClick={() => setIsAddingModule(false)}
                          className="px-3.5 py-1.5 border border-white/[0.06] hover:bg-white/[0.02] text-textSecondary text-[10px] font-bold rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-gradient-brand text-white text-[10px] font-bold rounded-lg"
                        >
                          Save Module
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Inline Add/Edit Lesson Form Overlay */}
              <AnimatePresence mode="wait">
                {isAddingLesson && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <form onSubmit={handleSaveLesson} className="flex flex-col gap-4 bg-white/[0.02] border border-white/[0.08] p-5 rounded-2xl">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                        <span className="text-xs font-bold text-textPrimary">
                          {editingLessonId ? "Edit Lesson Content" : "Add Lesson to Module"}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => setIsAddingLesson(false)}
                          className="p-1 hover:bg-white/10 rounded-lg text-textSecondary"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5 col-span-2">
                          <label className="text-[10px] font-bold text-textSecondary uppercase">Lesson Title</label>
                          <input 
                            type="text" 
                            required
                            value={lessonTitle} 
                            onChange={e => setLessonTitle(e.target.value)}
                            placeholder="e.g., Alphabets A to E"
                            className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3 py-2 text-xs text-textPrimary placeholder-textTertiary"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5 col-span-2">
                          <label className="text-[10px] font-bold text-textSecondary uppercase">Lesson Meaning / Overview Description</label>
                          <textarea 
                            rows={2}
                            value={lessonDescription} 
                            onChange={e => setLessonDescription(e.target.value)}
                            placeholder="e.g., Master the basic fingerspelling hand postures..."
                            className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3 py-2 text-xs text-textPrimary placeholder-textTertiary resize-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-textSecondary uppercase">Video demonstration URL (Optional)</label>
                          <input 
                            type="text" 
                            value={lessonVideoUrl} 
                            onChange={e => setLessonVideoUrl(e.target.value)}
                            placeholder="/videos/hand-shapes-1.mp4"
                            className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3 py-2 text-xs text-textPrimary placeholder-textTertiary"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-textSecondary uppercase">Duration (Minutes)</label>
                          <input 
                            type="number" 
                            required
                            min={1}
                            value={lessonDurationMinutes} 
                            onChange={e => setLessonDurationMinutes(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3 py-2 text-xs text-textPrimary"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-textSecondary uppercase">Sort Order Rank</label>
                          <input 
                            type="number" 
                            required
                            min={1}
                            value={lessonOrder} 
                            onChange={e => setLessonOrder(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3 py-2 text-xs text-textPrimary"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-textSecondary uppercase">Status</label>
                          <select
                            value={lessonStatus}
                            onChange={e => setLessonStatus(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3 py-2 text-xs text-textPrimary"
                          >
                            <option value="unlocked">Unlocked</option>
                            <option value="locked">Locked</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5 col-span-2">
                          <label className="text-[10px] font-bold text-textSecondary uppercase">AI Linguistic Insights / Explanation (Optional)</label>
                          <textarea 
                            rows={2}
                            value={lessonAiExplanation} 
                            onChange={e => setLessonAiExplanation(e.target.value)}
                            placeholder="Insightful details explaining exact finger placement rules..."
                            className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3 py-2 text-xs text-textPrimary placeholder-textTertiary resize-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5 col-span-2">
                          <label className="text-[10px] font-bold text-textSecondary uppercase">Example Sentence (Optional)</label>
                          <input 
                            type="text" 
                            value={lessonExampleSentence} 
                            onChange={e => setLessonExampleSentence(e.target.value)}
                            placeholder="e.g., Spell 'CAB' smoothly without bouncing hand."
                            className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3 py-2 text-xs text-textPrimary placeholder-textTertiary"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2.5 pt-2 border-t border-white/[0.04]">
                        <button
                          type="button"
                          onClick={() => setIsAddingLesson(false)}
                          className="px-3.5 py-1.5 border border-white/[0.06] hover:bg-white/[0.02] text-textSecondary text-[10px] font-bold rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-gradient-brand text-white text-[10px] font-bold rounded-lg"
                        >
                          Save Lesson
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Inline Add/Edit Quiz Form Builder */}
              <AnimatePresence mode="wait">
                {isAddingQuiz && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-4 bg-white/[0.02] border border-white/[0.08] p-5 rounded-2xl">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                        <span className="text-xs font-bold text-textPrimary">
                          {editingQuizId ? "Edit Quiz Settings & Questions" : "Configure Quiz"}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => setIsAddingQuiz(false)}
                          className="p-1 hover:bg-white/10 rounded-lg text-textSecondary"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveQuiz} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-[10px] font-bold text-textSecondary uppercase">Quiz Title</label>
                            <input 
                              type="text" 
                              required
                              value={quizTitle} 
                              onChange={e => setQuizTitle(e.target.value)}
                              placeholder="e.g., Module 1 Review Quiz"
                              className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3 py-2 text-xs text-textPrimary placeholder-textTertiary"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-textSecondary uppercase">XP Reward Points</label>
                            <input 
                              type="number" 
                              required
                              value={quizXpReward} 
                              onChange={e => setQuizXpReward(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3 py-2 text-xs text-textPrimary"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-textSecondary uppercase">Seconds Per Question</label>
                            <input 
                              type="number" 
                              required
                              value={quizTimeLimit} 
                              onChange={e => setQuizTimeLimit(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3 py-2 text-xs text-textPrimary"
                            />
                          </div>
                        </div>

                        {/* Questions list area */}
                        <div className="flex flex-col gap-2.5 pt-3 border-t border-white/[0.04]">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">
                              Questions List ({quizQuestions.length})
                            </span>
                            {!isAddingQuestion && (
                              <button
                                type="button"
                                onClick={handleOpenAddQuestion}
                                className="px-2.5 py-1 border border-purple-500/20 bg-purple-500/[0.02] text-purple-400 hover:bg-purple-500/[0.05] text-[9px] font-bold rounded-md"
                              >
                                + Add Question
                              </button>
                            )}
                          </div>

                          {/* Nested Add/Edit Question Panel */}
                          <AnimatePresence mode="wait">
                            {isAddingQuestion && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="bg-[#0f0f1f]/50 border border-white/[0.06] p-4 rounded-xl flex flex-col gap-3"
                              >
                                <div className="flex justify-between items-center text-[10px] font-bold text-textPrimary uppercase">
                                  <span>{editingQuestionId ? "Edit Question" : "New Question Details"}</span>
                                  <button type="button" onClick={() => setIsAddingQuestion(false)}><X className="w-3.5 h-3.5" /></button>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[9px] font-bold text-textTertiary uppercase">Question Text</label>
                                  <input 
                                    type="text" 
                                    required
                                    value={qText} 
                                    onChange={e => setQText(e.target.value)}
                                    placeholder="Which letter shape represents..."
                                    className="w-full bg-black/40 border border-white/10 outline-none rounded-lg px-3 py-1.5 text-xs text-textPrimary"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] font-bold text-textTertiary uppercase">Option A</label>
                                    <input type="text" required value={qOptA} onChange={e => setQOptA(e.target.value)} className="bg-black/40 border border-white/10 outline-none rounded-lg px-3 py-1.5 text-xs text-textPrimary" />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] font-bold text-textTertiary uppercase">Option B</label>
                                    <input type="text" required value={qOptB} onChange={e => setQOptB(e.target.value)} className="bg-black/40 border border-white/10 outline-none rounded-lg px-3 py-1.5 text-xs text-textPrimary" />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] font-bold text-textTertiary uppercase">Option C</label>
                                    <input type="text" required value={qOptC} onChange={e => setQOptC(e.target.value)} className="bg-black/40 border border-white/10 outline-none rounded-lg px-3 py-1.5 text-xs text-textPrimary" />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] font-bold text-textTertiary uppercase">Option D</label>
                                    <input type="text" required value={qOptD} onChange={e => setQOptD(e.target.value)} className="bg-black/40 border border-white/10 outline-none rounded-lg px-3 py-1.5 text-xs text-textPrimary" />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-1">
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] font-bold text-textTertiary uppercase">Correct Answer Choice</label>
                                    <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs">
                                      {["A", "B", "C", "D"].map(opt => (
                                        <label key={opt} className="flex items-center gap-1 cursor-pointer font-bold">
                                          <input 
                                            type="radio" 
                                            name="correctAnswer" 
                                            value={opt} 
                                            checked={qCorrectAnswer === opt}
                                            onChange={() => setQCorrectAnswer(opt)}
                                            className="accent-purple-500"
                                          />
                                          <span>{opt}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] font-bold text-textTertiary uppercase">Illustration Image/GIF URL (Optional)</label>
                                    <input type="text" value={qImageUrl} onChange={e => setQImageUrl(e.target.value)} placeholder="✊ or URL" className="bg-black/40 border border-white/10 outline-none rounded-lg px-3 py-1.5 text-xs text-textPrimary placeholder-textTertiary" />
                                  </div>
                                </div>

                                <div className="flex justify-end gap-2.5 pt-2 border-t border-white/[0.04]">
                                  <button type="button" onClick={() => setIsAddingQuestion(false)} className="px-3 py-1 bg-white/[0.02] border border-white/10 rounded-md text-[9px] text-textSecondary">Cancel</button>
                                  <button type="button" onClick={handleSaveQuestion} className="px-3.5 py-1 bg-purple-600 rounded-md text-[9px] text-white font-bold">Save Question</button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Questions List Map */}
                          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                            {quizQuestions.map((q, idx) => (
                              <div key={q.id || idx} className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="font-mono text-purple-400 font-bold shrink-0">#{idx + 1}</span>
                                  {q.signImageUrl && (
                                    <span className="text-xl filter drop-shadow shrink-0">{q.signImageUrl}</span>
                                  )}
                                  <div className="flex flex-col min-w-0">
                                    <p className="font-bold text-textPrimary truncate">{q.text}</p>
                                    <span className="text-[9px] text-textTertiary mt-0.5 truncate">
                                      Options: A: {q.options?.A} | B: {q.options?.B} | Correct: {q.correctAnswer}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button 
                                    type="button" 
                                    disabled={idx === 0}
                                    onClick={() => handleMoveQuestion(idx, "up")}
                                    className="p-1 border border-white/[0.06] hover:bg-white/10 rounded text-textSecondary disabled:opacity-30"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button 
                                    type="button" 
                                    disabled={idx === quizQuestions.length - 1}
                                    onClick={() => handleMoveQuestion(idx, "down")}
                                    className="p-1 border border-white/[0.06] hover:bg-white/10 rounded text-textSecondary disabled:opacity-30"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={() => handleOpenEditQuestion(q)}
                                    className="p-1 border border-white/[0.06] hover:bg-white/10 rounded text-textSecondary"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    className="p-1 border border-red-500/10 bg-red-500/[0.03] hover:bg-red-500/[0.06] text-red-400 rounded"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}

                            {quizQuestions.length === 0 && (
                              <div className="text-center py-6 text-textTertiary text-[11px] border border-dashed border-white/5 rounded-xl">
                                No questions created yet. Click "+ Add Question".
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2.5 pt-3 border-t border-white/[0.04]">
                          <button
                            type="button"
                            onClick={() => setIsAddingQuiz(false)}
                            className="px-3.5 py-1.5 border border-white/[0.06] hover:bg-white/[0.02] text-textSecondary text-[10px] font-bold rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-gradient-brand text-white text-[10px] font-bold rounded-lg"
                          >
                            Save Quiz Settings
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Modules list render */}
              <div className="flex flex-col gap-4">
                {currentCourse.modules?.map((mod, index) => {
                  const isExpanded = expandedModuleId === mod.id;
                  const lessonsList = mod.lessons || [];
                  const quizzesList = mod.quizzes || [];

                  return (
                    <GlassCard key={mod.id} className="p-0 border-white/[0.08] overflow-hidden flex flex-col">
                      {/* Header toggle row */}
                      <div 
                        onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                        className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.01] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                            {mod.status === "locked" ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-purple-400 font-black">MODULE {index + 1}</span>
                              <h4 className="font-extrabold text-sm text-textPrimary truncate">{mod.title}</h4>
                            </div>
                            <span className="text-[10px] text-textSecondary font-semibold mt-0.5">
                              {lessonsList.length} Lessons | {quizzesList.length} Quiz | ⏱ {formatDuration(mod.durationMinutes || 0)} | +{mod.xpReward || 0} XP
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenEditModule(mod)}
                            className="p-1.5 border border-white/[0.06] hover:bg-white/10 text-textSecondary hover:text-textPrimary rounded-lg"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteModule(mod.id)}
                            className="p-1.5 border border-red-500/10 bg-red-500/[0.02] hover:bg-red-500/[0.06] text-red-400 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)} className="p-1 hover:bg-white/10 rounded-lg text-textTertiary cursor-pointer">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>

                      {/* Expanded content details slot */}
                      <AnimatePresence mode="wait">
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-white/[0.06] p-4 bg-black/20 flex flex-col gap-4 overflow-hidden"
                          >
                            {/* Lessons List */}
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">Lessons ({lessonsList.length})</span>
                                <button
                                  onClick={() => handleOpenAddLesson(mod.id)}
                                  className="px-2 py-1 bg-white/[0.02] hover:bg-white/10 border border-white/[0.08] text-[9px] font-bold rounded"
                                >
                                  + Add Lesson
                                </button>
                              </div>
                              
                              <div className="flex flex-col gap-1.5">
                                {lessonsList.map(les => (
                                  <div key={les.id} className="p-2.5 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] rounded-xl flex items-center justify-between text-xs gap-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                      <div className="flex flex-col min-w-0">
                                        <span className="font-extrabold text-textPrimary truncate">{les.title}</span>
                                        <span className="text-[9px] text-textTertiary mt-0.5">⏱ {les.durationMinutes} mins | Order: {les.order}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        onClick={() => handleOpenEditLesson(mod.id, les)}
                                        className="p-1 border border-white/[0.06] hover:bg-white/10 text-textSecondary rounded"
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteLesson(mod.id, les.id)}
                                        className="p-1 border border-red-500/10 bg-red-500/[0.02] hover:bg-red-500/[0.06] text-red-400 rounded"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}

                                {lessonsList.length === 0 && (
                                  <div className="text-center py-4 text-textTertiary text-[10px] border border-dashed border-white/5 rounded-xl">
                                    No lessons added.
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Quizzes List */}
                            <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.04]">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">Module Quiz ({quizzesList.length})</span>
                                {quizzesList.length === 0 && (
                                  <button
                                    onClick={() => handleOpenAddQuiz(mod.id)}
                                    className="px-2 py-1 bg-white/[0.02] hover:bg-white/10 border border-white/[0.08] text-[9px] font-bold rounded"
                                  >
                                    + Add Quiz
                                  </button>
                                )}
                              </div>

                              <div className="flex flex-col gap-1.5">
                                {quizzesList.map(qz => (
                                  <div key={qz.id} className="p-2.5 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] rounded-xl flex items-center justify-between text-xs gap-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <FileQuestion className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                      <div className="flex flex-col min-w-0">
                                        <span className="font-extrabold text-textPrimary truncate">{qz.title}</span>
                                        <span className="text-[9px] text-textTertiary mt-0.5">
                                          {qz.questions?.length || 0} Questions | {qz.timeLimitSeconds}s Limit | Pass: {qz.passPercent}%
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        onClick={() => handleOpenEditQuiz(mod.id, qz)}
                                        className="p-1 border border-white/[0.06] hover:bg-white/10 text-textSecondary rounded"
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteQuiz(mod.id, qz.id)}
                                        className="p-1 border border-red-500/10 bg-red-500/[0.02] hover:bg-red-500/[0.06] text-red-400 rounded"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}

                                {quizzesList.length === 0 && (
                                  <div className="text-center py-4 text-textTertiary text-[10px] border border-dashed border-white/5 rounded-xl">
                                    No quiz configured. Click "+ Add Quiz".
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </GlassCard>
                  );
                })}

                {(!currentCourse.modules || currentCourse.modules.length === 0) && (
                  <div className="text-center py-12 text-textTertiary border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center p-6 bg-white/[0.01]">
                    <Layers className="w-8 h-8 opacity-20 mb-2" />
                    <p className="text-xs">No Modules configured inside this course.</p>
                    <p className="text-[10px] mt-0.5">Click "+ Add Module" above to begin building syllabus blocks.</p>
                  </div>
                )}
              </div>

              {/* Action buttons footer */}
              <div className="flex justify-end gap-3 mt-4 border-t border-white/[0.06] pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2 border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] text-textSecondary hover:text-textPrimary text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={!currentCourse.title}
                  onClick={() => setActiveStep(3)}
                  className="px-5 py-2 bg-gradient-brand hover:shadow-glow-purple disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all duration-300"
                >
                  <span>Review & Complete</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Review and publish course details summary */}
          {activeStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5"
            >
              <GlassCard className="p-6 flex flex-col gap-5 border-white/[0.08]">
                <div className="border-b border-white/[0.06] pb-3">
                  <h3 className="text-base font-extrabold text-textPrimary">Course Summary Review</h3>
                  <p className="text-[11px] text-textSecondary mt-0.5">Verify that all structural levels and coordinates details look correct before publishing.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2 flex flex-col gap-3">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-textTertiary uppercase">Course Title</span>
                      <span className="font-extrabold text-sm text-textPrimary mt-0.5">{currentCourse.title}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-textTertiary uppercase">Course Description</span>
                      <p className="text-xs text-textSecondary mt-0.5 leading-relaxed">{currentCourse.description || "No description provided."}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono text-textTertiary uppercase">Difficulty</span>
                        <span className="text-xs text-textPrimary font-bold mt-0.5">{currentCourse.difficulty}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono text-textTertiary uppercase">Audience</span>
                        <span className="text-xs text-textPrimary font-bold mt-0.5">{currentCourse.targetAudience || "General Public"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 bg-white/[0.01] border border-white/[0.05] p-4 rounded-xl items-center justify-center text-center">
                    {currentCourse.thumbnail ? (
                      <img src={currentCourse.thumbnail} alt="Thumbnail preview" className="w-24 h-24 rounded-xl object-cover border border-white/10 shadow" />
                    ) : (
                      <Layers className="w-10 h-10 text-textTertiary" />
                    )}
                    <span className="text-[10px] text-textSecondary font-bold mt-1">Cover Preview</span>
                  </div>
                </div>

                {/* Modules breakdown summary */}
                <div className="flex flex-col gap-2.5 pt-4 border-t border-white/[0.06]">
                  <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">Modules Outline</span>
                  <div className="flex flex-col gap-2">
                    {currentCourse.modules?.map((mod, index) => {
                      const totalMins = mod.lessons?.reduce((sum, l) => sum + (l.durationMinutes || 0), 0) || 0;
                      const totalXp = mod.lessons?.length * 20 + mod.quizzes?.reduce((sum, q) => sum + (q.xpReward || 0), 0) || 0;

                      return (
                        <div key={mod.id} className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center justify-between text-xs gap-3">
                          <div className="flex flex-col min-w-0">
                            <span className="font-extrabold text-textPrimary truncate">{index + 1}. {mod.title}</span>
                            <span className="text-[10px] text-textTertiary mt-0.5">
                              {mod.lessons?.length || 0} Lessons | {mod.quizzes?.length || 0} Quizzes
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 font-mono text-[10px] font-bold">
                            <span className="text-cyan-400">{formatDuration(totalMins)}</span>
                            <span className="text-purple-400">+{totalXp} XP</span>
                          </div>
                        </div>
                      );
                    })}

                    {(!currentCourse.modules || currentCourse.modules.length === 0) && (
                      <div className="text-center py-4 text-textTertiary text-xs">No Modules configured.</div>
                    )}
                  </div>
                </div>
              </GlassCard>

              {/* Action buttons Step 3 footer */}
              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-2 border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] text-textSecondary hover:text-textPrimary text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCourse("draft")}
                  className="px-4 py-2 border border-amber-500/20 bg-amber-500/[0.02] hover:bg-amber-500/[0.05] text-amber-400 hover:text-amber-300 text-xs font-bold rounded-xl transition-all"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCourse("published")}
                  className="px-5 py-2 bg-gradient-brand hover:shadow-glow-purple text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all duration-300"
                >
                  <Check className="w-4 h-4" />
                  <span>Publish Syllabus</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal dialog */}
      <AnimatePresence>
        {deleteConfirmTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmTarget(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-bgSecondary border border-white/10 rounded-2xl p-5 shadow-2xl z-10 flex flex-col gap-4 text-center items-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-extrabold text-sm text-textPrimary">Delete Syllabus Item?</h3>
                <p className="text-[10px] text-textSecondary leading-normal">
                  Are you sure you want to delete "{deleteConfirmTarget.title}"? This cannot be undone and will update calculations.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full mt-1.5">
                <button
                  onClick={() => setDeleteConfirmTarget(null)}
                  className="w-full py-2 border border-white/[0.08] hover:bg-white/[0.02] text-xs font-bold rounded-xl text-textSecondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteCourse(deleteConfirmTarget.id);
                    setDeleteConfirmTarget(null);
                  }}
                  className="w-full py-2 bg-red-600 hover:bg-red-500 text-xs font-bold rounded-xl text-white shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
