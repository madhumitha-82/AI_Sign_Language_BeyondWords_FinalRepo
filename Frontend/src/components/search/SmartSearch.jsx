import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Book, HelpCircle, FileText, X, CornerDownLeft, Clock, Award } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { learningApi } from "../../lib/api";

// Levenshtein edit distance calculator for spelling mistakes
function getEditDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}



// Combined modern search engine matching algorithm
function isFuzzyMatch(query, item) {
  const q = query.toLowerCase().trim();
  if (!q) return false;

  const titleLower = item.title.toLowerCase();
  const subtitleLower = item.subtitle.toLowerCase();
  const typeLower = item.type.toLowerCase();
  const textContent = (item.searchContent || "").toLowerCase();

  // 1. Direct match (for single chars, only match if it starts with the char)
  if (q.length === 1) {
    if (
      titleLower.startsWith(q) ||
      typeLower.startsWith(q)
    ) {
      return true;
    }
    return false;
  }

  // 2. Direct match anywhere (highest relevance)
  if (
    titleLower.includes(q) ||
    subtitleLower.includes(q) ||
    typeLower.includes(q) ||
    textContent.includes(q)
  ) {
    return true;
  }

  // 2. Prevent excessive noise for very short single/double character inputs
  if (q.length <= 2) return false;



  // 4. Word-level edit distance (fuzzy spelling errors / extra letters)
  const allWords = `${titleLower} ${subtitleLower} ${typeLower}`.split(/[\s—\-_]+/);
  for (const word of allWords) {
    if (word.length <= 2) continue;
    // Allow 1 mistake for short queries, 2 for longer ones
    const maxDistance = q.length <= 5 ? 1 : 2;
    const dist = getEditDistance(q, word);
    if (dist <= maxDistance) {
      return true;
    }
  }

  return false;
}

export function SmartSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [showOnlyStartsWithQuery, setShowOnlyStartsWithQuery] = useState(false);
  const navigate = useNavigate();
  const { state, addSearch, removeSearch, t } = useApp();
  const inputRef = useRef(null);

  const [serverCourses, setServerCourses] = useState([]);
  const [serverQuizzes, setServerQuizzes] = useState([]);

  useEffect(() => {
    // Fetch real data for search index
    learningApi.get("/api/courses").then(res => setServerCourses(res.data)).catch(() => {});
    learningApi.get("/api/quizzes/categories").then(res => setServerQuizzes(res.data)).catch(() => {});
  }, []);

  // Reset query and focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Generate lists of search candidates
  const candidates = React.useMemo(() => {
    const list = [];

    // Backend Courses -> Modules -> Lessons
    serverCourses.forEach((course) => {
      if (course.modules) {
        course.modules.forEach((mod) => {
          list.push({
            type: "Module",
            title: mod.title,
            subtitle: `In Course: ${course.title}`,
            url: `/learn/syllabus`,
            icon: <Book className="w-4 h-4 text-indigo-400" />,
            searchContent: `${mod.title} module syllabus learning path course`,
          });

          if (mod.lessons) {
            mod.lessons.forEach((les) => {
              list.push({
                type: "Lesson",
                title: les.title,
                subtitle: `In: ${mod.title}`,
                url: `/learn/syllabus`,
                icon: <FileText className="w-4 h-4 text-emerald-400" />,
                searchContent: `${les.title} lesson study vocabulary asl`,
              });
            });
          }
        });
      }
    });

    // Backend Quiz Categories -> Levels
    serverQuizzes.forEach((cat) => {
      list.push({
        type: "Quiz Category",
        title: cat.name,
        subtitle: "Practice quizzes",
        url: `/practice/quiz`,
        icon: <HelpCircle className="w-4 h-4 text-amber-400" />,
        searchContent: `${cat.name} quiz test practice`,
      });
      if (cat.levels) {
        cat.levels.forEach((lvl) => {
          list.push({
            type: "Quiz Level",
            title: lvl.title || `Level ${lvl.levelOrder}`,
            subtitle: `In: ${cat.name}`,
            url: `/practice/quiz`,
            icon: <Award className="w-4 h-4 text-orange-400" />,
            searchContent: `${lvl.title} quiz level test practice`,
          });
        });
      }
    });



    return list;
  }, [serverCourses, serverQuizzes]);

  // Filter items based on query
  const filteredResults = React.useMemo(() => {
    if (!query) return [];
    if (showOnlyStartsWithQuery) {
      const lower = query.toLowerCase().trim();
      return candidates.filter((item) =>
        item.title.toLowerCase().startsWith(lower)
      );
    }
    return candidates.filter((item) => isFuzzyMatch(query, item));
  }, [query, candidates, showOnlyStartsWithQuery]);

  const handleSelect = (url, searchTitle) => {
    addSearch(searchTitle);
    onClose();
    navigate(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-xl bg-bgSecondary/95 border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.6)] rounded-2xl overflow-hidden backdrop-blur-2xl z-10 flex flex-col max-h-[70vh]"
          >
            {/* Input Row */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.08] bg-white/[0.02]">
              <Search className="w-5 h-5 text-textSecondary shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuery(val);
                  if (val !== query) {
                    setShowOnlyStartsWithQuery(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActiveIndex((prev) => Math.min(prev + 1, filteredResults.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveIndex((prev) => Math.max(prev - 1, 0));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    setShowOnlyStartsWithQuery(true);
                  }
                }}
                placeholder={t("searchPlaceholder")}
                className="w-full bg-transparent border-0 outline-none text-textPrimary text-base placeholder-textTertiary"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setShowOnlyStartsWithQuery(false);
                  }}
                  className="p-1 hover:bg-white/10 rounded-lg text-textSecondary hover:text-textPrimary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="px-2 py-0.5 border border-white/15 bg-white/[0.03] text-[10px] rounded text-textTertiary uppercase font-semibold font-mono tracking-wider shrink-0 select-none">
                esc
              </div>
            </div>

            {/* Results Scroll Area */}
            <div className="flex-1 overflow-y-auto p-2">
              {/* Empty state: Recent Searches */}
              {!query && (
                <div className="flex flex-col">
                  {state.history.searches && state.history.searches.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-textTertiary uppercase tracking-wider">
                        <span>Recent Searches</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {state.history.searches.map((search, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between group px-3 py-2 hover:bg-white/[0.04] rounded-xl transition-all duration-200 cursor-pointer"
                            onClick={() => {
                              setQuery(search);
                              setShowOnlyStartsWithQuery(false);
                              inputRef.current?.focus();
                            }}
                          >
                            <div className="flex items-center gap-3 text-textSecondary">
                              <Clock className="w-4 h-4 text-textTertiary group-hover:text-textPrimary" />
                              <span className="text-sm group-hover:text-textPrimary">{search}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSearch(search);
                              }}
                              className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg text-textTertiary hover:text-textPrimary transition-all duration-200"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-textTertiary">
                      <Search className="w-8 h-8 opacity-20 mb-2" />
                      <p className="text-sm">Type a search query to search across topics.</p>
                      <p className="text-xs mt-1">Search for "foundations", "ASL", or "quiz".</p>
                    </div>
                  )}
                </div>
              )}

              {/* Matching Results */}
              {query && filteredResults.length > 0 && (
                <div className="flex flex-col gap-1">
                  <div className="px-3 py-1.5 text-xs font-semibold text-textTertiary uppercase tracking-wider">
                    Search Results ({filteredResults.length})
                  </div>
                  {filteredResults.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelect(item.url, item.title)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group ${
                        idx === activeIndex
                          ? "bg-white/[0.06] border-l-2 border-purple-500 pl-2.5"
                          : "hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/[0.04] border border-white/[0.06] rounded-lg shrink-0">
                          {item.icon}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-textPrimary group-hover:text-textAccent transition-colors">
                            {item.title}
                          </span>
                          <span className="text-xs text-textSecondary">{item.subtitle}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-textTertiary bg-white/[0.03] border border-white/10 px-1.5 py-0.5 rounded uppercase">
                          {item.type}
                        </span>
                        <CornerDownLeft className={`w-3.5 h-3.5 text-textTertiary transition-opacity ${
                          idx === activeIndex ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No matching results */}
              {query && filteredResults.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-textTertiary">
                  <Search className="w-8 h-8 opacity-20 mb-2" />
                  <p className="text-sm">No results found for "{query}"</p>
                  <p className="text-xs mt-1">Try another search term or click ESC to cancel.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-white/[0.01] border-t border-white/[0.06] text-[10px] text-textTertiary flex items-center justify-between select-none font-mono">
              <div className="flex items-center gap-4">
                <span>⚡ Navigate: <span className="text-textSecondary">↑↓</span></span>
                <span>Select: <span className="text-textSecondary">Enter</span></span>
              </div>
              <div>BeyondWords SmartSearch</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
