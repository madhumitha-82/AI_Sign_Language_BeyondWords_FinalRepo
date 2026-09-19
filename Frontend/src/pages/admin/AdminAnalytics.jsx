import React, { useState, useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Users, BookOpen, FileQuestion, Target, Clock, TrendingUp, Calendar, ArrowUpDown, ChevronDown, AlertCircle } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { GlassCard } from "../../components/shared/GlassCard";
import { StatCard } from "../../components/shared/StatCard";

export function AdminAnalytics() {
  const { state } = useApp();
  const modules = state.modules || [];

  // Sorting / Expand states
  const [sortField, setSortField] = useState("completions");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showAllRows, setShowAllRows] = useState(false);

  // 1. Overview stats mock/computed calculations
  const [totalCompletionsAllTime, setTotalCompletionsAllTime] = useState(0);
  const globalAverageAccuracy = 0;
  const [mostActiveDay, setMostActiveDay] = useState("N/A");
  const avgSessionDuration = "0m 0s";

  // 2. Line Chart: Daily Active Users (Last 30 Days)
  const [dauData, setDauData] = useState([]);

  // 3. Bar Chart: Lesson Completions by Module
  const [completionsData, setCompletionsData] = useState([]);

  // 4. Grouped Bar Chart: Quiz Pass vs Fail Rate by Category
  const quizPassFailData = [];

  // 5. Area Chart: New User Signups (Last 12 Weeks)
  const weeklySignupsData = [];

  // 6. Content Performance Table Data
  const [performanceRows, setPerformanceRows] = useState([]);

  React.useEffect(() => {
    import("../../lib/api").then(({ analyticsApi }) => {
      analyticsApi.get("/api/admin/analytics/daily-active-users").then(res => setDauData(Array.isArray(res.data) ? res.data : [])).catch(console.error);
      analyticsApi.get("/api/admin/analytics/peak-active-day").then(res => setMostActiveDay(res.data?.peakDay || "N/A")).catch(console.error);
      analyticsApi.get("/api/admin/analytics/lesson-completions").then(res => setCompletionsData(Array.isArray(res.data) ? res.data : [])).catch(console.error);
      analyticsApi.get("/api/admin/analytics/content-performance").then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setPerformanceRows(data);
        const total = data.reduce((sum, row) => sum + (row.completions || 0), 0);
        setTotalCompletionsAllTime(total);
      }).catch(console.error);
    });
  }, []);

  // Sort rows logic
  const sortedPerformanceRows = useMemo(() => {
    return [...performanceRows].sort((a, b) => {
      let valA = a[sortField] !== undefined ? a[sortField] : 0;
      let valB = b[sortField] !== undefined ? b[sortField] : 0;
      if (typeof valA === "string") {
        return sortOrder === "asc" ? valA.localeCompare(valB || "") : (valB || "").localeCompare(valA);
      }
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });
  }, [performanceRows, sortField, sortOrder]);

  const displayedRows = showAllRows ? sortedPerformanceRows : sortedPerformanceRows.slice(0, 5);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(p => p === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="flex flex-col gap-6 text-textPrimary select-none">
      
      {/* Header Panel */}
      <div>
        <h2 className="text-xl font-extrabold text-textPrimary">Platform Analytics</h2>
        <p className="text-xs text-textTertiary mt-1 font-semibold">
          Overview of platform activity, course completions, and performance statistics
        </p>
      </div>

      {/* Section 1: Overview stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="All-Time Completions"
          value={totalCompletionsAllTime.toLocaleString()}
          icon={<BookOpen className="w-5 h-5 text-indigo-400" />}
          description="Total lesson completions logged"
          className="shadow-md"
        />
        <StatCard
          title="Global Accuracy"
          value={`${globalAverageAccuracy}%`}
          icon={<Target className="w-5 h-5 text-emerald-400" />}
          description="Average score across all students"
          className="shadow-md"
        />
        <StatCard
          title="Peak Active Day"
          value={mostActiveDay}
          icon={<Calendar className="w-5 h-5 text-purple-400" />}
          description="Day with highest student logins"
          className="shadow-md"
        />
        <StatCard
          title="Avg Session Length"
          value={avgSessionDuration}
          icon={<Clock className="w-5 h-5 text-cyan-400" />}
          description="Mean duration of active study"
          className="shadow-md"
        />
      </div>

      {/* Section 2: Charts Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Active Users Line Chart */}
        <GlassCard className="p-5 flex flex-col gap-4 border-white/[0.08]">
          <h3 className="text-xs font-extrabold text-textPrimary flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            Daily Active Users (Last 30 Days)
          </h3>
          <div className="h-60 w-full mt-2 font-mono text-[9px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dauData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#111122", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                <Line type="monotone" dataKey="Active Users" stroke="#a78bfa" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Lesson Completions by Module Bar Chart */}
        <GlassCard className="p-5 flex flex-col gap-4 border-white/[0.08]">
          <h3 className="text-xs font-extrabold text-textPrimary flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Lesson Completions by Module
          </h3>
          <div className="h-60 w-full mt-2 font-mono text-[9px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completionsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#111122", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                <Bar dataKey="Completions" fill="#22d3ee" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Quiz Pass vs Fail Rate by Category Grouped Bar Chart */}
        <GlassCard className="p-5 flex flex-col gap-4 border-white/[0.08]">
          <h3 className="text-xs font-extrabold text-textPrimary flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            Quiz Pass vs Fail Rate by Category
          </h3>
          <div className="h-60 w-full mt-2 font-mono text-[9px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quizPassFailData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#111122", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
                <Bar dataKey="Pass" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="Fail" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Area Chart: New User Signups */}
        <GlassCard className="p-5 flex flex-col gap-4 border-white/[0.08]">
          <h3 className="text-xs font-extrabold text-textPrimary flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            New User Signups (Last 12 Weeks)
          </h3>
          <div className="h-60 w-full mt-2 font-mono text-[9px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklySignupsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="week" stroke="rgba(255,255,255,0.3)" tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#111122", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                <defs>
                  <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="Signups" stroke="#6366f1" fillOpacity={1} fill="url(#signupGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Section 3: Content Performance Table */}
      <GlassCard className="p-5 flex flex-col gap-4 border-white/[0.08] overflow-hidden">
        <h3 className="text-xs font-extrabold text-textPrimary uppercase tracking-wider">Content Performance metrics</h3>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] text-[9.5px] font-bold text-textTertiary uppercase tracking-wider font-mono">
                <th className="pb-3 pl-2">Content Name</th>
                <th className="pb-3 text-center">Type</th>
                <th className="pb-3 text-right cursor-pointer" onClick={() => toggleSort("views")}>
                  Views <ArrowUpDown className="inline w-3 h-3 ml-0.5" />
                </th>
                <th className="pb-3 text-right cursor-pointer" onClick={() => toggleSort("completions")}>
                  Completions <ArrowUpDown className="inline w-3 h-3 ml-0.5" />
                </th>
                <th className="pb-3 text-right cursor-pointer" onClick={() => toggleSort("rate")}>
                  Completion % <ArrowUpDown className="inline w-3 h-3 ml-0.5" />
                </th>
                <th className="pb-3 text-right pr-2">Avg Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-[11px] font-semibold">
              {displayedRows.map((r, idx) => (
                <tr key={idx} className="transition-all hover:bg-white/[0.02]">
                  <td className="py-3 pl-2 text-textPrimary truncate max-w-[200px]">{r.name || `Lesson ${r.lessonId}`}</td>
                  <td className="py-3 text-center font-mono text-[9px] text-textTertiary">{r.type || "Content"}</td>
                  <td className="py-3 text-right font-mono">{(r.views || 0).toLocaleString()}</td>
                  <td className="py-3 text-right font-mono">{(r.completions || 0).toLocaleString()}</td>
                  <td className="py-3 text-right font-mono text-cyan-400">{r.rate || 0}%</td>
                  <td className="py-3 text-right pr-2 font-mono text-purple-400">
                    {r.score ? `${r.score}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={() => setShowAllRows(!showAllRows)}
          className="self-center py-2 px-6 border border-white/[0.06] hover:bg-white/[0.03] rounded-xl text-[10px] font-bold uppercase transition-all"
        >
          {showAllRows ? "Collapse Rows" : "View All Performance Rows"}
        </button>
      </GlassCard>

      {/* Section 4: Weakest Topics Panel */}
      <GlassCard className="p-5 border-white/[0.08] flex flex-col gap-4">
        <h3 className="text-xs font-extrabold text-textPrimary uppercase tracking-wider">Diagnostic Area — Weakest Practice Topics</h3>
        
        <div className="flex flex-col gap-3">
          {[
            { topic: "Numbers Category Quiz", rate: 42, color: "text-red-400 border-red-500/20 bg-red-500/[0.02]" },
            { topic: "Daily Life Quiz Level 2", rate: 58, color: "text-amber-400 border-amber-500/20 bg-amber-500/[0.02]" },
            { topic: "Food & Drinks Quiz Level 1", rate: 71, color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.02]" }
          ].map((t, idx) => (
            <div key={idx} className={`p-4 border rounded-2xl flex items-center justify-between gap-4 ${t.color}`}>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-xs text-textPrimary">{t.topic}</span>
                <span className="text-[10px] text-textTertiary mt-0.5 font-semibold">Rank #{idx + 1} Low Accuracy Diagnostic</span>
              </div>
              <span className="text-sm font-black font-mono">{t.rate}% Pass</span>
            </div>
          ))}
        </div>

        <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-start gap-3 mt-1.5">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-textPrimary">Admin Insight Alert</span>
            <p className="text-[10px] text-textSecondary mt-0.5 leading-relaxed">
              Numbers category has a 42% pass rate — consider adding easier Level 1 content or reviewing question illustration clarity.
            </p>
          </div>
        </div>
      </GlassCard>

    </div>
  );
}
