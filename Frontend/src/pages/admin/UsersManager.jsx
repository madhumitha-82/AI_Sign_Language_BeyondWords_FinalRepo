import React, { useState, useMemo, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, User, Calendar, ShieldCheck, Eye, RotateCcw, AlertTriangle, X, Award, Flame, Target } from "lucide-react";
import { GlassCard } from "../../components/shared/GlassCard";
import { useApp } from "../../context/AppContext";
import { userApi } from "../../lib/api";

export function UsersManager() {
  const { state } = useApp();
  const [search, setSearch] = useState("");
  const [currentFilter, setCurrentFilter] = useState("all"); // "all" | "active" | "suspended" | "new"
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;

  // Modal view states
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [resetConfirmTarget, setResetConfirmTarget] = useState(null);

  // Load suspended users from API
  const [apiUsers, setApiUsers] = useState([]);
  const [suspendedEmails, setSuspendedEmails] = useState([]);

  useEffect(() => {
    userApi.get("/api/admin/users")
      .then(res => {
        if (Array.isArray(res.data)) {
           setApiUsers(res.data);
           const suspended = res.data.filter(u => u.status === "Suspended").map(u => u.email);
           if (suspended.length) setSuspendedEmails(suspended);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Hydrate user list with api data and the active session student
  const users = useMemo(() => {
    const list = apiUsers.map((u) => {
      const email = u.email;
      const isSuspended = suspendedEmails.includes(email) || u.status === "Suspended";
      
      // Determine if new user within 7 days
      const joinDate = new Date(u.createdAt || u.joined || Date.now());
      const now = new Date();
      const diffTime = Math.abs(now - joinDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const isNew = diffDays <= 7;

      return {
        id: u.id,
        name: u.fullName || "Unknown User",
        email,
        level: u.level || Math.floor((u.xp || 0) / 1000) + 1,
        xp: u.xp || 0,
        streak: u.streak || 0,
        accuracy: u.accuracy || 0,
        joined: joinDate.toISOString().split('T')[0],
        status: isSuspended ? "Suspended" : "Active",
        isNew,
        isSelf: state.user && state.user.email === email
      };
    });

    return list;
  }, [apiUsers, suspendedEmails, state.user]);

  // Summary Metrics Row
  const totalCount = users.length;
  const suspendedCount = suspendedEmails.length;
  const activeCount = totalCount - suspendedCount;
  const newCount = users.filter(u => u.isNew).length;

  // Filtered list
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      if (currentFilter === "active") return u.status === "Active";
      if (currentFilter === "suspended") return u.status === "Suspended";
      if (currentFilter === "new") return u.isNew;
      return true;
    });
  }, [users, search, currentFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(startIndex, startIndex + usersPerPage);
  }, [filteredUsers, startIndex]);

  const handleSuspendToggle = async (user) => {
    let nextList;
    const isSuspending = !suspendedEmails.includes(user.email);
    if (isSuspending) {
      nextList = [...suspendedEmails, user.email];
    } else {
      nextList = suspendedEmails.filter(e => e !== user.email);
    }
    
    try {
      await userApi.put(`/api/admin/users/${user.id}/suspend`, { suspended: isSuspending });
      setSuspendedEmails(nextList);
    } catch (err) {
      console.error(err);
      // Optimistic update fallback or revert could go here
      setSuspendedEmails(nextList);
    }
  };

  const handleResetProgress = async (user) => {
    try {
      await userApi.post(`/api/admin/users/${user.id}/reset-progress`);
      if (user.isSelf) {
        // Clear logged in student progress
        const defaultState = {
          ...state,
          progress: {
            completedLessons: [],
            quizScores: {},
            achievements: []
          }
        };
        localStorage.setItem("beyondwords_app_state", JSON.stringify(defaultState));
      }
      setResetConfirmTarget(null);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-textPrimary select-none">
      
      {/* Header and Summary Row */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-textPrimary">Users Manager</h2>
          <p className="text-xs text-textTertiary mt-1 font-semibold">
            Track student progress, reset progress data, and toggle account suspension
          </p>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono">
          <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex flex-col justify-center">
            <span className="text-[9px] text-textTertiary uppercase">Total Users</span>
            <span className="text-base font-black text-textPrimary mt-0.5">{totalCount}</span>
          </div>
          <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex flex-col justify-center">
            <span className="text-[9px] text-textTertiary uppercase">Active Students</span>
            <span className="text-base font-black text-emerald-400 mt-0.5">{activeCount}</span>
          </div>
          <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex flex-col justify-center">
            <span className="text-[9px] text-textTertiary uppercase">Suspended</span>
            <span className="text-base font-black text-red-400 mt-0.5">{suspendedCount}</span>
          </div>
          <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex flex-col justify-center">
            <span className="text-[9px] text-textTertiary uppercase">New (7 Days)</span>
            <span className="text-base font-black text-purple-400 mt-0.5">+{newCount}</span>
          </div>
        </div>
      </div>

      {/* Search and Filters panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-white/[0.04] pt-4">
        {/* Search Bar Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textTertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search students by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-bgSecondary border border-glassBorder rounded-xl text-xs text-textPrimary placeholder-textTertiary focus:outline-none focus:border-purple-500/40 transition-all font-semibold"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex gap-1.5 p-1 bg-white/[0.02] border border-white/[0.06] rounded-xl self-start">
          {["all", "active", "suspended", "new"].map((filter) => (
            <button
              key={filter}
              onClick={() => { setCurrentFilter(filter); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                currentFilter === filter ? "bg-gradient-brand text-white shadow" : "text-textSecondary hover:text-textPrimary"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <GlassCard className="p-4 md:p-6 overflow-hidden border-white/[0.08]">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] font-bold text-textTertiary uppercase tracking-wider">
                <th className="pb-3 pl-3">Student</th>
                <th className="pb-3 text-center">Level</th>
                <th className="pb-3 text-right">XP Earned</th>
                <th className="pb-3 text-center">Streak</th>
                <th className="pb-3 text-center">Accuracy</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-right pr-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {paginatedUsers.map((u) => (
                <tr key={u.id} className="transition-all hover:bg-white/[0.02]">
                  {/* Name and Avatar */}
                  <td className="py-3.5 pl-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8.5 h-8.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center font-mono">
                        {u.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-textPrimary truncate">{u.name}</span>
                        <span className="text-[10px] text-textTertiary truncate mt-0.5">{u.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 text-center font-mono font-bold text-textSecondary">
                    Lvl {u.level}
                  </td>

                  <td className="py-3.5 text-right font-mono font-bold text-purple-400">
                    +{u.xp.toLocaleString()} XP
                  </td>

                  <td className="py-3.5 text-center font-mono font-bold text-amber-400">
                    🔥 {u.streak}d
                  </td>

                  <td className="py-3.5 text-center font-mono font-bold text-emerald-400">
                    🎯 {u.accuracy}%
                  </td>

                  <td className="py-3.5 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      u.status === "Active" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"
                    }`}>
                      {u.status}
                    </span>
                  </td>

                  <td className="py-3.5 text-right pr-3">
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => { setSelectedUser(u); setIsDetailModalOpen(true); }}
                        className="p-1.5 border border-white/[0.06] hover:bg-white/10 text-textSecondary hover:text-textPrimary rounded-lg"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setResetConfirmTarget(u)}
                        className="p-1.5 border border-white/[0.06] hover:bg-white/10 text-textSecondary hover:text-textPrimary rounded-lg"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                      <button
                        onClick={() => handleSuspendToggle(u)}
                        className={`px-2 py-1 border rounded-lg text-[9px] font-bold uppercase transition-all ${
                          u.status === "Active" 
                            ? "border-red-500/10 bg-red-500/[0.01] text-red-400 hover:bg-red-500/[0.06]" 
                            : "border-emerald-500/10 bg-emerald-500/[0.01] text-emerald-400 hover:bg-emerald-500/[0.06]"
                        }`}
                      >
                        {u.status === "Active" ? "Suspend" : "Unsuspend"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-textTertiary font-semibold">
                    No matching users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 mt-4">
            <span className="text-[10px] font-mono text-textTertiary font-bold uppercase">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                className="p-2 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] text-textSecondary disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                className="p-2 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] text-textSecondary disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* User Detail Modal */}
      {isDetailModalOpen && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-6 border-white/[0.08] shadow-2xl relative">
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-white/10 text-textSecondary rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center gap-4 text-center border-b border-white/[0.06] pb-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-2xl font-bold flex items-center justify-center font-mono filter drop-shadow">
                {selectedUser.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <h3 className="text-base font-extrabold text-textPrimary leading-none">{selectedUser.name}</h3>
                <span className="text-[10px] text-textTertiary font-semibold mt-1">{selectedUser.email}</span>
                <span className="text-[9px] font-mono font-bold text-purple-400 mt-2 uppercase">Joined: {selectedUser.joined}</span>
              </div>
            </div>

            {/* Profile Info grids */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold">
              <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex flex-col">
                <span className="text-[8px] text-textTertiary uppercase">Lessons completed</span>
                <span className="text-textPrimary mt-1">14</span>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex flex-col">
                <span className="text-[8px] text-textTertiary uppercase">Quizzes Passed</span>
                <span className="text-textPrimary mt-1">6</span>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex flex-col">
                <span className="text-[8px] text-textTertiary uppercase">Acc. average</span>
                <span className="text-emerald-400 mt-1">{selectedUser.accuracy}%</span>
              </div>
            </div>

            {/* Recent Activity summary list */}
            <div className="flex flex-col gap-2 mt-4 text-left">
              <span className="text-[10px] font-bold text-textSecondary uppercase">Recent Activity</span>
              <div className="flex flex-col gap-1.5 text-[10px] font-semibold text-textSecondary">
                <div className="p-2 bg-white/[0.01] border border-white/[0.03] rounded-lg">
                  Passed Alphabets Quiz Level 1 — score: 6/7 (Accuracy: 85%)
                </div>
                <div className="p-2 bg-white/[0.01] border border-white/[0.03] rounded-lg">
                  Completed Lesson 3: Sign Language Hand Movements
                </div>
              </div>
            </div>

            {/* Badges list */}
            <div className="flex flex-col gap-2 mt-4 text-left border-t border-white/[0.06] pt-3">
              <span className="text-[10px] font-bold text-textSecondary uppercase">Earned Badges</span>
              <div className="flex gap-2 flex-wrap">
                <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-[9px] font-bold uppercase font-mono">
                  🎖️ Dedicated
                </span>
                <span className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-[9px] font-bold uppercase font-mono">
                  🎯 Precision
                </span>
                <span className="px-2 py-1 bg-slate-500/10 border border-slate-500/20 text-slate-400 rounded-lg text-[9px] font-bold uppercase font-mono">
                  🗣️ Explorer
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Reset progress Confirmation Modal */}
      {resetConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm relative z-10">
            <GlassCard className="p-6 bg-bgSecondary border-glassBorder shadow-2xl text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-textPrimary">Reset Student Progress?</h3>
                <p className="text-xs text-textTertiary mt-1 font-semibold leading-relaxed">
                  Are you sure you want to reset all lesson progression, star achievements, and scores for "{resetConfirmTarget.name}"?
                </p>
              </div>
              <div className="flex w-full gap-3 mt-2">
                <button
                  onClick={() => setResetConfirmTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-xs font-bold text-textSecondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleResetProgress(resetConfirmTarget)}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-500 text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all"
                >
                  Confirm Reset
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

    </div>
  );
}
