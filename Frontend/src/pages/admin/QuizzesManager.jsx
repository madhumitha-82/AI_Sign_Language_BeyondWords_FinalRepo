import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, AlertTriangle, FileQuestion, HelpCircle, Save, ArrowLeft, Layers, Lock, Unlock } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { GlassCard } from "../../components/shared/GlassCard";
import { GradientBadge } from "../../components/shared/GradientBadge";
import { cn } from "../../lib/utils";
import { learningApi } from "../../lib/api";

export function QuizzesManager() {
  const { state, updateQuizCategories } = useApp();
  const [quizCategories, setQuizCategories] = useState([]);

  useEffect(() => {
    learningApi.get("/api/quizzes/categories")
      .then(res => setQuizCategories(res.data || []))
      .catch(err => console.error(err));
  }, []);

  // Navigation / View states
  // "categories" | "levels" | "questions"
  const [currentView, setCurrentView] = useState("categories");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);

  // Category modal / form states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catIcon, setCatIcon] = useState("🔤");
  const [catDescription, setCatDescription] = useState("");

  // Level modal / form states
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [lvlTitle, setLvlTitle] = useState("");
  const [lvlDifficulty, setLvlDifficulty] = useState("Easy");
  const [lvlXp, setLvlXp] = useState(80);

  // Question modal / form states
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [qText, setQText] = useState("");
  const [qImage, setQImage] = useState("✊");
  const [qOptA, setQOptA] = useState("");
  const [qOptB, setQOptB] = useState("");
  const [qOptC, setQOptC] = useState("");
  const [qOptD, setQOptD] = useState("");
  const [qCorrect, setQCorrect] = useState("A");

  // Deletion targets confirmation
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);

  // 1. Categories CRUD
  const openAddCategory = () => {
    setEditingCategory(null);
    setCatName("");
    setCatSlug("");
    setCatIcon("🔤");
    setCatDescription("");
    setIsCategoryModalOpen(true);
  };

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    setCatName(cat.name || "");
    setCatSlug(cat.slug || "");
    setCatIcon(cat.icon || "🔤");
    setCatDescription(cat.description || "");
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim() || !catSlug.trim()) return;

    const categoryData = {
      slug: catSlug.trim().toLowerCase().replace(/[^a-z0-9]/g, "-"),
      name: catName,
      icon: catIcon,
      description: catDescription,
      levels: editingCategory ? editingCategory.levels || [] : []
    };

    try {
      if (editingCategory) {
        await learningApi.put(`/api/admin/quizzes/categories/${editingCategory.slug}`, categoryData);
        const updated = quizCategories.map(c => c.slug === editingCategory.slug ? categoryData : c);
        setQuizCategories(updated);
        updateQuizCategories(updated);
      } else {
        const res = await learningApi.post("/api/admin/quizzes/categories", categoryData);
        const updated = [...quizCategories, res.data];
        setQuizCategories(updated);
        updateQuizCategories(updated);
      }
      setIsCategoryModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (slug) => {
    try {
      await learningApi.delete(`/api/admin/quizzes/categories/${slug}`);
      const updated = quizCategories.filter(c => c.slug !== slug);
      setQuizCategories(updated);
      updateQuizCategories(updated);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.response?.data?.error || err.message || "Failed to delete quiz category");
    }
  };

  // 2. Levels CRUD
  const openAddLevel = () => {
    setEditingLevel(null);
    setLvlTitle("");
    setLvlDifficulty("Easy");
    setLvlXp(80);
    setIsLevelModalOpen(true);
  };

  const openEditLevel = (lvl) => {
    setEditingLevel(lvl);
    setLvlTitle(lvl.title || "");
    setLvlDifficulty(lvl.difficulty || "Easy");
    setLvlXp(lvl.xp || 80);
    setIsLevelModalOpen(true);
  };

  const handleSaveLevel = async (e) => {
    e.preventDefault();
    if (!lvlTitle.trim() || !selectedCategory) return;

    const levelData = {
      id: editingLevel ? editingLevel.id : (selectedCategory.levels.length > 0 ? Math.max(...selectedCategory.levels.map(l => l.id)) + 1 : 1),
      title: lvlTitle,
      difficulty: lvlDifficulty,
      xp: parseInt(lvlXp) || 80,
      unlocked: editingLevel ? editingLevel.unlocked : (selectedCategory.levels.length === 0),
      questions: editingLevel ? editingLevel.questions || [] : []
    };

    let updatedLevels;
    if (editingLevel) {
      updatedLevels = selectedCategory.levels.map(l => l.id === editingLevel.id ? levelData : l);
    } else {
      updatedLevels = [...selectedCategory.levels, levelData];
    }

    const updatedCategories = quizCategories.map(c => {
      if (c.slug === selectedCategory.slug) {
        const nextCat = { ...c, levels: updatedLevels };
        setSelectedCategory(nextCat);
        return nextCat;
      }
      return c;
    });

    try {
      const activeCat = updatedCategories.find(c => c.slug === selectedCategory.slug);
      await learningApi.put(`/api/admin/quizzes/categories/${selectedCategory.slug}`, activeCat);
      setQuizCategories(updatedCategories);
      updateQuizCategories(updatedCategories);
      setIsLevelModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLevel = async (levelId) => {
    const updatedLevels = selectedCategory.levels.filter(l => l.id !== levelId);
    
    const updatedCategories = quizCategories.map(c => {
      if (c.slug === selectedCategory.slug) {
        const nextCat = { ...c, levels: updatedLevels };
        setSelectedCategory(nextCat);
        return nextCat;
      }
      return c;
    });

    try {
      const activeCat = updatedCategories.find(c => c.slug === selectedCategory.slug);
      await learningApi.put(`/api/admin/quizzes/categories/${selectedCategory.slug}`, activeCat);
      setQuizCategories(updatedCategories);
      updateQuizCategories(updatedCategories);
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Questions CRUD
  const openAddQuestion = () => {
    setEditingQuestion(null);
    setQText("");
    setQImage("✊");
    setQOptA("");
    setQOptB("");
    setQOptC("");
    setQOptD("");
    setQCorrect("A");
    setIsQuestionModalOpen(true);
  };

  const openEditQuestion = (q) => {
    setEditingQuestion(q);
    setQText(q.question || "");
    setQImage(q.image || "✊");
    setQOptA(q.options?.[0] || "");
    setQOptB(q.options?.[1] || "");
    setQOptC(q.options?.[2] || "");
    setQOptD(q.options?.[3] || "");

    const correctIdx = q.options?.indexOf(q.answer) || 0;
    const letter = correctIdx === 0 ? "A" : correctIdx === 1 ? "B" : correctIdx === 2 ? "C" : "D";
    setQCorrect(letter);
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!qText.trim() || !selectedLevel) return;

    const options = [qOptA, qOptB, qOptC, qOptD];
    const answer = qCorrect === "A" ? qOptA : qCorrect === "B" ? qOptB : qCorrect === "C" ? qOptC : qOptD;

    const questionData = {
      id: editingQuestion ? editingQuestion.id : Date.now(),
      question: qText,
      image: qImage,
      options,
      answer
    };

    let updatedQuestions;
    if (editingQuestion) {
      updatedQuestions = selectedLevel.questions.map(q => q.id === editingQuestion.id ? questionData : q);
    } else {
      updatedQuestions = [...selectedLevel.questions, questionData];
    }

    const updatedLevels = selectedCategory.levels.map(l => {
      if (l.id === selectedLevel.id) {
        const nextLvl = { ...l, questions: updatedQuestions };
        setSelectedLevel(nextLvl);
        return nextLvl;
      }
      return l;
    });

    const updatedCategories = quizCategories.map(c => {
      if (c.slug === selectedCategory.slug) {
        const nextCat = { ...c, levels: updatedLevels };
        setSelectedCategory(nextCat);
        return nextCat;
      }
      return c;
    });

    try {
      const activeCat = updatedCategories.find(c => c.slug === selectedCategory.slug);
      await learningApi.put(`/api/admin/quizzes/categories/${selectedCategory.slug}`, activeCat);
      setQuizCategories(updatedCategories);
      updateQuizCategories(updatedCategories);
      setIsQuestionModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    const updatedQuestions = selectedLevel.questions.filter(q => q.id !== qId);
    
    const updatedLevels = selectedCategory.levels.map(l => {
      if (l.id === selectedLevel.id) {
        const nextLvl = { ...l, questions: updatedQuestions };
        setSelectedLevel(nextLvl);
        return nextLvl;
      }
      return l;
    });

    const updatedCategories = quizCategories.map(c => {
      if (c.slug === selectedCategory.slug) {
        const nextCat = { ...c, levels: updatedLevels };
        setSelectedCategory(nextCat);
        return nextCat;
      }
      return c;
    });

    try {
      const activeCat = updatedCategories.find(c => c.slug === selectedCategory.slug);
      await learningApi.put(`/api/admin/quizzes/categories/${selectedCategory.slug}`, activeCat);
      setQuizCategories(updatedCategories);
      updateQuizCategories(updatedCategories);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-textPrimary select-none">
      
      {/* 1. VIEW: Categories List Manager */}
      {currentView === "categories" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-textPrimary">Quiz Categories</h2>
              <p className="text-xs text-textTertiary mt-1 font-semibold">
                Manage practice categories, sub-levels, and vocabulary questions
              </p>
            </div>
            <button
              onClick={openAddCategory}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-brand text-white text-xs font-bold rounded-xl hover:shadow-glow-purple transition-all duration-300 active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizCategories.map(cat => {
              const levelsCount = cat.levels?.length || 0;
              const questionsCount = cat.levels?.reduce((sum, l) => sum + (l.questions?.length || 0), 0) || 0;
              const categoryXp = cat.levels?.reduce((sum, l) => sum + (l.xp || 0), 0) || 0;

              return (
                <GlassCard key={cat.slug} className="p-5 flex flex-col gap-4 border-white/[0.08] hover:scale-[1.01] transition-transform duration-300 relative group overflow-hidden">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-3xl shrink-0 filter drop-shadow">
                      {cat.icon === "award" || cat.icon === "Award" ? "🏆" : (cat.icon && cat.icon.length < 5 ? cat.icon : "📚")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-sm text-textPrimary truncate">
                          {cat.name}
                        </h3>
                        <GradientBadge label={cat.slug} gradient="brand" className="scale-90" />
                      </div>
                      <p className="text-[10px] text-textSecondary line-clamp-2 mt-1 leading-relaxed">
                        {cat.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.06] text-center text-xs font-semibold font-mono">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-textTertiary uppercase">Levels</span>
                      <span className="text-textPrimary mt-0.5">{levelsCount}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-textTertiary uppercase">Questions</span>
                      <span className="text-textPrimary mt-0.5">{questionsCount}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-textTertiary uppercase">XP Total</span>
                      <span className="text-purple-400 mt-0.5">+{categoryXp} XP</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2.5 pt-1.5 mt-1 border-t border-white/[0.04]">
                    <button
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCurrentView("levels");
                      }}
                      className="px-3.5 py-1.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-white text-[10px] font-bold rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Manage Levels</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditCategory(cat)}
                        className="p-1.5 border border-white/[0.06] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] text-textSecondary hover:text-textPrimary rounded-lg transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteConfirmTarget({
                            type: "category",
                            id: cat.slug,
                            title: cat.name
                          });
                        }}
                        className="p-1.5 border border-red-500/10 hover:border-red-500/20 bg-red-500/[0.03] hover:bg-red-500/[0.06] text-red-400 hover:text-red-300 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. VIEW: Category Levels manager */}
      {currentView === "levels" && selectedCategory && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setCurrentView("categories")}
              className="text-xs text-textTertiary hover:text-textSecondary flex items-center gap-1 self-start transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Categories
            </button>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl filter drop-shadow">{selectedCategory.icon}</span>
                <div>
                  <h2 className="text-lg font-black text-textPrimary leading-none">{selectedCategory.name} Levels</h2>
                  <p className="text-xs text-textSecondary mt-1 leading-normal">
                    Manage individual level milestones, difficulty ranges, and XP values.
                  </p>
                </div>
              </div>
              <button
                onClick={openAddLevel}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-brand text-white text-xs font-bold rounded-xl hover:shadow-glow-purple transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Level</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {selectedCategory.levels?.map((lvl, index) => {
              const questionsCount = lvl.questions?.length || 0;
              let badgeColor = "green";
              if (lvl.difficulty === "Medium") badgeColor = "amber";
              if (lvl.difficulty === "Hard") badgeColor = "red";

              return (
                <GlassCard key={lvl.id} className="p-5 flex flex-col justify-between border-white/[0.08]">
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[9px] font-bold font-mono text-textTertiary">
                      <span className="uppercase">LEVEL {lvl.id}</span>
                      <GradientBadge label={lvl.difficulty} gradient={badgeColor} className="scale-90" />
                    </div>

                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-bold text-textPrimary">{lvl.title}</h3>
                      <p className="text-[10px] text-textSecondary font-semibold">
                        XP Reward: <span className="text-purple-400">+{lvl.xp} XP</span> | Questions Pool: <span className="text-cyan-400">{questionsCount} Questions</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[0.04] pt-3 mt-4">
                    <button
                      onClick={() => {
                        setSelectedLevel(lvl);
                        setCurrentView("questions");
                      }}
                      className="px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-white text-[10px] font-bold rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      <FileQuestion className="w-3.5 h-3.5 text-purple-400" />
                      <span>Manage Questions</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditLevel(lvl)}
                        className="p-1 border border-white/[0.06] hover:bg-white/10 text-textSecondary rounded transition-all"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteConfirmTarget({
                            type: "level",
                            id: lvl.id,
                            title: lvl.title
                          });
                        }}
                        className="p-1 border border-red-500/10 bg-red-500/[0.02] hover:bg-red-500/[0.06] text-red-400 rounded transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. VIEW: Level Questions list manager */}
      {currentView === "questions" && selectedCategory && selectedLevel && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setCurrentView("levels")}
              className="text-xs text-textTertiary hover:text-textSecondary flex items-center gap-1 self-start transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Levels
            </button>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl filter drop-shadow">❓</span>
                <div>
                  <h2 className="text-lg font-black text-textPrimary leading-none">{selectedLevel.title} Questions</h2>
                  <p className="text-xs text-textSecondary mt-1 leading-normal">
                    {selectedCategory.name} Category — Level {selectedLevel.id} Question Pool.
                  </p>
                </div>
              </div>
              <button
                onClick={openAddQuestion}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-brand text-white text-xs font-bold rounded-xl hover:shadow-glow-purple transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            {selectedLevel.questions?.map((q, idx) => (
              <div key={q.id || idx} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-purple-400 font-extrabold text-xs">#{idx + 1}</span>
                  {q.image && <span className="text-2xl filter drop-shadow shrink-0">{q.image}</span>}
                  <div className="flex flex-col min-w-0">
                    <p className="font-bold text-textPrimary leading-normal line-clamp-1">{q.question}</p>
                    <span className="text-[10px] text-textTertiary mt-1 truncate">
                      Options: A: {q.options?.[0]} | B: {q.options?.[1]} | Correct: {q.answer}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditQuestion(q)}
                    className="p-1.5 border border-white/[0.06] hover:bg-white/10 text-textSecondary rounded-lg"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteConfirmTarget({
                        type: "question",
                        id: q.id,
                        title: q.question
                      });
                    }}
                    className="p-1.5 border border-red-500/10 bg-red-500/[0.03] hover:bg-red-500/[0.06] text-red-400 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {(!selectedLevel.questions || selectedLevel.questions.length === 0) && (
              <div className="text-center py-12 text-textTertiary border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center p-6 bg-white/[0.01]">
                <FileQuestion className="w-8 h-8 opacity-25 mb-2" />
                <p className="text-xs">No questions configured inside this level.</p>
                <p className="text-[10px] mt-0.5">Click "+ Add Question" above to begin building the quiz pool.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. MODALS: Forms layouts */}
      {/* Category Add/Edit Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-6 border-white/[0.08] shadow-2xl relative">
            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-white/10 text-textSecondary rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-extrabold text-textPrimary border-b border-white/[0.06] pb-2 mb-4">
              {editingCategory ? "Edit Category Details" : "Create New Category"}
            </h3>

            <form onSubmit={handleSaveCategory} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-textSecondary uppercase">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  placeholder="e.g. Alphabets"
                  className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3.5 py-2.5 text-xs text-textPrimary placeholder-textTertiary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-textSecondary uppercase">URL Slug</label>
                <input
                  type="text"
                  required
                  disabled={editingCategory}
                  value={catSlug}
                  onChange={e => setCatSlug(e.target.value)}
                  placeholder="e.g. alphabets"
                  className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3.5 py-2.5 text-xs text-textPrimary placeholder-textTertiary disabled:opacity-40"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-textSecondary uppercase">Emoji Icon</label>
                <input
                  type="text"
                  required
                  value={catIcon}
                  onChange={e => setCatIcon(e.target.value)}
                  placeholder="e.g. 🔤"
                  className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3.5 py-2.5 text-xs text-textPrimary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-textSecondary uppercase">Description</label>
                <textarea
                  rows={2}
                  value={catDescription}
                  onChange={e => setCatDescription(e.target.value)}
                  placeholder="Short description summarizing this quiz category..."
                  className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3.5 py-2.5 text-xs text-textPrimary placeholder-textTertiary resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-brand text-white text-xs font-bold rounded-xl mt-2 flex items-center justify-center gap-1.5 hover:shadow-glow-purple transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Category</span>
              </button>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Level Add/Edit Modal */}
      {isLevelModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-sm p-6 border-white/[0.08] shadow-2xl relative">
            <button
              onClick={() => setIsLevelModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-white/10 text-textSecondary rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-extrabold text-textPrimary border-b border-white/[0.06] pb-2 mb-4">
              {editingLevel ? "Edit Level Details" : "Create New Level"}
            </h3>

            <form onSubmit={handleSaveLevel} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-textSecondary uppercase">Level Title</label>
                <input
                  type="text"
                  required
                  value={lvlTitle}
                  onChange={e => setLvlTitle(e.target.value)}
                  placeholder="e.g. Letters A–G"
                  className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3.5 py-2.5 text-xs text-textPrimary placeholder-textTertiary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-textSecondary uppercase">Difficulty</label>
                <select
                  value={lvlDifficulty}
                  onChange={e => setLvlDifficulty(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3.5 py-2.5 text-xs text-textPrimary"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-textSecondary uppercase">XP Reward</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={lvlXp}
                  onChange={e => setLvlXp(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3.5 py-2.5 text-xs text-textPrimary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-brand text-white text-xs font-bold rounded-xl mt-2 flex items-center justify-center gap-1.5 hover:shadow-glow-purple transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Level</span>
              </button>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Question Add/Edit Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-6 border-white/[0.08] shadow-2xl relative">
            <button
              onClick={() => setIsQuestionModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-white/10 text-textSecondary rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-extrabold text-textPrimary border-b border-white/[0.06] pb-2 mb-4">
              {editingQuestion ? "Edit Question Details" : "Add New Question"}
            </h3>

            <form onSubmit={handleSaveQuestion} className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-textSecondary uppercase">Question Text</label>
                <input
                  type="text"
                  required
                  value={qText}
                  onChange={e => setQText(e.target.value)}
                  placeholder="Which letter represents..."
                  className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3.5 py-2.5 text-xs text-textPrimary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-textSecondary uppercase">Illustration Emoji / Icon</label>
                <input
                  type="text"
                  value={qImage}
                  onChange={e => setQImage(e.target.value)}
                  placeholder="✊"
                  className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3.5 py-2.5 text-xs text-textPrimary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-textSecondary uppercase">Option A</label>
                  <input type="text" required value={qOptA} onChange={e => setQOptA(e.target.value)} className="bg-black/40 border border-white/10 outline-none rounded-lg px-3 py-1.5 text-xs text-textPrimary" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-textSecondary uppercase">Option B</label>
                  <input type="text" required value={qOptB} onChange={e => setQOptB(e.target.value)} className="bg-black/40 border border-white/10 outline-none rounded-lg px-3 py-1.5 text-xs text-textPrimary" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-textSecondary uppercase">Option C</label>
                  <input type="text" required value={qOptC} onChange={e => setQOptC(e.target.value)} className="bg-black/40 border border-white/10 outline-none rounded-lg px-3 py-1.5 text-xs text-textPrimary" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-textSecondary uppercase">Option D</label>
                  <input type="text" required value={qOptD} onChange={e => setQOptD(e.target.value)} className="bg-black/40 border border-white/10 outline-none rounded-lg px-3 py-1.5 text-xs text-textPrimary" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-textSecondary uppercase">Correct Answer Choice</label>
                <select
                  value={qCorrect}
                  onChange={e => setQCorrect(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3.5 py-2.5 text-xs text-textPrimary"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-brand text-white text-xs font-bold rounded-xl mt-2 flex items-center justify-center gap-1.5 hover:shadow-glow-purple transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Question</span>
              </button>
            </form>
          </GlassCard>
        </div>
      )}

      {/* 5. MODALS: Trash Delete Confirmation Modal */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm relative z-10">
            <GlassCard className="p-6 bg-bgSecondary border-glassBorder shadow-2xl text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-textPrimary">Delete Syllabus Item?</h3>
                <p className="text-xs text-textTertiary mt-1 font-semibold leading-relaxed">
                  Are you sure you want to delete the {deleteConfirmTarget.type} "{deleteConfirmTarget.title}"? This action cannot be undone.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-2">
                <button
                  onClick={() => setDeleteConfirmTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-xs font-bold text-textSecondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirmTarget.type === "category") {
                      handleDeleteCategory(deleteConfirmTarget.id);
                    } else if (deleteConfirmTarget.type === "level") {
                      handleDeleteLevel(deleteConfirmTarget.id);
                    } else if (deleteConfirmTarget.type === "question") {
                      handleDeleteQuestion(deleteConfirmTarget.id);
                    }
                    setDeleteConfirmTarget(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-500 text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all"
                >
                  Confirm Delete
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

    </div>
  );
}
