import React, { useMemo, useState } from "react";
import { useApp } from "../../context/AppContext";

export function ActivityHeatmap({ data }) {
  const { state } = useApp();
  const heatmapData = data || state.heatmap || {};
  const [hoveredCell, setHoveredCell] = useState(null);

  // Generate date array for 52 weeks (364 days) ending today
  const { grid, months } = useMemo(() => {
    const today = new Date();
    // Start from 52 weeks ago (364 days), adjusted to start on Sunday
    const startOffset = 364 + today.getDay(); // 364 days + whatever offsets us to Sunday
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - startOffset);

    const tempGrid = [];
    const tempMonths = [];
    let currentMonth = "";

    // Loop through 53 weeks (to cover full 52 weeks plus partial start/end)
    for (let w = 0; w < 53; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + w * 7 + d);
        
        // Stop if we exceed today's date
        if (currentDate > today) {
          week.push(null);
          continue;
        }

        const dateStr = currentDate.toISOString().split("T")[0];
        const count = heatmapData[dateStr] || 0;

        // Collect month labels for the top axis
        if (d === 0) {
          const monthLabel = currentDate.toLocaleString("default", { month: "short" });
          if (monthLabel !== currentMonth) {
            tempMonths.push({ index: w, label: monthLabel });
            currentMonth = monthLabel;
          }
        }

        week.push({
          date: currentDate,
          dateStr,
          count,
        });
      }
      tempGrid.push(week);
    }

    return { grid: tempGrid, months: tempMonths };
  }, [heatmapData]);

  // Color mapping based on intensity
  const getCellColor = (count) => {
    if (count === 0) return "bg-white/[0.02] border-white/[0.04]";
    if (count === 1) return "bg-purple-900/30 border-purple-800/20";
    if (count === 2) return "bg-purple-700/50 border-purple-600/30";
    if (count === 3) return "bg-purple-500/75 border-purple-400/40";
    return "bg-purple-400 border-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.4)]";
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("default", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="w-full overflow-x-auto select-none py-2">
      <div className="min-w-[680px] flex flex-col gap-1.5 p-2">
        {/* Month Header Row */}
        <div className="flex text-[10px] text-textTertiary h-4 relative">
          <div className="w-8 shrink-0" /> {/* Spacer for Y axis labels */}
          <div className="flex-1 flex relative">
            {months.map((m, idx) => (
              <span
                key={idx}
                className="absolute"
                style={{ left: `${(m.index / grid.length) * 100}%` }}
              >
                {m.label}
              </span>
            ))}
          </div>
        </div>

        {/* Heatmap Grid Row */}
        <div className="flex gap-2 relative">
          {/* Day of Week Labels (Y Axis) */}
          <div className="flex flex-col justify-between text-[10px] text-textTertiary w-8 pr-2 pt-1 py-1 text-right shrink-0">
            <span>Sun</span>
            <span>Tue</span>
            <span>Thu</span>
            <span>Sat</span>
          </div>

          {/* Grid of Columns */}
          <div className="flex-1 flex gap-[3px]">
            {grid.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-[3px] flex-1">
                {week.map((cell, dIdx) => {
                  if (!cell) {
                    return <div key={dIdx} className="w-[10px] h-[10px] bg-transparent border border-transparent rounded-[2px]" />;
                  }
                  return (
                    <div
                      key={dIdx}
                      className={`w-[10px] h-[10px] border rounded-[2px] cursor-pointer transition-colors duration-200 ${getCellColor(
                        cell.count
                      )}`}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredCell({
                          ...cell,
                          x: rect.left + window.scrollX + 6,
                          y: rect.top + window.scrollY - 34,
                        });
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-end items-center gap-1.5 mt-2 text-[10px] text-textTertiary">
          <span>Less</span>
          <div className="w-[10px] h-[10px] bg-white/[0.02] border border-white/[0.04] rounded-[2px]" />
          <div className="w-[10px] h-[10px] bg-purple-900/30 border border-purple-800/20 rounded-[2px]" />
          <div className="w-[10px] h-[10px] bg-purple-700/50 border border-purple-600/30 rounded-[2px]" />
          <div className="w-[10px] h-[10px] bg-purple-500/75 border border-purple-400/40 rounded-[2px]" />
          <div className="w-[10px] h-[10px] bg-purple-400 border border-purple-300 rounded-[2px]" />
          <span>More</span>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 px-2.5 py-1 bg-bgTertiary border border-white/[0.08] shadow-[0_4px_12px_rgba(0,0,0,0.5)] rounded-lg text-[11px] text-textPrimary pointer-events-none transform -translate-x-1/2 flex flex-col items-center"
          style={{ left: hoveredCell.x, top: hoveredCell.y }}
        >
          <span className="font-semibold">{hoveredCell.count} actions</span>
          <span className="text-[10px] text-textSecondary">{formatDate(hoveredCell.date)}</span>
          <div className="w-1.5 h-1.5 bg-bgTertiary border-r border-b border-white/[0.08] transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
        </div>
      )}
    </div>
  );
}
