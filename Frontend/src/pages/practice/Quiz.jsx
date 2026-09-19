import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Award, Star, Check, X, ChevronRight, ChevronLeft, ArrowLeft, RotateCcw, AlertTriangle } from "lucide-react";
import { GlassCard } from "../../components/shared/GlassCard";
import { GradientBadge } from "../../components/shared/GradientBadge";
import { AnimatedCounter } from "../../components/shared/AnimatedCounter";
import { useApp } from "../../context/AppContext";
import { learningApi } from "../../lib/api";

const videoModules = import.meta.glob('/public/videos/*.mp4', { as: 'url', eager: true });
const videoKeys = Object.keys(videoModules).sort();

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("Quiz Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full max-w-2xl mx-auto p-6 mt-20 bg-red-950/80 border border-red-500/50 rounded-2xl text-red-200 font-mono text-sm break-words z-50">
          <h2 className="text-xl font-bold mb-3 text-red-400">Quiz Component Crashed!</h2>
          <div className="mb-4">{this.state.error && this.state.error.toString()}</div>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg">Hard Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function Quiz() {
  const { state, t, submitQuiz } = useApp();
  const { categorySlug, levelId: paramLevelId } = useParams();
  const levelId = paramLevelId ? parseInt(paramLevelId) : null;
  const navigate = useNavigate();

  const [quizCategories, setQuizCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await learningApi.get("/api/quizzes/categories");
        // Only show practice categories (they have IDs > 100 in the seed data)
        setQuizCategories(res.data.filter(c => !c.name.includes("Quiz") || c.slug.includes("practice")));
      } catch (err) {
        console.error("Failed to load quiz categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Find current category and level based on URL params
  const currentCategory = categorySlug ? quizCategories.find(c => c.slug === categorySlug) : null;
  const currentLevel = (currentCategory && levelId) ? currentCategory.levels.find(l => l.id === parseInt(levelId)) : null;

  // Game state: matches existing screen but bound to routes/URL params
  const [gameState, setGameState] = useState("selection"); // "selection" | "playing" | "complete"
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [timer, setTimer] = useState(30);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [shakeOption, setShakeOption] = useState(null);
  const [secondsSpent, setSecondsSpent] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  // Removed unused pagination states

  const canvasRef = useRef(null);

  // Load questions for active level
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    if (gameState === "playing" && levelId) {
      const fetchQuestions = async () => {
        setLoadingQuestions(true);
        try {
          const res = await learningApi.get(`/api/quizzes/levels/${levelId}/questions`);
          const fetchedQuestions = res.data.questions || res.data;
          
          if (!fetchedQuestions || fetchedQuestions.length === 0) {
            console.warn("API returned empty questions array. Keeping existing questions.");
            return;
          }

          const formattedQuestions = fetchedQuestions.map((q, idx) => {
            let assignedImage = q.image;
            
            // The backend might send paths like "/WLASL100/WLASL100/videos/66045.mp4"
            // We need to extract just the filename to look it up in our bundled videoModules
            if (assignedImage && assignedImage.includes('.mp4')) {
              const filename = assignedImage.split('/').pop();
              const matchingModuleKey = videoKeys.find(key => key.endsWith(filename));
              if (matchingModuleKey) {
                assignedImage = videoModules[matchingModuleKey];
              }
            } else if (!assignedImage || assignedImage === "o<" || assignedImage === "") {
              // Fallback for missing images
              if (videoKeys.length > 0) {
                const videoIndex = (q.id || idx) % videoKeys.length;
                const moduleKey = videoKeys[videoIndex];
                assignedImage = videoModules[moduleKey]; 
              } else {
                assignedImage = `/videos/00335.mp4`; 
              }
            }
            
            return {
              id: q.id,
              question: q.question,
              image: assignedImage,
              options: q.options,
              answer: q.correctAnswer
            };
          });
          setQuestions(formattedQuestions);
        } catch (err) {
          console.error("Failed to load questions:", err);
        } finally {
          setLoadingQuestions(false);
        }
      };
      fetchQuestions();
    }
  }, [gameState, levelId]);

  const currentQuestion = questions[currentQuestionIdx];

  // Helper star calculation matching criteria
  const getStarsCount = (score, total) => {
    if (!total || total === 0 || !score) return 0;
    const pct = (score / total) * 100;
    if (pct >= 90) return 3;
    if (pct >= 70) return 2;
    if (pct >= 50) return 1;
    return 0;
  };

  // Helper lock check
  const isLevelUnlocked = (category, levelIndex) => {
    if (levelIndex === 0) return true; // Level 1 is always unlocked
    
    const prevLevel = category.levels[levelIndex - 1];
    
    // The backend returns scores keyed by `slug_id`. AppContext optimistically sets them by `id`.
    const scoreData1 = state.progress?.quizScores?.[`${category.slug}_${prevLevel.id}`];
    const scoreData2 = state.progress?.quizScores?.[prevLevel.id];
    const prevScoreObj = scoreData1 || scoreData2;
    
    const prevLevelScore = typeof prevScoreObj === 'object' && prevScoreObj !== null ? prevScoreObj.score : (prevScoreObj || 0);
    const passed = typeof prevScoreObj === 'object' && prevScoreObj !== null ? prevScoreObj.passed : false;
    
    const passThreshold = Math.ceil((prevLevel.questionsCount) * 0.7);
    return passed || prevLevelScore >= passThreshold;
  };

  // Synchronize playing states based on URL params
  useEffect(() => {
    if (categorySlug && levelId && currentLevel) {
      setGameState("playing");
      setCurrentQuestionIdx(0);
      setSelectedOption(null);
      setCorrectAnswersCount(0);
      setTimer(30);
      setHasAnswered(false);
      setSecondsSpent(0);
    } else {
      setGameState("selection");
    }
  }, [categorySlug, levelId, currentLevel]);

  // Timer is completely removed to prevent crashing

  // Confetti particles effect on complete
  useEffect(() => {
    if (gameState === "complete" && canvasRef.current) {
      let animationFrameId = null;
      try {
        const canvas = canvasRef.current;
        if (!canvas.parentElement) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = canvas.parentElement.clientWidth || window.innerWidth;
        canvas.height = canvas.parentElement.clientHeight || window.innerHeight;

        const particles = [];
        for (let i = 0; i < 100; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 4,
            d: Math.random() * canvas.height,
            color: `hsl(${Math.random() * 360}, 80%, 60%)`,
            tilt: Math.random() * 10 - 5,
            tiltAngleIncremental: Math.random() * 0.07 + 0.02,
            tiltAngle: 0,
          });
        }

        const draw = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          let active = false;

          particles.forEach((p) => {
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
            p.x += Math.sin(p.tiltAngle);
            p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 4;

            if (p.y < canvas.height) {
              active = true;
            } else {
              p.y = -20;
              p.x = Math.random() * canvas.width;
            }

            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
            ctx.stroke();
          });

          if (active) {
            animationFrameId = requestAnimationFrame(draw);
          }
        };

        draw();
      } catch (err) {
        console.error("Confetti animation failed to load:", err);
      }
      return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      };
    }
  }, [gameState]);

  const handleOptionSelect = (option) => {
    if (hasAnswered) return;
    setSelectedOption(option);
    setHasAnswered(true);

    const isCorrect = option === currentQuestion.answer;
    if (isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
    } else {
      setShakeOption(option);
      setTimeout(() => setShakeOption(null), 500);
    }
  };

  const handleNextQuestion = async () => {
    setSelectedOption(null);
    setHasAnswered(false);
    setTimer(30);

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      setGameState("complete");
      const finalScore = correctAnswersCount + (selectedOption === currentQuestion.answer ? 1 : 0);
      
      try {
        const res = await learningApi.post(`/api/progress/quizzes/${levelId}/attempt`, {
          score: finalScore,
          timeTakenSeconds: secondsSpent,
          totalQuestions: questions.length
        });
        
        if (res.data && res.data.xpEarned !== undefined) {
          setXpEarned(res.data.xpEarned);
        }
        
        const accuracyPct = Math.round((finalScore / questions.length) * 100);
        if (submitQuiz) {
            submitQuiz(levelId, "Level " + levelId, finalScore, questions.length, accuracyPct, secondsSpent + "s");
        }
      } catch (err) {
        console.error("Failed to submit quiz attempt", err);
      }
    }
  };

  const handleRetryQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setCorrectAnswersCount(0);
    setTimer(30);
    setHasAnswered(false);
    setSecondsSpent(0);
    setGameState("playing");
  };

  return (
    <ErrorBoundary>
    <div className="relative min-h-[calc(100vh-8.5rem)] flex items-center justify-center p-2 select-none">
      
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* PAGE 1: Categories & Levels Horizontal Carousels */}
      {!loading && gameState === "selection" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="w-full flex flex-col gap-10"
        >
          <div className="flex flex-col gap-1 text-left border-b border-white/[0.08] pb-4">
            <div className="inline-flex items-center self-start px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-[9px] font-bold font-mono text-purple-400 rounded uppercase tracking-wider">
              {t("practice")}
            </div>
            <h2 className="text-xl font-black text-textPrimary mt-1.5">{t("quiz")}</h2>
            <p className="text-xs text-textSecondary">
              Practice your sign language skills by choosing a topic below.
            </p>
          </div>

          <div className="flex flex-col gap-12 w-full max-w-full">
            {quizCategories.map((cat) => {
              const catLevels = cat.levels || [];
              if (catLevels.length === 0) return null;
              
              // We create a tiny local component/function to render each carousel row
              const scrollContainerRef = React.createRef();
              const scroll = (direction) => {
                if (scrollContainerRef.current) {
                  const scrollAmount = 300;
                  scrollContainerRef.current.scrollBy({
                    left: direction === "left" ? -scrollAmount : scrollAmount,
                    behavior: "smooth"
                  });
                }
              };

              return (
                <div key={cat.slug} className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 mb-6">
                      <h3 className="text-lg font-extrabold text-textPrimary tracking-tight">
                        {cat.name}
                      </h3>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => scroll("left")} className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] transition-colors">
                        <ChevronLeft className="w-4 h-4 text-textSecondary" />
                      </button>
                      <button onClick={() => scroll("right")} className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] transition-colors">
                        <ChevronRight className="w-4 h-4 text-textSecondary" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
                    {catLevels.map((lvl, index) => {
                      const unlocked = isLevelUnlocked(cat, index);
                      const scoreData1 = state.progress?.quizScores?.[`${cat.slug}_${lvl.id}`];
                      const scoreData2 = state.progress?.quizScores?.[lvl.id];
                      const scoreObj = scoreData1 || scoreData2;
                      const savedScore = typeof scoreObj === 'object' && scoreObj !== null ? scoreObj.score : (scoreObj || 0);
                      
                      const totalQuestions = lvl.questionsCount || 10;

                      let badgeColor = "border-white/[0.04] bg-white/[0.02]";
                      let textColor = "text-textSecondary";
                      if (savedScore === totalQuestions) {
                        badgeColor = "border-emerald-500/30 bg-emerald-500/10";
                        textColor = "text-emerald-400";
                      } else if (savedScore > 0) {
                        badgeColor = "border-amber-500/30 bg-amber-500/10";
                        textColor = "text-amber-400";
                      }

                      return (
                        <button
                          key={lvl.id}
                          onClick={() => unlocked && navigate(`/practice/quiz/${cat.slug}/${lvl.id}`)}
                          disabled={!unlocked}
                          className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 ${
                            unlocked
                              ? `${badgeColor} hover:border-purple-500/40 hover:scale-105 hover:bg-white/[0.06] hover:shadow-glow-purple cursor-pointer`
                              : "border-white/[0.02] bg-white/[0.01] opacity-40 cursor-not-allowed"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-xs font-black text-textPrimary tracking-wider uppercase font-mono">
                              L{lvl.levelOrder || index + 1}
                            </span>
                            {!unlocked && <Lock className="w-3 h-3 text-textTertiary" />}
                          </div>
                          
                          <div className={`text-[10px] font-mono font-bold ${textColor}`}>
                            {savedScore} / {totalQuestions}
                          </div>
                          
                          {/* Small progress bar */}
                          {unlocked && (
                            <div className="w-full h-1 bg-white/[0.05] rounded-full mt-2 overflow-hidden relative">
                              <div
                                className="h-full bg-gradient-brand rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(100, Math.round((savedScore / totalQuestions) * 100))}%` }}
                              />
                              {/* Passing threshold marker */}
                              <div 
                                className="absolute top-0 bottom-0 w-0.5 bg-white/40 z-10" 
                                style={{ left: '70%' }}
                                title={`Pass threshold: ${Math.ceil(totalQuestions * 0.7)}`}
                              />
                            </div>
                          )}
                          {unlocked && savedScore < Math.ceil(totalQuestions * 0.7) && (
                            <div className="text-[8px] text-textSecondary mt-1 uppercase font-bold tracking-tighter">
                              Need {Math.ceil(totalQuestions * 0.7)} to pass
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* PAGE 3: Quiz Playing Interface */}
      {gameState === "playing" && loadingQuestions && (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {gameState === "playing" && !loadingQuestions && currentQuestion && (
        <motion.div
          key={currentQuestionIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="w-full max-w-xl flex flex-col gap-6"
        >
          {/* Header progress info */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 bg-white/[0.01] p-3.5 rounded-2xl">
            <div className="flex flex-col gap-1.5 flex-1 max-w-[60%]">
              <div className="flex justify-between text-[10px] font-bold text-textSecondary uppercase font-mono">
                <span>{t("questionProgress").replace("{current}", currentQuestionIdx + 1).replace("{total}", questions.length)}</span>
                <span>{Math.round(((currentQuestionIdx + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.04] border border-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-brand rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Timer countdown removed */}
          </div>

          {/* Visual stimulus preview box */}
          <div className="h-48 bg-gradient-cyan rounded-3xl flex items-center justify-center text-7xl shadow-inner relative overflow-hidden">
            {currentQuestion.image ? (
               (() => {
                 const src = currentQuestion.image;
                 const isVideo = src.endsWith('.mp4') || src.endsWith('.webm');
                 // For now, if it doesn't start with http or /, assume we serve it from a local root (e.g., /media or /)
                 const mediaUrl = src.startsWith('http') || src.startsWith('/') ? src : `/${src}`;
                     if (isVideo) {
                       return (
                         <div className="w-full h-full relative">
                           <video 
                             key={mediaUrl}
                             src={mediaUrl} 
                             className="w-full h-full object-contain bg-black rounded-3xl" 
                             autoPlay 
                             loop 
                             muted 
                             playsInline 
                           />
                         </div>
                       );
                     } else if (src.endsWith('.htm') || src.endsWith('.html')) {
                   return <iframe src={mediaUrl} className="w-full h-full border-0" title="Sign Language Reference" />;
                 } else {
                   return <img src={mediaUrl} alt="Visual Stimulus" className="w-full h-full object-contain" />;
                 }
               })()
            ) : (
               <span className="animate-pulse">{"✋"}</span>
            )}
            
            <div className="absolute top-3 left-3 bg-black/40 px-2 py-0.5 rounded text-[10px] text-white/80 font-semibold uppercase tracking-wider backdrop-blur font-mono pointer-events-none">
              {t("visualStimulus")}
            </div>
          </div>

          {/* Question title */}
          <p className="text-sm font-semibold text-textPrimary text-center px-4 leading-relaxed">
            {currentQuestion.question}
          </p>

          {/* Option choice grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentQuestion.answer;
              const isWrong = isSelected && !isCorrect;
              const isShake = shakeOption === opt;

              let cardStyle = "border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.04]";
              if (hasAnswered) {
                if (isCorrect) {
                  cardStyle = "border-emerald-500/40 bg-emerald-500/[0.08] text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]";
                } else if (isWrong) {
                  cardStyle = "border-red-500/40 bg-red-500/[0.08] text-white shadow-[0_0_15px_rgba(239,68,68,0.15)]";
                } else {
                  cardStyle = "border-white/[0.02] opacity-40 bg-transparent cursor-not-allowed";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(opt)}
                  disabled={hasAnswered}
                  className={`p-4 text-xs font-semibold rounded-2xl border text-textSecondary text-left transition-all duration-300 flex items-center justify-between ${cardStyle} ${
                    isShake ? "animate-shake" : ""
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {hasAnswered && isCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                  {hasAnswered && isWrong && <X className="w-4 h-4 text-red-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          {/* Next button */}
          {hasAnswered && (
            <button
              onClick={handleNextQuestion}
              className="mt-2 py-3 bg-gradient-brand hover:shadow-glow-purple text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-[0.98] animate-bounce"
              style={{ animationDuration: "2s" }}
            >
              <span>{currentQuestionIdx < questions.length - 1 ? t("nextQuestion") : t("viewResults")}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}

      {/* PAGE 3: Quiz Completion View screen */}
      {gameState === "complete" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md flex flex-col gap-6 relative"
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none rounded-3xl" />

          <GlassCard className="p-6 md:p-8 flex flex-col items-center text-center gap-5 border-purple-500/20 relative z-10">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 text-3xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              🏆
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-textPrimary">{t("quizCompleted")}</h3>
              <p className="text-xs text-textSecondary">
                {t("quizCompletedDesc")}
              </p>
            </div>

            {/* Stars animation count */}
            <div className="flex items-center gap-2.5 my-2">
              {[...Array(3)].map((_, i) => {
                const starsCount = getStarsCount(correctAnswersCount, questions.length);
                const isActive = i < starsCount;
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={isActive ? { scale: 1.2, rotate: 0 } : { scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2 + i * 0.25, type: "spring", stiffness: 300 }}
                  >
                    <Star
                      className={`w-8 h-8 ${
                        isActive
                          ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                          : "text-white/10"
                      }`}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Accuracy and XP */}
            <div className="grid grid-cols-2 gap-4 w-full mt-2 font-mono">
              <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-textTertiary uppercase">{t("xpEarned")}</span>
                <span className="text-lg font-bold text-purple-400 mt-0.5">
                  +<AnimatedCounter from={0} to={xpEarned} duration={0.8} /> XP
                </span>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-textTertiary uppercase">{t("accuracy")}</span>
                <span className="text-lg font-bold text-emerald-400 mt-0.5">
                  {Math.round((correctAnswersCount / questions.length) * 100)}%
                </span>
              </div>
            </div>

            {/* Claim badge unlock if score is 100% */}
            {correctAnswersCount === questions.length && (
              <div className="w-full p-3 bg-gradient-brand-subtle border border-purple-500/20 rounded-xl flex items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎖️</span>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-textPrimary">{t("badgeUnlockedPerfect")}</span>
                    <span className="text-[9px] text-textSecondary">{t("perfectScoreDesc")}</span>
                  </div>
                </div>
                <GradientBadge label={t("claimed")} gradient="brand" />
              </div>
            )}

            {/* Completion navigation panel */}
            <div className="flex flex-col gap-2.5 w-full mt-4">
              <button
                onClick={() => navigate(`/practice/quiz/${categorySlug}`)}
                className="w-full py-2.5 bg-gradient-brand hover:shadow-glow-purple text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-97"
              >
                Return to Level Selection
              </button>
              <button
                onClick={handleRetryQuiz}
                className="w-full py-2.5 border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] text-textSecondary hover:text-textPrimary text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-97"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Level</span>
              </button>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
    </ErrorBoundary>
  );
}
