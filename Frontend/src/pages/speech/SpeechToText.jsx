import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Copy, Save, Globe, Share2, History, Check, AlertCircle } from "lucide-react";
import { GlassCard } from "../../components/shared/GlassCard";
import { GradientBadge } from "../../components/shared/GradientBadge";
import { useApp } from "../../context/AppContext";
import { analyticsApi } from "../../lib/api";
import { cn } from "../../lib/utils";

export function SpeechToText() {
  const { addSpeechSession, t } = useApp();
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState("English (US)");
  const [transcription, setTranscription] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Timer for recording
  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    let recognition = null;
    
    if (isRecording) {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      // map "English (US)" to "en-US" etc if needed
      recognition.lang = language === "English (US)" ? "en-US" : language === "Spanish" ? "es-ES" : "fr-FR";

      recognition.onresult = (event) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscription(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognition.start();
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isRecording, language]);

  const handleStartStop = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTranscription("");
      setSeconds(0);
      setSaved(false);
    } else {
      setIsRecording(false);
    }
  };

  const handleCopy = () => {
    if (!transcription) return;
    navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!transcription || saved) return;
    const words = transcription.split(" ").length;
    
    try {
      await analyticsApi.post("/api/progress/history/speech", {
        type: "speech_to_text",
        content: transcription,
        wordCount: words,
        durationSeconds: seconds
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save session:", err);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col gap-6 max-w-3xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-xl font-bold text-textPrimary">{t("speechToTextTitle")}</h2>
          <p className="text-xs text-textSecondary">
            {t("speechToTextDesc")}
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-textTertiary" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-bgTertiary border border-white/10 hover:border-white/20 text-xs text-textSecondary rounded-xl px-3 py-1.5 outline-none cursor-pointer"
          >
            <option>English (US)</option>
            <option>Spanish (ES)</option>
            <option>French (FR)</option>
            <option>German (DE)</option>
          </select>
        </div>
      </div>

      {/* Main Waveform Card */}
      <GlassCard
        className={cn(
          "p-8 flex flex-col items-center gap-6 relative overflow-hidden transition-all duration-500",
          isRecording ? "border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.15)] bg-red-500/[0.01]" : "border-white/[0.08]"
        )}
      >
        {/* Animated sine wave or vertical equalizer lines */}
        <div className="h-24 w-full flex items-center justify-center gap-1 max-w-sm mt-4 select-none">
          {[...Array(24)].map((_, i) => {
            // Randomize speed/delay of pulse for natural look
            const delay = `${(i % 5) * 0.15}s`;
            const duration = isRecording ? `${0.6 + Math.random() * 0.6}s` : "0s";
            return (
              <div
                key={i}
                className={cn(
                  "w-1 h-3 rounded-full transition-all duration-300",
                  isRecording ? "bg-red-400/80" : "bg-white/[0.05]"
                )}
                style={{
                  height: isRecording ? `${20 + Math.random() * 60}%` : "12px",
                  animation: isRecording ? "waveform-pulse 1.2s ease-in-out infinite" : "none",
                  animationDelay: delay,
                  animationDuration: duration,
                }}
              />
            );
          })}
        </div>

        {/* Timer */}
        <div className="font-mono text-lg font-bold text-textPrimary mt-2">
          {isRecording ? formatTime(seconds) : "00:00"}
        </div>

        {/* Central mic button */}
        <button
          onClick={handleStartStop}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center border transition-all duration-500 z-10 active:scale-95 shadow-lg",
            isRecording
              ? "bg-red-500/20 border-red-500/60 text-red-400 animate-pulse-ring"
              : "bg-white/[0.03] border-white/[0.09] text-textSecondary hover:text-textPrimary hover:bg-white/[0.06] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
          )}
        >
          {isRecording ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
        </button>

        <span className="text-xs text-textSecondary select-none">
          {isRecording ? t("stopTranscription") : t("startRecording")}
        </span>
      </GlassCard>

      {/* Live Transcription Output Area */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-textPrimary uppercase tracking-wider font-mono">{t("transcriptionFeed")}</span>
        <GlassCard className="p-5 min-h-40 flex flex-col justify-between">
          <div className="text-sm font-mono leading-relaxed text-textSecondary whitespace-pre-wrap select-text">
            {transcription || (
              <span className="text-textTertiary italic">
                {t("transcriptionPlaceholder")}
              </span>
            )}
          </div>

          {/* Action Bar */}
          {transcription && (
            <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-white/[0.06]">
              {/* Copy */}
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.12] rounded-xl text-xs text-textSecondary hover:text-textPrimary transition-all flex items-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? t("copied") : t("copy")}</span>
              </button>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={saved}
                className="px-3.5 py-2 bg-gradient-cyan hover:shadow-glow-cyan disabled:opacity-40 disabled:hover:shadow-none text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{saved ? t("savedToHistory") : t("saveSession")}</span>
              </button>
            </div>
          )}
        </GlassCard>
      </div>
    </motion.div>
  );
}
