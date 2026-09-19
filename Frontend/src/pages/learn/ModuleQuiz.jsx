import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, HelpCircle, ArrowRight, Play, Trophy, Sparkles } from "lucide-react";

import { useProgress } from "../../hooks/useProgress";
import { useXP } from "../../hooks/useXP";

export function ModuleQuiz({ moduleId, onComplete }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const { completeLesson } = useProgress();
  const { addXP } = useXP();

  // The PDF dataset only specifies course-level quizzes, so module-level quizzes are empty.
  const questions = [];

  if (questions.length === 0) {
    return (
      <div className="p-6 text-center text-textTertiary bg-white/[0.02] border border-white/[0.05] rounded-xl mt-4">
        <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No quiz questions available for this module yet.</p>
      </div>
    );
  }

  const q = questions[currentQ];

  const handleSelect = (opt) => {
    if (isAnswered) return;
    setSelected(opt);
    setIsAnswered(true);
    if (opt === q.answer) {
      setScore((s) => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setIsAnswered(false);
    } else {
      // Quiz finished
      setShowResults(true);
      const passPercent = (score / questions.length) * 100;
      if (passPercent >= 50) {
        // Just generic complete info for module quiz
        completeLesson(900 + moduleId, moduleId, `Module ${moduleId} Quiz`, `Module ${moduleId}`, 10);
        addXP(20); 
      }
      if (onComplete) onComplete(score);
    }
  };

  if (showResults) {
    const percent = Math.round((score / questions.length) * 100);
    const passed = percent >= 50;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-6 p-6 md:p-8 bg-gradient-to-br from-bgSecondary to-bgTertiary border border-white/10 rounded-2xl text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand/20 blur-[50px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-accent/20 blur-[50px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-glow-purple bg-gradient-brand">
            {passed ? <Trophy className="w-10 h-10 text-white" /> : <Sparkles className="w-10 h-10 text-white" />}
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2">
            {passed ? "Module Mastered!" : "Good Try!"}
          </h3>
          <p className="text-textSecondary mb-6">
            You scored <span className="font-bold text-white">{score}</span> out of {questions.length} ({percent}%)
          </p>

          <button
            onClick={() => {
              setCurrentQ(0);
              setSelected(null);
              setIsAnswered(false);
              setScore(0);
              setShowResults(false);
            }}
            className="px-6 py-3 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-xl text-white font-medium transition-all inline-flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Retake Quiz
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-5 md:p-6 bg-black/20 border border-white/5 rounded-2xl shadow-inner relative"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand" />
          Module {moduleId} Quiz
        </h3>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentQ
                  ? "w-4 bg-brand"
                  : i < currentQ
                  ? "w-2 bg-brand/50"
                  : "w-2 bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-[15px] font-medium text-white/90 leading-relaxed">
          {q.question}
        </h4>
      </div>

      <div className="space-y-2.5 mb-6">
        {q.options.map((opt, i) => {
          const isSelected = selected === opt;
          const isCorrect = opt === q.answer;
          
          let stateClass = "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20";
          if (isAnswered) {
            if (isCorrect) stateClass = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
            else if (isSelected) stateClass = "bg-red-500/10 border-red-500/30 text-red-400";
            else stateClass = "bg-white/[0.02] border-white/5 opacity-50";
          } else if (isSelected) {
            stateClass = "bg-brand/20 border-brand/50 text-white";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              disabled={isAnswered}
              className={`w-full text-left p-3.5 md:p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${stateClass}`}
            >
              <span>{opt}</span>
              {isAnswered && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
              {isAnswered && isSelected && !isCorrect && <X className="w-4 h-4 text-red-400" />}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex justify-end"
          >
            <button
              onClick={nextQuestion}
              className="px-6 py-2.5 bg-gradient-brand hover:shadow-glow-purple text-white font-bold rounded-xl flex items-center gap-2 transition-all active:scale-95"
            >
              {currentQ < questions.length - 1 ? "Next Question" : "Finish Quiz"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
