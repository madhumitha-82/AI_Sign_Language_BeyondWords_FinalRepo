import { useApp } from "../context/AppContext";

export function useProgress() {
  const { state } = useApp();
  const { completedLessons } = state.progress;
  const modules = state.modules || [];

  const getModuleProgress = (moduleId) => {
    const module = modules.find((m) => m.id === moduleId);
    if (!module) return 0;
    const lessonLessons = (module.lessons || []).filter((l) => l.type === "lesson");
    if (lessonLessons.length === 0) return 0;
    const completedCount = lessonLessons.filter((l) => completedLessons.includes(l.id)).length;
    return Math.round((completedCount / lessonLessons.length) * 100);
  };

  const getOverallProgress = () => {
    const allLessonLessons = modules.flatMap((m) => m.lessons || []).filter((l) => l.type === "lesson");
    if (allLessonLessons.length === 0) return 0;
    const completedCount = allLessonLessons.filter((l) => completedLessons.includes(l.id)).length;
    return Math.round((completedCount / allLessonLessons.length) * 100);
  };

  const isModuleUnlocked = (moduleId) => {
    const currentModule = modules.find((m) => m.id === moduleId);
    if (!currentModule) return false;

    // Get all modules in the same course, sorted by order
    const courseModules = modules
      .filter((m) => (m.courseId ? parseInt(m.courseId) : 1) === (currentModule.courseId ? parseInt(currentModule.courseId) : 1))
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const index = courseModules.findIndex((m) => m.id === moduleId);
    if (index <= 0) return true; // First module of the course is always unlocked

    const prevModule = courseModules[index - 1];
    const prevModuleLessons = (prevModule?.lessons || []).filter((l) => l.type === "lesson");
    return prevModuleLessons.every((l) => completedLessons.includes(l.id));
  };

  return {
    getModuleProgress,
    getOverallProgress,
    isModuleUnlocked,
    completedLessons,
  };
}
