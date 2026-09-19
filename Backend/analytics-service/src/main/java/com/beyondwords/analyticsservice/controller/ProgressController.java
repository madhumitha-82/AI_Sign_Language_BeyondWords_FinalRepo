package com.beyondwords.analyticsservice.controller;

import com.beyondwords.analyticsservice.document.SharedBadge;
import com.beyondwords.analyticsservice.document.SpeechSession;
import com.beyondwords.analyticsservice.dto.*;
import com.beyondwords.analyticsservice.entity.UserActivityLog;
import com.beyondwords.analyticsservice.entity.UserProgress;
import com.beyondwords.analyticsservice.repository.SpeechSessionRepository;
import com.beyondwords.analyticsservice.repository.UserActivityLogRepository;
import com.beyondwords.analyticsservice.repository.UserProgressRepository;
import com.beyondwords.analyticsservice.service.ProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProgressController {
    private final ProgressService progressService;
    private final UserProgressRepository progressRepository;
    private final UserActivityLogRepository activityLogRepository;
    private final SpeechSessionRepository speechSessionRepository;

    // ─────────────────────────────────────────────────────────
    // EXISTING ENDPOINTS
    // ─────────────────────────────────────────────────────────

    @PostMapping("/progress/lessons/{lessonId}/complete")
    public ProgressResponseDto completeLesson(@AuthenticationPrincipal String userEmail,
                                              @PathVariable Long lessonId) {
        try { return progressService.completeLesson(userEmail, lessonId); } catch (Exception e) { try { java.nio.file.Files.writeString(java.nio.file.Paths.get("C:/Users/Madhumitha G/OneDrive/Desktop/AI-Sign-Language-Project/error.txt"), e.toString() + "\n" + java.util.Arrays.toString(e.getStackTrace())); } catch (Exception ex) {} throw e; }
    }

    @GetMapping("/progress/heatmap")
    public Map<String, Integer> getHeatmap(@AuthenticationPrincipal String userEmail) {
        return progressService.getHeatmap(userEmail);
    }

    @GetMapping("/progress/summary")
    public ProgressSummaryDto getSummary(@AuthenticationPrincipal String userEmail) {
        return progressService.getSummary(userEmail);
    }

    @GetMapping("/leaderboard/{timeframe}")
    public List<LeaderboardEntryDto> getLeaderboard(@PathVariable String timeframe) {
        return progressService.getLeaderboard(timeframe);
    }

    @PostMapping("/progress/activity")
    public Map<String, Object> logActivity(@AuthenticationPrincipal String userEmail,
                                           @Valid @RequestBody ActivityLogRequestDto request) {
        progressService.logActivity(userEmail, request);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Activity logged successfully");
        return response;
    }

    @DeleteMapping("/progress/me")
    public void deleteMyProgress(@AuthenticationPrincipal String userEmail) {
        progressService.deleteUserProgress(userEmail);
    }

    // ─────────────────────────────────────────────────────────
    // HISTORY ENDPOINTS (new — needed by History.jsx)
    // ─────────────────────────────────────────────────────────

    /** GET /api/progress/history
     *  Returns combined history payload for the History page.
     */
    @GetMapping("/progress/history")
    public Map<String, Object> getHistory(@AuthenticationPrincipal String userEmail) {
        Map<String, Object> history = new HashMap<>();
        history.put("learning", getLearningHistory(userEmail));
        history.put("quizAttempts", getQuizHistory(userEmail));
        history.put("speechSessions", getSpeechHistory(userEmail));
        return history;
    }

    /** GET /api/progress/history/learning
     *  Returns list of completed lesson records for the user.
     */
    @GetMapping("/progress/history/learning")
    public List<Map<String, Object>> getLearningHistory(@AuthenticationPrincipal String userEmail) {
        List<UserProgress> records = progressRepository.findByUserEmail(userEmail);
        return records.stream().map(r -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", r.getId());
            m.put("lessonId", r.getLessonId());
            m.put("completedAt", r.getCompletedAt());
            m.put("xpEarned", 20); // 20 XP per lesson (matches ProgressServiceImpl.LESSON_XP)
            return m;
        }).collect(Collectors.toList());
    }

    /** GET /api/progress/history/quizzes
     *  Returns all quiz-attempt activity logs for the user.
     */
    @GetMapping("/progress/history/quizzes")
    public List<Map<String, Object>> getQuizHistory(@AuthenticationPrincipal String userEmail) {
        List<UserActivityLog> logs = activityLogRepository
                .findByUserEmailOrderByTimestampDesc(userEmail)
                .stream()
                .filter(l -> "attempt_quiz".equals(l.getActivityType()) || "QUIZ_SUBMIT".equals(l.getActivityType()))
                .collect(Collectors.toList());

        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

        return logs.stream().map(l -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", l.getId());
            m.put("activityType", l.getActivityType());
            m.put("date", l.getTimestamp());
            
            // Default values
            m.put("levelName", "Quiz Level");
            m.put("score", 0);
            m.put("accuracy", 0);
            m.put("totalQuestions", 0);
            m.put("timeTaken", "0s");
            m.put("xpEarned", 0);

            if (l.getDetail() != null && l.getDetail().startsWith("{")) {
                try {
                    com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(l.getDetail());
                    if (node.has("score")) m.put("score", node.get("score").asInt());
                    if (node.has("accuracy")) m.put("accuracy", node.get("accuracy").asInt());
                    if (node.has("totalQuestions")) m.put("totalQuestions", node.get("totalQuestions").asInt());
                    if (node.has("levelId")) m.put("levelName", "Level " + node.get("levelId").asText());
                    if (node.has("xpEarned")) m.put("xpEarned", node.get("xpEarned").asInt());
                    if (node.has("timeTaken")) m.put("timeTaken", node.get("timeTaken").asText());
                } catch (Exception e) {}
            }
            
            // Fallback for timeTaken
            if ("0s".equals(m.get("timeTaken"))) {
                Integer timeSpent = l.getTimeSpentSeconds();
                if (timeSpent != null && timeSpent > 0) {
                    m.put("timeTaken", timeSpent + "s");
                } else {
                    m.put("timeTaken", "< 1m");
                }
            }

            return m;
        }).collect(Collectors.toList());
    }

    /** POST /api/progress/history/speech
     *  Save a speech (speech-to-text or text-to-speech) session.
     */
    @PostMapping("/progress/history/speech")
    public Map<String, Object> saveSpeechSession(@AuthenticationPrincipal String userEmail,
                                                  @RequestBody Map<String, Object> body) {
        SpeechSession session = new SpeechSession();
        session.setUserEmail(userEmail);
        session.setType((String) body.getOrDefault("type", "speech_to_text"));
        session.setContent((String) body.getOrDefault("content", ""));
        session.setWordCount(body.containsKey("wordCount") ? ((Number) body.get("wordCount")).intValue() : 0);
        session.setDurationSeconds(body.containsKey("durationSeconds") ? ((Number) body.get("durationSeconds")).intValue() : 0);
        session.setTimestamp(LocalDateTime.now());
        speechSessionRepository.save(session);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Speech session saved");
        return response;
    }

    /** GET /api/progress/history/speech
     *  Returns all saved speech sessions for the user.
     */
    @GetMapping("/progress/history/speech")
    public List<SpeechSession> getSpeechHistory(@AuthenticationPrincipal String userEmail) {
        return speechSessionRepository.findAllByUserEmailOrderByTimestampDesc(userEmail);
    }

    /** GET /api/progress/badges
     *  Returns badges earned by the user (based on completed lessons count milestones).
     */
    @GetMapping("/progress/badges")
    public List<Map<String, Object>> getUserBadges(@AuthenticationPrincipal String userEmail) {
        long completedCount = progressRepository.countByUserEmail(userEmail);

        List<Map<String, Object>> badges = new java.util.ArrayList<>();

        if (completedCount >= 1) {
            badges.add(badge("First Step", "🎯", "Bronze", "Complete your first lesson", 50));
        }
        if (completedCount >= 5) {
            badges.add(badge("Getting Started", "⭐", "Bronze", "Complete 5 lessons", 100));
        }
        if (completedCount >= 10) {
            badges.add(badge("On a Roll", "🔥", "Silver", "Complete 10 lessons", 200));
        }
        if (completedCount >= 25) {
            badges.add(badge("Dedicated Learner", "📚", "Silver", "Complete 25 lessons", 300));
        }
        if (completedCount >= 50) {
            badges.add(badge("ASL Expert", "🏆", "Gold", "Complete 50 lessons", 500));
        }
        if (completedCount >= 100) {
            badges.add(badge("Sign Language Master", "👑", "Platinum", "Complete 100 lessons", 1000));
        }

        return badges;
    }

    /** POST /api/progress/badges/share
     *  Generates a shareable link for a badge.
     */
    @PostMapping("/progress/badges/share")
    public Map<String, Object> shareBadge(@AuthenticationPrincipal String userEmail,
                                          @RequestBody Map<String, Object> body) {
        SharedBadge shared = progressService.shareBadge(userEmail, body);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("shareId", shared.getId());
        return response;
    }

    /** GET /api/public/shared-badge/{shareId}
     *  Public endpoint to view a shared badge without auth.
     */
    @GetMapping("/public/shared-badge/{shareId}")
    public SharedBadge getSharedBadge(@PathVariable String shareId) {
        return progressService.getSharedBadge(shareId);
    }

    private Map<String, Object> badge(String name, String icon, String tier, String criteria, int xpReward) {
        Map<String, Object> b = new HashMap<>();
        b.put("name", name);
        b.put("icon", icon);
        b.put("tier", tier);
        b.put("criteria", criteria);
        b.put("xpReward", xpReward);
        b.put("status", "active");
        return b;
    }
}
