import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Layers, BookOpen, FileQuestion, Plus, Megaphone, Settings, Clock, RefreshCcw, Trash2, X, AlertTriangle, FolderKanban } from "lucide-react";
import { GlassCard } from "../../components/shared/GlassCard";
import { useApp } from "../../context/AppContext";
import { userApi, learningApi, analyticsApi } from "../../lib/api";

export function AdminDashboard() {
  const { state, updateCoursesData } = useApp();
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());

  // Recycle Bin states
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [trashItems, setTrashItems] = useState(() => {
    return JSON.parse(localStorage.getItem("beyondwords_trash_bin") || "[]");
  });
  const [alertMessage, setAlertMessage] = useState("");

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    totalLessons: 0,
    quizCompletedToday: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [topQuizzes, setTopQuizzes] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [userStatsRes, learningStatsRes, activityRes, topQuizzesRes] = await Promise.all([
          userApi.get("/api/admin/dashboard/stats"),
          learningApi.get("/api/admin/dashboard/stats"),
          analyticsApi.get("/api/admin/dashboard/activity"),
          learningApi.get("/api/admin/dashboard/top-quizzes")
        ]);

        setStats({
          ...userStatsRes.data,
          ...learningStatsRes.data
        });

        // Map activities to UI format
        const activities = activityRes.data.map(act => ({
          id: act.id,
          name: act.userEmail?.split('@')[0] || "System",
          action: mapActivityType(act.activityType),
          time: new Date(act.timestamp).toLocaleString(),
          avatar: (act.userEmail?.charAt(0) || "S").toUpperCase()
        }));
        setRecentActivities(activities);
        setTopQuizzes(topQuizzesRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };
    fetchDashboardData();
  }, []);

  const mapActivityType = (type) => {
    if (type === "attempt_quiz") return "completed a quiz";
    if (type === "complete_lesson") return "completed a lesson";
    if (type === "COURSE_CREATED") return "created a new course";
    if (type === "USER_REGISTERED") return "registered an account";
    return type.toLowerCase().replace(/_/g, ' ');
  };

  // Helper formats for module durations
  const formatDuration = (totalMins) => {
    if (totalMins >= 60) {
      const hrs = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      return mins > 0 ? `${hrs}h ${mins}min` : `${hrs}h`;
    }
    return `${totalMins} min`;
  };

  // Restore logic
  const handleRestoreItem = (item) => {
    const currentCourses = [...courses];
    
    if (item.type === "course") {
      // Restore Course directly
      currentCourses.push(item.data);
      updateCoursesData(currentCourses);
      
      const nextTrash = trashItems.filter(t => t.id !== item.id);
      setTrashItems(nextTrash);
      localStorage.setItem("beyondwords_trash_bin", JSON.stringify(nextTrash));
      
      triggerSuccessAlert(`Course "${item.title}" restored successfully!`);
    } 
    else if (item.type === "module") {
      // Find parent course
      const parentCourse = currentCourses.find(c => c.id === item.parentId);
      if (!parentCourse) {
        triggerErrorAlert("Parent course does not exist. Please restore the parent course first.");
        return;
      }
      
      if (!parentCourse.modules) parentCourse.modules = [];
      parentCourse.modules.push(item.data);
      // Sort modules by order
      parentCourse.modules.sort((a, b) => (a.order || 0) - (b.order || 0));

      updateCoursesData(currentCourses);
      
      const nextTrash = trashItems.filter(t => t.id !== item.id);
      setTrashItems(nextTrash);
      localStorage.setItem("beyondwords_trash_bin", JSON.stringify(nextTrash));
      
      triggerSuccessAlert(`Module "${item.title}" restored back to "${parentCourse.title}"!`);
    } 
    else if (item.type === "lesson") {
      // Find parent course and module
      const parentCourse = currentCourses.find(c => c.id === item.parentCourseId);
      const parentModule = parentCourse?.modules?.find(m => m.id === item.parentId);
      
      if (!parentCourse || !parentModule) {
        triggerErrorAlert("Parent module or course does not exist. Please restore parent structures first.");
        return;
      }

      if (!parentModule.lessons) parentModule.lessons = [];
      parentModule.lessons.push(item.data);
      // Sort lessons by order
      parentModule.lessons.sort((a, b) => (a.order || 0) - (b.order || 0));

      // Recompute module duration and XP reward
      const lessons = parentModule.lessons.filter(l => l.type === "lesson");
      parentModule.durationMinutes = lessons.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
      parentModule.xpReward = lessons.length * 20 + (parentModule.quizzes || []).reduce((sum, q) => sum + (q.xpReward || 0), 0);

      updateCoursesData(currentCourses);
      
      const nextTrash = trashItems.filter(t => t.id !== item.id);
      setTrashItems(nextTrash);
      localStorage.setItem("beyondwords_trash_bin", JSON.stringify(nextTrash));
      
      triggerSuccessAlert(`Lesson "${item.title}" restored back to "${parentModule.title}"!`);
    }
  };

  const handlePurgeItem = (id) => {
    const nextTrash = trashItems.filter(t => t.id !== id);
    setTrashItems(nextTrash);
    localStorage.setItem("beyondwords_trash_bin", JSON.stringify(nextTrash));
  };

  const triggerSuccessAlert = (msg) => {
    setAlertMessage("🟢 " + msg);
    setTimeout(() => setAlertMessage(""), 4000);
  };

  const triggerErrorAlert = (msg) => {
    setAlertMessage("🔴 " + msg);
    setTimeout(() => setAlertMessage(""), 4000);
  };

  return (
    <div className="flex flex-col gap-6 text-textPrimary select-none text-left relative">
      
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-textPrimary">Welcome back, Admin 👋</h2>
          <p className="text-xs text-textSecondary mt-1 font-semibold">
            System overview and quick controls dashboard
          </p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0 self-end">
          <button
            onClick={() => {
              // Reload trash bin to catch edits
              setTrashItems(JSON.parse(localStorage.getItem("beyondwords_trash_bin") || "[]"));
              setIsTrashOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 rounded-xl transition-all font-bold text-[10px]"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Recycle Bin ({trashItems.length})</span>
          </button>

          <div className="text-right font-mono text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3.5 py-1.5 rounded-xl">
            {now.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <GlassCard className="p-5 flex items-center justify-between border-white/[0.08]">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-textSecondary uppercase font-mono">Total Users</span>
            <span className="text-2xl font-black text-textPrimary font-mono">{stats.totalUsers}</span>
            <span className="text-[9px] text-emerald-400 font-bold mt-0.5 font-mono">Real-time DB Count</span>
          </div>
          <div className="w-11 h-11 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center justify-between border-white/[0.08]">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-textSecondary uppercase font-mono">Total Courses</span>
            <span className="text-2xl font-black text-textPrimary font-mono">
              {stats.totalCourses}
            </span>
            <span className="text-[9px] text-purple-400 font-bold mt-0.5 font-mono">
              {stats.publishedCourses} Pub / {stats.draftCourses} Draft
            </span>
          </div>
          <div className="w-11 h-11 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center justify-between border-white/[0.08]">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-textSecondary uppercase font-mono">Total Lessons</span>
            <span className="text-2xl font-black text-textPrimary font-mono">{stats.totalLessons}</span>
            <span className="text-[9px] text-cyan-400 font-bold mt-0.5 font-mono">Across all modules</span>
          </div>
          <div className="w-11 h-11 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400">
            <BookOpen className="w-5 h-5" />
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center justify-between border-white/[0.08]">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-textSecondary uppercase font-mono">Quizzes Completed</span>
            <span className="text-2xl font-black text-textPrimary font-mono">{stats.quizCompletedToday}</span>
            <span className="text-[9px] text-emerald-400 font-bold mt-0.5 font-mono">Attempts registered today</span>
          </div>
          <div className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
            <FileQuestion className="w-5 h-5" />
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions Row */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">Quick Actions</span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/admin/modules")}
            className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/[0.06] hover:border-purple-500/30 hover:bg-white/[0.05] text-left rounded-2xl transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Plus className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-textPrimary">New Course</span>
              <span className="text-[9px] text-textTertiary font-mono">Creator Stepper</span>
            </div>
          </button>

          <button
            onClick={() => navigate("/admin/quizzes")}
            className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/[0.06] hover:border-purple-500/30 hover:bg-white/[0.05] text-left rounded-2xl transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Plus className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-textPrimary">New Quiz Category</span>
              <span className="text-[9px] text-textTertiary font-mono">Quizzes Manager</span>
            </div>
          </button>

          <button
            onClick={() => navigate("/admin/announcements")}
            className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/[0.06] hover:border-purple-500/30 hover:bg-white/[0.05] text-left rounded-2xl transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Megaphone className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-textPrimary">Post Announcement</span>
              <span className="text-[9px] text-textTertiary font-mono">Dashboard Banner</span>
            </div>
          </button>

          <button
            onClick={() => navigate("/admin/settings")}
            className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/[0.06] hover:border-purple-500/30 hover:bg-white/[0.05] text-left rounded-2xl transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Settings className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-textPrimary">Platform Settings</span>
              <span className="text-[9px] text-textTertiary font-mono">Configurations</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Grid: Activity & Popular Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity feed */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">Recent System Activity</span>
          <GlassCard className="p-4 flex flex-col gap-3 border-white/[0.08] max-h-[460px] overflow-y-auto">
            {recentActivities.map((act, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-white/[0.02] border border-transparent hover:border-white/[0.04] rounded-2xl transition-all text-xs gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8.5 h-8.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center font-mono">
                    {act.avatar}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="font-semibold text-textPrimary">
                      <span className="font-extrabold">{act.name}</span> {act.action}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 font-mono text-[9px] text-textTertiary shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{act.time}</span>
                </div>
              </div>
            ))}
          </GlassCard>
        </div>

        {/* Popular Content Card */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">Top Performing Content</span>
          <GlassCard className="p-5 flex flex-col gap-4 border-white/[0.08] h-full">
            {/* Top Quizzes */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-textTertiary uppercase font-mono tracking-wider">Top Quizzes (This Week)</span>
              <div className="flex flex-col gap-2">
                {topQuizzes.length > 0 ? (
                  topQuizzes.map((q, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2 bg-white/[0.01] rounded-xl border border-white/[0.03]">
                      <span className="font-bold text-textPrimary truncate max-w-[150px]">{idx + 1}. {q.category}</span>
                      <span className="text-[10px] text-purple-400 font-bold font-mono">{q.attempts} attempts</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-textTertiary p-2">No quiz attempts this week yet.</div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Recycle Bin / Trash Modal Overlay */}
      {isTrashOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-2xl p-6 border-white/[0.08] shadow-2xl relative flex flex-col gap-4 max-h-[85vh]">
            <button
              onClick={() => setIsTrashOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-white/10 text-textSecondary rounded-lg transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="border-b border-white/[0.06] pb-3 text-left">
              <h3 className="text-base font-extrabold text-textPrimary flex items-center gap-2">
                <RefreshCcw className="w-4.5 h-4.5 text-purple-400" />
                Recycle Bin
              </h3>
              <p className="text-[11px] text-textSecondary mt-1 leading-normal">
                Recover deleted courses, modules, or lessons. Items are temporarily stored with coordinates.
              </p>
            </div>

            {/* Alert banner in modal */}
            {alertMessage && (
              <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs font-semibold text-textPrimary text-left">
                {alertMessage}
              </div>
            )}

            {/* Trash items list */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 min-h-[250px]">
              {trashItems.map((item) => {
                let TypeIcon = Layers;
                if (item.type === "module") TypeIcon = FolderKanban;
                if (item.type === "lesson") TypeIcon = BookOpen;

                return (
                  <div
                    key={item.id}
                    className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-left"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                        <TypeIcon className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-extrabold text-textPrimary truncate">{item.title}</span>
                        <div className="flex items-center gap-2 flex-wrap text-[10px] text-textTertiary mt-1 font-mono uppercase font-bold">
                          <span className="text-purple-400">Type: {item.type}</span>
                          <span>•</span>
                          <span>Deleted: {new Date(item.deletedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleRestoreItem(item)}
                        className="px-3.5 py-1.5 bg-gradient-brand text-white text-[10px] font-bold rounded-lg hover:shadow-glow-purple transition-all"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => handlePurgeItem(item.id)}
                        className="p-1.5 border border-red-500/10 bg-red-500/[0.02] hover:bg-red-500/[0.06] text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {trashItems.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center py-16 text-textTertiary border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                  <Trash2 className="w-10 h-10 opacity-20 mb-2" />
                  <p className="text-xs">Recycle Bin is empty.</p>
                  <p className="text-[10px] mt-0.5">Deleted items will temporarily appear here for restoration.</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      )}

    </div>
  );
}
