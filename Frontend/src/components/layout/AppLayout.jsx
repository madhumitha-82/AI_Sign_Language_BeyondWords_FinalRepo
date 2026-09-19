import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { SmartSearch } from "../search/SmartSearch";

export function AppLayout() {
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Ctrl+K keydown handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex w-screen h-screen bg-bgPrimary overflow-hidden text-textPrimary relative">
      {/* Decorative radial glows */}
      <div className="absolute top-[20%] left-[30%] w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-indigo-500/3 blur-[100px] pointer-events-none z-0" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <Topbar onOpenSearch={() => setSearchOpen(true)} />

        {/* Scrollable Page Outlet */}
        <main className="flex-grow overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Global Command/Smart Search Palette */}
      <SmartSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
