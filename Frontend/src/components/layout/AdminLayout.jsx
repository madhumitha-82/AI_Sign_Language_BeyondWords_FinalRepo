import React, { useEffect } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  Home,
  FolderKanban, 
  BookOpen, 
  FileQuestion, 
  Megaphone,
  Award,
  Users, 
  BarChart3, 
  Settings,
  LogOut, 
  ShieldAlert,
  ArrowLeft
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export function AdminLayout() {
  const { t } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminLoggedIn = sessionStorage.getItem("admin_session") === "true";

  // Check admin session
  useEffect(() => {
    if (!isAdminLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [isAdminLoggedIn, navigate]);

  const handleExitAdmin = () => {
    sessionStorage.removeItem("admin_session");
    navigate("/", { replace: true });
  };

  if (!isAdminLoggedIn) {
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    { label: "Dashboard", path: "/admin", icon: Home },
    { label: "Course Manager", path: "/admin/modules", icon: FolderKanban },
    { label: "Practice Quizzes", path: "/admin/quizzes", icon: FileQuestion },
    { label: "Announcements", path: "/admin/announcements", icon: Megaphone },
    { label: "Badges", path: "/admin/badges", icon: Award },
    { label: "Users", path: "/admin/users", icon: Users },
    { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { label: "Settings", path: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-bgPrimary text-textPrimary overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-glassBorder bg-bgSecondary/60 backdrop-blur-xl flex flex-col justify-between select-none shrink-0 z-30">
        <div className="flex flex-col gap-6 p-6">
          {/* Header Panel Logo */}
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-wider text-textPrimary uppercase">Admin Panel</span>
              <span className="text-[9px] text-purple-400 font-bold font-mono tracking-wide mt-0.5">Website Controls</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-brand text-white shadow-glow-purple"
                      : "text-textSecondary hover:text-textPrimary hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Exit Panel */}
        <div className="p-4 border-t border-white/[0.06] bg-white/[0.01]">
          <button
            onClick={handleExitAdmin}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] border border-red-500/10 hover:border-red-500/20 transition-all duration-200"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Exit Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Scrollable Area */}
      <main className="flex-1 overflow-y-auto bg-bgPrimary p-6 md:p-8">
        {/* Simple back navigation link to easily double check layout */}
        <div className="mb-4">
          <button 
            onClick={handleExitAdmin}
            className="flex items-center gap-1.5 text-xs text-textTertiary hover:text-textSecondary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to User Dashboard
          </button>
        </div>

        {/* Content Outlet */}
        <Outlet />
      </main>
    </div>
  );
}
