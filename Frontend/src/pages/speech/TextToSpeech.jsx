import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, Pause, RotateCcw, Download, Sparkles, Check } from "lucide-react";
import { GlassCard } from "../../components/shared/GlassCard";
import { useApp } from "../../context/AppContext";
import { analyticsApi } from "../../lib/api";

export function TextToSpeech() {
  const { addSpeechSession, t } = useApp();
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [voicesList, setVoicesList] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);

  // Load system voices
  useEffect(() => {
    if ("speechSynthesis" in window) {
      const loadVoices = () => {
        const list = window.speechSynthesis.getVoices();
        setVoicesList(list);
        if (list.length > 0) {
          // Default to first English voice or first voice in list
          const defaultVoice = list.find((v) => v.lang.startsWith("en")) || list[0];
          setVoice(defaultVoice.name);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);


  const handleSpeak = () => {
    if (!text.trim()) return;

    if ("speechSynthesis" in window) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsSpeaking(true);
        setIsPaused(false);
        return;
      }

      window.speechSynthesis.cancel(); // Stop current speech

      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoiceObj = voicesList.find((v) => v.name === voice);
      if (selectedVoiceObj) utterance.voice = selectedVoiceObj;
      utterance.rate = rate;
      utterance.pitch = pitch;

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePause = () => {
    if ("speechSynthesis" in window && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    }
  };

  const handleReset = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setText("");
    }
  };

  const handleSave = async () => {
    if (!text.trim() || sessionSaved) return;
    const words = text.split(" ").length;
    
    try {
      await analyticsApi.post("/api/progress/history/speech", {
        type: "text_to_speech",
        content: text,
        wordCount: words,
        durationSeconds: 4 // approx
      });
      setSessionSaved(true);
      setTimeout(() => setSessionSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save session:", err);
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col gap-6 max-w-3xl mx-auto"
    >
      <div className="flex flex-col gap-0.5 border-b border-white/[0.08] pb-4">
        <h2 className="text-xl font-bold text-textPrimary">{t("textToSpeechTitle")}</h2>
        <p className="text-xs text-textSecondary">
          {t("textToSpeechDesc")}
        </p>
      </div>

      {/* Editor & Controls Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Editor Area (2/3 width) */}
        <div className="md:col-span-2 flex flex-col gap-3">
          <GlassCard className="p-4 flex-grow flex flex-col min-h-64 justify-between border-purple-500/10 focus-within:border-purple-500/30 transition-all">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("typeHerePlaceholder")}
              className="w-full h-full min-h-48 bg-transparent border-0 outline-none text-sm text-textPrimary placeholder-textTertiary resize-none leading-relaxed"
            />
            {/* Word and character metrics */}
            <div className="flex justify-between items-center text-[10px] text-textTertiary border-t border-white/[0.05] pt-3 select-none">
              <span>{t("wordsChars").replace("{words}", wordCount).replace("{chars}", text.length)}</span>
              <span className="font-mono">BeyondWords Text Engine</span>
            </div>
          </GlassCard>
        </div>

        {/* Controls Area (1/3 width) */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-5 flex flex-col gap-4">
            <span className="text-xs font-bold text-textPrimary uppercase tracking-wider border-b border-white/[0.06] pb-2">
              {t("voiceParams")}
            </span>

            {/* Voice select */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-textTertiary uppercase font-mono">{t("voiceSynthesizer")}</label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="w-full bg-bgTertiary border border-white/10 text-xs text-textSecondary rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                {voicesList.map((v, idx) => (
                  <option key={idx} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Speed slider */}
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex justify-between text-[10px] font-bold text-textTertiary uppercase font-mono">
                <span>{t("speedRate")}</span>
                <span className="text-purple-400 font-mono">{rate}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/[0.06] rounded-full appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Pitch slider */}
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex justify-between text-[10px] font-bold text-textTertiary uppercase font-mono">
                <span>{t("vocalPitch")}</span>
                <span className="text-purple-400 font-mono">{pitch}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/[0.06] rounded-full appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-3">
        {/* Play/Pause toggle */}
        <button
          onClick={handleSpeak}
          disabled={!text.trim()}
          className="flex-1 py-3 bg-gradient-brand hover:shadow-glow-purple disabled:opacity-40 disabled:hover:shadow-none text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
        >
          <Volume2 className="w-4 h-4 fill-white" />
          <span>{isPaused ? t("resumeSpeech") : t("speakText")}</span>
        </button>

        {isSpeaking && (
          <button
            onClick={handlePause}
            className="px-4 py-3 border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] text-textSecondary hover:text-textPrimary rounded-xl transition-all"
          >
            <Pause className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={handleReset}
          disabled={!text}
          className="px-4 py-3 border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] text-textSecondary hover:text-textPrimary rounded-xl transition-all"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Save Session */}
        <button
          onClick={handleSave}
          disabled={!text.trim() || sessionSaved}
          className="px-5 py-3 bg-gradient-cyan hover:shadow-glow-cyan disabled:opacity-40 disabled:hover:shadow-none text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
        >
          {sessionSaved ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          <span>{sessionSaved ? t("saved") : t("saveAudio")}</span>
        </button>
      </div>
    </motion.div>
  );
}
