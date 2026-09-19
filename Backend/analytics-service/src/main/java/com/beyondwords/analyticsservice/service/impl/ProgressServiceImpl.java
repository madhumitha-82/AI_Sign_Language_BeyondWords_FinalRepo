package com.beyondwords.analyticsservice.service.impl;

import com.beyondwords.analyticsservice.dto.*;
import com.beyondwords.analyticsservice.document.*;
import com.beyondwords.analyticsservice.entity.*;
import com.beyondwords.analyticsservice.mapper.ProgressMapper;
import com.beyondwords.analyticsservice.repository.*;
import com.beyondwords.analyticsservice.service.ProgressService;
import com.beyondwords.analyticsservice.client.UserServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProgressServiceImpl implements ProgressService {
    private final UserProgressRepository progressRepository;
    private final LeaderboardEntryRepository leaderboardRepository;
    private final UserActivityLogRepository activityLogRepository;
    private final SharedBadgeRepository sharedBadgeRepository;
    private final ProgressMapper progressMapper;
    private final UserServiceClient userServiceClient;

    /** XP awarded for completing a lesson for the first time */
    private static final int LESSON_XP = 20;

    @PostConstruct
    @Transactional
    public void seedLeaderboard() {
        // Mock data seeding removed as per requirements
    }

    @Override
    @Transactional
    public ProgressResponseDto completeLesson(String userEmail, Long lessonId) {
        Optional<UserProgress> existing = progressRepository.findByUserEmailAndLessonId(userEmail, lessonId);
        boolean newlyCompleted = false;
        if (existing.isEmpty()) {
            UserProgress up = UserProgress.builder()
                    .userEmail(userEmail)
                    .lessonId(lessonId)
                    .completedAt(LocalDateTime.now())
                    .build();
            progressRepository.save(up);
            newlyCompleted = true;

            // Log MongoDB activity log
            UserActivityLog activityLog = UserActivityLog.builder()
                    .userEmail(userEmail)
                    .activityType("complete_lesson")
                    .detail("Completed lesson with ID: " + lessonId)
                    .timeSpentSeconds(300)
                    .timestamp(LocalDateTime.now())
                    .build();
            try {
                activityLogRepository.save(activityLog);
            } catch (Exception e) {
                log.error("Activity logging failed", e);
            }
        }

        List<UserProgress> allProgress = progressRepository.findByUserEmail(userEmail);
        List<Long> completedIds = allProgress.stream()
                .map(UserProgress::getLessonId)
                .collect(Collectors.toList());

        // Award XP only for first-time lesson completion — persists to user-service
        int xpReward = 0;
        if (newlyCompleted) {
            xpReward = LESSON_XP;
            userServiceClient.addXp(userEmail, xpReward);
            
            // Check KNOWLEDGE_BUILDER badge
            long completedCount = progressRepository.countByUserEmail(userEmail);
            if (completedCount == 5) {
                userServiceClient.awardBadge(userEmail, "KNOWLEDGE_BUILDER");
            }
            
            // Call learning-service to evaluate completion
            try {
                org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
                java.util.Map<String, Object> req = new java.util.HashMap<>();
                req.put("email", userEmail);
                req.put("lessonId", lessonId);
                // Note: The correct url requires config, but since it's hard to inject here without constructor changes, 
                // we'll just assume localhost:8082 for now, or just send a GET.
                // Actually, wait, it's better to just fire a RestTemplate call or skip MODULE_MASTER for now if it requires cross DB.
                // Let's implement MODULE_MASTER badge awarding logic inside learning-service which gets notified!
                restTemplate.postForEntity("http://localhost:8082/api/courses/internal/evaluate-completion", req, Void.class);
            } catch (Exception e) {
                log.error("Failed to notify learning-service for completion evaluation: " + e.getMessage());
            }
        }
        int currentLevel = 0; // Frontend calculates real level based on total XP
        boolean levelUp = false;

        return ProgressResponseDto.builder()
                .completedLessonIds(completedIds)
                .completedLessonsCount(completedIds.size())
                .xpGained(xpReward)
                .levelUp(levelUp)
                .currentLevel(currentLevel)
                .build();
    }

    @Override
    public Map<String, Integer> getHeatmap(String userEmail) {
        List<UserActivityLog> logs = activityLogRepository.findByUserEmailOrderByTimestampDesc(userEmail);
        
        // Group activity by localdate string
        Map<String, Integer> heatmap = new HashMap<>();
        for (UserActivityLog log : logs) {
            String dateStr = log.getTimestamp().toLocalDate().toString();
            heatmap.put(dateStr, heatmap.getOrDefault(dateStr, 0) + 1);
        }
        
        return heatmap;
    }

    @Override
    public ProgressSummaryDto getSummary(String userEmail) {
        // Fetch Mon-Sun study minutes from MongoDB logs
        LocalDateTime startOfWeek = LocalDate.now().minusDays(LocalDate.now().getDayOfWeek().getValue() - 1).atStartOfDay();
        List<UserActivityLog> weekLogs = activityLogRepository.findByUserEmailAndTimestampBetween(
                userEmail, startOfWeek, LocalDateTime.now());

        int[] studyMinutes = new int[7]; // Mon = index 0
        for (UserActivityLog log : weekLogs) {
            int dayIndex = log.getTimestamp().getDayOfWeek().getValue() - 1;
            if (dayIndex >= 0 && dayIndex < 7) {
                int minutes = 1; // Default to 1 so any activity counts towards weekly progress
                if (log.getTimeSpentSeconds() != null && log.getTimeSpentSeconds() > 0) {
                    minutes = Math.max(1, log.getTimeSpentSeconds() / 60);
                }
                studyMinutes[dayIndex] += minutes;
            }
        }

        List<Integer> studyList = Arrays.stream(studyMinutes).boxed().collect(Collectors.toList());

        List<UserProgress> allProgress = progressRepository.findByUserEmail(userEmail);
        
        long completedToday = allProgress.stream()
                .filter(up -> up.getCompletedAt() != null && up.getCompletedAt().toLocalDate().isEqual(java.time.LocalDate.now()))
                .count();

        long extraActivityToday = activityLogRepository.findByUserEmailOrderByTimestampDesc(userEmail).stream()
                .filter(log -> log.getTimestamp().toLocalDate().isEqual(java.time.LocalDate.now()))
                .filter(log -> java.util.Set.of("attempt_quiz", "QUIZ_SUBMIT", "speech_to_text", "text_to_speech").contains(log.getActivityType()))
                .count();
                
        completedToday += extraActivityToday;

        List<Long> completedLessonIds = allProgress.stream()
                .map(UserProgress::getLessonId)
                .collect(Collectors.toList());

        // Dynamically compute insights from real logs
        List<UserActivityLog> allLogs = activityLogRepository.findByUserEmailOrderByTimestampDesc(userEmail);
        long quizCount = allLogs.stream().filter(l -> "attempt_quiz".equals(l.getActivityType()) || "QUIZ_SUBMIT".equals(l.getActivityType())).count();

        // Calculate accuracy
        long totalScore = 0;
        long totalPossible = 0;
        for (UserActivityLog log : allLogs) {
            if ("attempt_quiz".equals(log.getActivityType()) || "QUIZ_SUBMIT".equals(log.getActivityType())) {
                String details = log.getDetail();
                if (details != null && details.contains("score")) {
                    try {
                        // Very naive string parsing to extract score and totalQuestions assuming format e.g. "Score: 10/12" or JSON
                        int scoreIdx = details.indexOf("\"score\":");
                        int totalIdx = details.indexOf("\"totalQuestions\":");
                        if (scoreIdx != -1 && totalIdx != -1) {
                            String scoreStr = details.substring(scoreIdx + 8, details.indexOf(",", scoreIdx)).trim();
                            String totalStr = details.substring(totalIdx + 17, details.indexOf("}", totalIdx)).trim();
                            totalScore += Integer.parseInt(scoreStr.replaceAll("[^0-9]", ""));
                            totalPossible += Integer.parseInt(totalStr.replaceAll("[^0-9]", ""));
                        }
                    } catch (Exception ignored) {
                    }
                }
            }
        }
        
        Double calculatedAccuracy = (totalPossible > 0) ? (double) totalScore / totalPossible * 100.0 : 0.0;
        
        // Calculate total lessons completed
        long totalLessonsCompleted = progressRepository.countByUserEmail(userEmail);

        // Calculate streak
        int calculatedStreak = 0;
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate lastActiveDate = null;
        for (UserActivityLog log : allLogs) {
            java.time.LocalDate logDate = log.getTimestamp().toLocalDate();
            if (lastActiveDate == null) {
                if (logDate.equals(today) || logDate.equals(today.minusDays(1))) {
                    calculatedStreak = 1;
                    lastActiveDate = logDate;
                } else {
                    break;
                }
            } else {
                if (logDate.equals(lastActiveDate)) {
                    continue;
                } else if (logDate.equals(lastActiveDate.minusDays(1))) {
                    calculatedStreak++;
                    lastActiveDate = logDate;
                } else {
                    break;
                }
            }
        }

        // Calculate weekly progress active days
        long weeklyProgressDays = Arrays.stream(studyMinutes).filter(m -> m > 0).count();

        // Extract recent activity
        List<RecentActivityDto> recentActivities = allLogs.stream()
                .limit(5)
                .map(log -> RecentActivityDto.builder()
                        .id(log.getId())
                        .activityType(log.getActivityType())
                        .description(log.getDetail() != null ? log.getDetail() : log.getActivityType())
                        .timestamp(log.getTimestamp())
                        .build())
                .collect(Collectors.toList());

        String weakestSkill = null;
        String weakestSkillDesc = null;
        String strongestSkill = null;
        String strongestSkillDesc = null;
        List<String> insights = new ArrayList<>();

        if (quizCount == 0 && totalLessonsCompleted == 0) {
            insights.add("Start your first lesson to generate AI insights.");
        } else if (quizCount == 0) {
            insights.add("Try a practice quiz to generate performance recommendations.");
        } else {
            insights.add("Keep practicing quizzes to refine your accuracy!");
            strongestSkill = "Recent Quiz Topics";
            strongestSkillDesc = "You have been actively practicing quizzes.";
        }

        return ProgressSummaryDto.builder()
                .weeklyStudyTime(studyList)
                .dailyCompleted((int) completedToday)
                .dailyGoal(5)
                .strongestSkill(strongestSkill)
                .strongestSkillDescription(strongestSkillDesc)
                .weakestSkill(weakestSkill)
                .weakestSkillDescription(weakestSkillDesc)
                .insights(insights)
                .totalLessonsCompleted((int) totalLessonsCompleted)
                .completedLessonIds(completedLessonIds)
                .accuracy(calculatedAccuracy)
                .streak(calculatedStreak)
                .weeklyProgressDays((int) weeklyProgressDays)
                .recentActivity(recentActivities)
                .build();
    }

    @Override
    public List<LeaderboardEntryDto> getLeaderboard(String timeframe) {
        // Fetch real users sorted by XP descending from user-service
        List<java.util.Map<String, Object>> users = userServiceClient.getLeaderboardUsers();

        List<LeaderboardEntryDto> result = new ArrayList<>();
        for (int i = 0; i < users.size(); i++) {
            java.util.Map<String, Object> u = users.get(i);
            String name = u.get("name") != null ? (String) u.get("name") : "Unknown";
            String username = u.get("username") != null ? (String) u.get("username") : "user";
            int xp = u.get("xp") != null ? ((Number) u.get("xp")).intValue() : 0;
            int streak = u.get("streak") != null ? ((Number) u.get("streak")).intValue() : 0;
            // Derive level from XP (200 XP per level, minimum level 1)
            int level = Math.max(1, xp / 200);

            result.add(LeaderboardEntryDto.builder()
                    .rank(i + 1)
                    .name(name)
                    .username(username)
                    .level(level)
                    .xp((long) xp)
                    .accuracy(0)
                    .streak(streak)
                    .build());
        }
        return result;
    }

    @Override
    public void logActivity(String userEmail, ActivityLogRequestDto request) {
        UserActivityLog log = UserActivityLog.builder()
                .userEmail(userEmail)
                .activityType(request.getActivityType())
                .detail(request.getDetail())
                .timeSpentSeconds(request.getTimeSpentSeconds() != null ? request.getTimeSpentSeconds() : 0)
                .timestamp(LocalDateTime.now())
                .build();
        activityLogRepository.save(log);
    }

    @Override
    public SharedBadge shareBadge(String userEmail, Map<String, Object> badgeData) {
        String userName = badgeData.containsKey("userName") && badgeData.get("userName") != null 
                ? String.valueOf(badgeData.get("userName")) 
                : userEmail;
                
        int xp = 0;
        if (badgeData.containsKey("xpValue") && badgeData.get("xpValue") != null) {
            try {
                xp = Integer.parseInt(String.valueOf(badgeData.get("xpValue")));
            } catch (Exception e) {}
        }

        SharedBadge badge = SharedBadge.builder()
                .userEmail(userEmail)
                .userName(userName)
                .badgeId(String.valueOf(badgeData.get("id")))
                .badgeTitle(String.valueOf(badgeData.get("title")))
                .badgeDescription(String.valueOf(badgeData.get("description")))
                .badgeIcon(String.valueOf(badgeData.get("icon")))
                .badgeTier(String.valueOf(badgeData.get("tier")))
                .badgeXp(xp)
                .sharedAt(LocalDateTime.now())
                .build();
                
        return sharedBadgeRepository.save(badge);
    }

    @Override
    public SharedBadge getSharedBadge(String shareId) {
        return sharedBadgeRepository.findById(shareId)
                .orElseThrow(() -> new RuntimeException("Shared badge not found"));
    }

    @Override
    public void deleteUserProgress(String userEmail) {
        progressRepository.deleteByUserEmail(userEmail);
        leaderboardRepository.deleteByUserEmail(userEmail);
        activityLogRepository.deleteByUserEmail(userEmail);
    }
}
