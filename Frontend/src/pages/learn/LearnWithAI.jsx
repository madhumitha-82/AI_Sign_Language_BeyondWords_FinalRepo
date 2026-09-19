import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RefreshCw, CheckCircle, Info, Zap, Cpu, Sparkles, Flame, Check, HelpCircle, AlertTriangle } from "lucide-react";
import { GlassCard } from "../../components/shared/GlassCard";
import { GradientBadge } from "../../components/shared/GradientBadge";
import { useApp } from "../../context/AppContext";
import { analyticsApi } from "../../lib/api";
import { cn } from "../../lib/utils";

export function LearnWithAI() {
  const { addXP, t } = useApp();
  const [targetSign, setTargetSign] = useState("0");
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionDone, setRecognitionDone] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isMatch, setIsMatch] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [detectedSign, setDetectedSign] = useState("");

  // Local session stats
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const videoRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(false);

  const practiceSigns = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  // Handle Sign Practice Selection
  const handleSelectSign = (sign) => {
    setTargetSign(sign);
    setRecognitionDone(false);
    setShowToast(false);
    setConfidence(0);
    setDetectedSign("");
  };

  // Setup Webcam
  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCamera(true);
        }
      } catch (err) {
        console.error("No camera available, falling back to simulation.", err);
      }
    };
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  // Simulate Skeletal joint tracking rendering on Canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Fit canvas resolution to parent bounds
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const joints = [
      { id: 0, x: 0.5, y: 0.85, targetX: 0.5, targetY: 0.85 }, // Wrist
      { id: 1, x: 0.35, y: 0.7, targetX: 0.35, targetY: 0.7 }, // Thumb knuckle
      { id: 2, x: 0.28, y: 0.6, targetX: 0.28, targetY: 0.6 }, // Thumb tip
      { id: 3, x: 0.42, y: 0.55, targetX: 0.42, targetY: 0.55 }, // Index knuckle
      { id: 4, x: 0.4, y: 0.4, targetX: 0.4, targetY: 0.4 }, // Index mid
      { id: 5, x: 0.38, y: 0.3, targetX: 0.38, targetY: 0.3 }, // Index tip
      { id: 6, x: 0.5, y: 0.52, targetX: 0.5, targetY: 0.52 }, // Middle knuckle
      { id: 7, x: 0.5, y: 0.36, targetX: 0.5, targetY: 0.36 }, // Middle mid
      { id: 8, x: 0.5, y: 0.25, targetX: 0.5, targetY: 0.25 }, // Middle tip
      { id: 9, x: 0.58, y: 0.55, targetX: 0.58, targetY: 0.55 }, // Ring knuckle
      { id: 10, x: 0.6, y: 0.42, targetX: 0.6, targetY: 0.42 }, // Ring mid
      { id: 11, x: 0.62, y: 0.32, targetX: 0.62, targetY: 0.32 }, // Ring tip
      { id: 12, x: 0.65, y: 0.62, targetX: 0.65, targetY: 0.62 }, // Pinky knuckle
      { id: 13, x: 0.7, y: 0.52, targetX: 0.7, targetY: 0.52 }, // Pinky mid
      { id: 14, x: 0.73, y: 0.45, targetX: 0.73, targetY: 0.45 }, // Pinky tip
    ];

    let t = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.05;

      const w = canvas.width;
      const h = canvas.height;

      // Draw futuristic mesh coordinates network
      ctx.strokeStyle = "rgba(99, 102, 241, 0.05)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < w; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      for (let j = 0; j < h; j += 30) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(w, j);
        ctx.stroke();
      }

      // Update positions with subtle floating/scanning hover
      joints.forEach((joint) => {
        const floatAmp = isRecognizing ? 8 : 2;
        const speed = isRecognizing ? 3 : 1;

        joint.x = joint.targetX + Math.sin(t * speed + joint.id) * (floatAmp / w);
        joint.y = joint.targetY + Math.cos(t * speed + joint.id) * (floatAmp / h);
      });

      // Draw skeleton connecting lines
      ctx.strokeStyle = isRecognizing ? "rgba(139, 92, 246, 0.6)" : "rgba(99, 102, 241, 0.2)";
      ctx.lineWidth = isRecognizing ? 2 : 1;

      const drawBone = (j1, j2) => {
        ctx.beginPath();
        ctx.moveTo(joints[j1].x * w, joints[j1].y * h);
        ctx.lineTo(joints[j2].x * w, joints[j2].y * h);
        ctx.stroke();
      };

      // Connect palm wrist to knuckles
      drawBone(0, 1);
      drawBone(0, 3);
      drawBone(0, 6);
      drawBone(0, 9);
      drawBone(0, 12);

      // Connect fingers
      drawBone(1, 2); // Thumb
      drawBone(3, 4); drawBone(4, 5); // Index
      drawBone(6, 7); drawBone(7, 8); // Middle
      drawBone(9, 10); drawBone(10, 11); // Ring
      drawBone(12, 13); drawBone(13, 14); // Pinky

      // Draw joints
      joints.forEach((joint) => {
        ctx.beginPath();
        ctx.arc(joint.x * w, joint.y * h, isRecognizing ? 4 : 3, 0, 2 * Math.PI);
        ctx.fillStyle = isRecognizing ? "#a855f7" : "#6366f1";
        ctx.fill();

        if (isRecognizing) {
          ctx.beginPath();
          ctx.arc(joint.x * w, joint.y * h, 8, 0, 2 * Math.PI);
          ctx.strokeStyle = "rgba(168, 85, 247, 0.2)";
          ctx.stroke();
        }
      });

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationRef.current);
  }, [isRecognizing]);

  const handleStartRecognition = async () => {
    if (isRecognizing) return;

    setIsRecognizing(true);
    setRecognitionDone(false);
    setShowToast(false);
    setConfidence(0);
    setDetectedSign("");

    try {
      let b64 = "...";
      if (videoRef.current && hasCamera) {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = videoRef.current.videoWidth || 640;
        tempCanvas.height = videoRef.current.videoHeight || 480;
        const tctx = tempCanvas.getContext("2d");
        tctx.drawImage(videoRef.current, 0, 0, tempCanvas.width, tempCanvas.height);
        b64 = tempCanvas.toDataURL("image/jpeg");
      }

      // Simulate real latency + API call
      const res = await analyticsApi.post("/api/ai/recognize", {
        frameData: b64,
        timestamp: Date.now(),
        expectedLabel: targetSign
      });
      
      const { recognizedLabel: predictedLabel, confidence: confidenceScore, isCorrect, xpAwarded } = res.data;

      setIsRecognizing(false);
      setRecognitionDone(true);
      setShowToast(true);

      const finalConf = Math.round(confidenceScore * 100);
      setConfidence(finalConf);

      const match = (predictedLabel === targetSign) || isCorrect;
      setIsMatch(match);
      setDetectedSign(predictedLabel);

      if (match) {
        setCorrect((prev) => prev + 1);
        const earned = xpAwarded || 50;
        setXpEarned((prev) => prev + earned);
        addXP(earned);
      }

      setAttempts((prev) => prev + 1);
      setAvgConfidence((prev) => Math.round((prev * attempts + finalConf) / (attempts + 1)));

      setTimeout(() => setShowToast(false), 4000);
    } catch (err) {
      console.error("AI Recognition error:", err);
      setIsRecognizing(false);
    }
  };

  const handleResetSession = () => {
    setAttempts(0);
    setCorrect(0);
    setAvgConfidence(0);
    setXpEarned(0);
    setRecognitionDone(false);
    setShowToast(false);
    setConfidence(0);
    setDetectedSign("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col gap-4 min-h-full overflow-y-auto"
    >
      <div className="flex flex-col gap-1 border-b border-white/[0.08] pb-3 shrink-0">
        <h2 className="text-xl font-bold text-textPrimary">{t("recognitionTitle")}</h2>
        <p className="text-xs text-textSecondary">
          {t("recognitionDesc")}
        </p>
      </div>

      <div className="grid gap-4 flex-1 min-h-0 grid-cols-1 lg:grid-cols-3">
        {/* Left: Camera frame & skeleton view */}
        <div className="flex flex-col gap-3 min-h-0 lg:col-span-2">
          
          <GlassCard className="relative overflow-hidden flex-1 min-h-[300px] sm:min-h-[400px] bg-[#050508] border border-white/10 flex flex-col justify-between p-4 shadow-2xl">
              {/* Webcam Video Stream */}
              <div className="absolute inset-0 z-0">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80 scale-x-[-1]" />
              </div>

              {/* Simulated camera feed canvas (skeletal overlay drawing) */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                <canvas ref={canvasRef} className="w-full h-full object-cover" />
              </div>

              {/* Top Bar inside Camera */}
              <div className="relative z-20 flex justify-between items-center bg-black/40 px-4 py-2 rounded-xl backdrop-blur-md border border-white/5">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-black/50 border border-white/10 rounded-full text-[10px] text-white/80 font-mono backdrop-blur">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold tracking-wider uppercase">{t("cameraReady")}</span>
                </div>
                <GradientBadge
                  label={t("islMode")}
                  gradient="cyan"
                />
              </div>

              {/* Target vs Detected overlays inside the camera view */}
              <div className="absolute top-16 inset-x-4 flex justify-between z-20 pointer-events-none">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-cyan-400 drop-shadow-md">Target Sign</span>
                  <span className="text-sm font-bold font-mono text-white bg-black/40 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                    {targetSign}
                  </span>
                </div>
                
                <AnimatePresence>
                  {detectedSign && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex flex-col gap-1 items-end"
                    >
                      <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 drop-shadow-md">Detected</span>
                      <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1 rounded-lg backdrop-blur-sm border border-emerald-500/30">
                        <span className="text-sm font-bold font-mono text-emerald-300">{detectedSign}</span>
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Scanning animation while recognizing */}
              <AnimatePresence>
                {isRecognizing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[5] pointer-events-none"
                  >
                    <motion.div
                      animate={{ y: ["0%", "100%", "0%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_12px_rgba(168,85,247,0.5)]"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom Confidence bar */}
              <div className="w-full z-10 relative flex flex-col gap-1 bg-black/40 border border-white/[0.06] p-3 rounded-2xl backdrop-blur">
                <div className="flex justify-between items-baseline text-[10px] font-bold font-mono text-textSecondary">
                  <span>{t("recognitionConfidence")}</span>
                  <span className={cn("font-bold transition-colors", recognitionDone ? "text-emerald-400" : "text-textTertiary")}>
                    {isRecognizing ? t("calculating") : recognitionDone ? `${confidence}%` : "---"}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.06]">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      recognitionDone ? "bg-gradient-green" : "bg-gradient-brand"
                    )}
                    initial={false}
                    animate={{
                      width: isRecognizing ? "40%" : recognitionDone ? `${confidence}%` : "0%",
                    }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                </div>
              </div>
          </GlassCard>

          {/* Action button (now moved here for all screens) */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <button
              onClick={handleStartRecognition}
              disabled={isRecognizing}
              className={cn(
                "w-full py-3 bg-gradient-brand hover:shadow-glow-purple disabled:opacity-40 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all",
                isRecognizing && "animate-pulse"
              )}
            >
              <Camera className="w-4 h-4" />
              <span>
                {isRecognizing ? t("recognizingGestures") : "Start Testing"}
              </span>
            </button>
          </div>
        </div>

        {/* Right Sidebar Details (1/3 width) */}
        <div className="flex flex-col gap-6 lg:fixed lg:right-6 lg:top-24 lg:w-[320px] lg:bottom-6 lg:overflow-y-auto no-scrollbar">
          {/* Signs to Practice chips */}
          <GlassCard className="p-5 flex flex-col gap-3.5">
            <div className="flex items-center gap-1.5 border-b border-white/[0.06] pb-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">{t("signsToPractice")}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {practiceSigns.map((sign) => (
                <button
                  key={sign}
                  onClick={() => handleSelectSign(sign)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono transition-all border",
                    targetSign === sign
                      ? "bg-gradient-cyan border-cyan-500/20 text-white shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                      : "bg-white/[0.02] border-white/[0.06] text-textSecondary hover:text-textPrimary hover:bg-white/[0.04]"
                  )}
                >
                  {sign}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Session Stats */}
          <GlassCard className="p-5 flex flex-col gap-3.5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">{t("sessionStats")}</span>
              <span className="text-[9px] font-bold text-emerald-400 font-mono bg-emerald-400/10 px-1.5 py-0.5 rounded">
                {t("liveSession")}
              </span>
            </div>
            <div className="flex flex-col gap-2.5 font-mono text-[11px]">
              <div className="flex justify-between items-center text-textSecondary">
                <span>{t("attempts")}</span>
                <span className="text-textPrimary font-bold">{attempts}</span>
              </div>
              <div className="flex justify-between items-center text-textSecondary">
                <span>{t("correct")}</span>
                <span className="text-emerald-400 font-bold">{correct}</span>
              </div>
              <div className="flex justify-between items-center text-textSecondary">
                <span>{t("avgConfidence")}</span>
                <span className="text-cyan-400 font-bold">{avgConfidence}%</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/[0.04] pt-2 mt-1 text-textSecondary">
                <span>{t("xpEarned")}</span>
                <span className="text-purple-400 font-bold">+{xpEarned} XP</span>
              </div>
            </div>
          </GlassCard>

          {/* AI Feedback info */}
          <GlassCard className="p-5 flex flex-col gap-3.5 border-purple-500/10 shadow-[0_0_15px_rgba(139,92,246,0.05)]">
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-textPrimary uppercase tracking-wider">{t("aiFeedback")}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-textSecondary">
              {t("aiFeedbackDesc")}
            </p>
            <ul className="flex flex-col gap-2 text-[10px] text-textSecondary pl-4 list-disc leading-normal font-medium">
              <li>{t("lightingHelp")}</li>
              <li>{t("handLevelHelp")}</li>
              <li>{t("steadyHelp")}</li>
            </ul>
          </GlassCard>
        </div>
      </div>

      {/* Floating popup — Result Toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className={cn("fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0f0f1f] border rounded-2xl px-5 py-3.5 shadow-[0_16px_36px_rgba(0,0,0,0.5)] flex items-center gap-3 w-max max-w-sm", isMatch ? "border-emerald-500/30" : "border-red-500/30")}
            >
              {isMatch ? <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />}
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white">{isMatch ? t("correctSignDetected") : "Incorrect Sign"}</span>
                <p className="text-[10px] text-textSecondary mt-0.5">
                  {isMatch 
                    ? t("successBannerDesc").replace("{sign}", targetSign).replace("{confidence}", confidence.toString()).replace("{xp}", "50")
                    : `You showed ${detectedSign || 'nothing'}, but the target is ${targetSign}.`}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
}
