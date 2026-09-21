import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, X, Play, Zap, Check, Brain } from "lucide-react";
import { GlassCard } from "../../components/shared/GlassCard";
import { cn } from "../../lib/utils";
import { learningApi, analyticsApi } from "../../lib/api";
import { useApp } from "../../context/AppContext";

export function CourseQuiz({ courseId, courseTitle, onComplete }) {
  const { t, state, submitQuiz } = useApp();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [quizState, setQuizState] = useState("start"); // start, playing, success, failed
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [xpEarned, setXpEarned] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        // 1. Fetch categories
        const catRes = await learningApi.get("/api/quizzes/categories");
        const catName = `${courseTitle} Quiz`;
        const category = catRes.data.find(c => c.name === catName);
        
        if (category && category.levels && category.levels.length > 0) {
          const levelId = category.levels[0].id;
          // 2. Fetch questions using the correct endpoint
          const qRes = await learningApi.get(`/api/quizzes/levels/${levelId}/questions`);
          const fetchedQuestions = qRes.data;
          
          if (fetchedQuestions && fetchedQuestions.length > 0) {
            const formatted = fetchedQuestions.map(q => ({
              id: q.id,
              question: q.question, // from QuestionResponseDto
              image: q.image || "o<", // Placeholder sign image
              options: q.options, // List of strings
              answer: q.correctAnswer // from QuestionResponseDto
            }));
            setQuestions(formatted);
          }
        }
      } catch (err) {
        console.error("Failed to load course quiz", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuiz();
  }, [courseTitle]);

  const currentQuestion = questions[currentQuestionIdx];

  useEffect(() => {
    if (quizState !== "playing" || isAnswered || !currentQuestion) return;
    
    if (timeLeft === 0) {
      handleAnswer(null);
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, quizState, isAnswered, currentQuestion]);

  const handleAnswer = (option) => {
    setSelectedOption(option);
    setIsAnswered(true);
    
    const correct = option === currentQuestion.answer;
    if (correct) {
      setScore((prev) => prev + 1);
    } else {
      setLives((prev) => {
        const nextLives = prev - 1;
        if (nextLives <= 0) {
          setQuizState("failed");
        }
        return nextLives;
      });
    }
  };

  const handleNext = async () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(30);
    } else {
      // Optimistic UI Update
      setQuizState("success");
      setXpEarned(20);
      if (onComplete) onComplete(score);

      try {
        // Persist XP to backend via analytics-service
        // The final quiz is treated as a lesson completion with a special lessonId (courseId * 10000)
        const finalQuizLessonId = courseId * 10000;
        await analyticsApi.post(`/api/progress/lessons/${finalQuizLessonId}/complete`);
        
        analyticsApi.post("/api/progress/activity", {
          activityType: "FINAL_QUIZ_COMPLETE",
          detail: courseTitle,
        }).catch((e) => console.error("Activity log failed", e));
      } catch (err) {
        console.error("Failed to complete final quiz", err);
        // Suppressed popup as requested by user
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setLives(3);
    setTimeLeft(30);
    setXpEarned(0);
    setScore(0);
    setQuizState("playing");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (questions.length === 0) {
    // No quiz for this course
    return null;
  }

  if (quizState === "start") {
    return (
      <GlassCard className="p-8 border-purple-500/20 bg-bgSecondary flex flex-col items-center text-center gap-5 w-full mt-6">
        <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Award className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-textPrimary">Final Course Quiz</h3>
        <p className="text-xs text-textSecondary leading-relaxed max-w-sm">
          Test your knowledge on everything you've learned in this course to earn bonus XP and mastery badges!
        </p>
        <button
          onClick={() => setQuizState("playing")}
          className="w-full max-w-sm mt-2 py-3 bg-gradient-brand text-white font-bold text-sm rounded-xl hover:shadow-glow-purple transition-all duration-300 active:scale-97 flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-white" /> Start Quiz
        </button>
      </GlassCard>
    );
  }

  if (quizState === "failed") {
    return (
      <GlassCard className="p-8 border-red-500/20 bg-bgSecondary flex flex-col items-center justify-center text-center gap-5 w-full mt-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <X className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-textPrimary">{t("quizFailed")}</h3>
        <p className="text-xs text-textSecondary leading-relaxed max-w-sm">
          {t("quizFailedDesc")}
        </p>
        <button
          onClick={resetQuiz}
          className="w-full max-w-sm mt-2 py-3 bg-gradient-brand text-white font-bold text-sm rounded-xl hover:shadow-glow-purple transition-all duration-300 active:scale-97 flex items-center justify-center gap-2"
        >
          {t("tryAgain")}
        </button>
      </GlassCard>
    );
  }

  if (quizState === "success") {
    return (
      <GlassCard className="p-8 border-emerald-500/20 bg-bgSecondary flex flex-col items-center justify-center text-center gap-5 w-full mt-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Award className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-textPrimary">{t("quizCompleted")}</h3>
        <div className="flex flex-col gap-1 my-2">
          <span className="text-xs text-textSecondary font-semibold">
            {t("scoreLabel").replace("{score}", score).replace("{total}", questions.length)}
          </span>
          <span className="text-[11px] font-bold font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full inline-block mx-auto mt-1">
            {t("xpEarnedAmount").replace("{xp}", xpEarned)}
          </span>
        </div>
        <div className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 mt-2">
          Course Completed!
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-6 mt-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-1">
          {[...Array(3)].map((_, i) => (
            <svg
              key={i}
              className={cn("w-5 h-5", i < lives ? "text-red-500 fill-red-500" : "text-textTertiary")}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ))}
        </div>

        <div className="w-12 h-12 rounded-full border-2 border-purple-500/30 flex items-center justify-center relative">
          <span className="text-xs font-bold font-mono text-textPrimary">{timeLeft}</span>
        </div>

        <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
          +{xpEarned} XP
        </span>
      </div>

      <GlassCard className="p-6 flex flex-col items-center text-center gap-4 border-glassBorder bg-bgSecondary shadow-xl relative animate-fadeIn">
        {currentQuestion.image && typeof currentQuestion.image === 'string' && currentQuestion.image !== "o<" && (currentQuestion.image.startsWith("http") || currentQuestion.image.startsWith("/")) ? (
          <div className="w-full h-48 md:h-56 relative rounded-2xl overflow-hidden shadow-glow-cyan mb-2 border border-white/10 group">
             <img src={currentQuestion.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Question" />
             <div className="absolute inset-0 bg-gradient-to-t from-bgSecondary via-transparent to-transparent opacity-80" />
          </div>
        ) : (
          <div className="w-20 h-20 bg-gradient-cyan rounded-2xl flex items-center justify-center shadow-glow-cyan mb-2">
             <Brain className="w-10 h-10 text-white drop-shadow-md" />
          </div>
        )}
        
        <span className="text-[10px] font-mono text-textTertiary uppercase">
          {t("questionProgress").replace("{current}", currentQuestionIdx + 1).replace("{total}", questions.length)}
        </span>
        <h2 className="text-lg font-extrabold text-textPrimary">{currentQuestion.question}</h2>

        <div className="w-full flex flex-col gap-2 mt-2">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentQuestion.answer;
            const showCorrect = isAnswered && isCorrect;
            const showWrong = isAnswered && isSelected && !isCorrect;

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleAnswer(option)}
                className={cn(
                  "w-full p-4 rounded-xl text-sm font-semibold transition-all border flex items-center justify-between",
                  !isAnswered && !isSelected
                    ? "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-purple-500/50 text-textSecondary hover:text-textPrimary hover:-translate-y-0.5"
                    : "",
                  showCorrect
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    : "",
                  showWrong
                    ? "bg-red-500/20 border-red-500 text-red-400"
                    : "",
                  isAnswered && !isSelected && !isCorrect
                    ? "bg-white/[0.01] border-white/[0.02] text-textTertiary opacity-50"
                    : ""
                )}
              >
                <span>{option}</span>
                {showCorrect && <Check className="w-4 h-4" />}
                {showWrong && <X className="w-4 h-4" />}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <button
            onClick={handleNext}
            className="w-full mt-2 py-3 bg-gradient-brand text-white font-bold text-xs rounded-xl hover:shadow-glow-purple flex items-center justify-center gap-1 transition-all duration-300 active:scale-97 animate-fadeIn"
          >
            <span>{currentQuestionIdx < questions.length - 1 ? t("nextQuestion") : "Finish Course Quiz"}</span>
          </button>
        )}
      </GlassCard>
    </div>
  );
}
