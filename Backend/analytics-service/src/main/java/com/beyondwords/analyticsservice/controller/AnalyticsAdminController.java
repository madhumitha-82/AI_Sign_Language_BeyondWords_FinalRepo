package com.beyondwords.analyticsservice.controller;

import com.beyondwords.analyticsservice.repository.UserActivityLogRepository;
import com.beyondwords.analyticsservice.repository.UserProgressRepository;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class AnalyticsAdminController {
    
    private final UserActivityLogRepository activityLogRepository;
    private final UserProgressRepository userProgressRepository;

    @GetMapping("/daily-active-users")
    public List<Map<String, Object>> getDailyActiveUsers() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        var logs = activityLogRepository.findByTimestampAfter(thirtyDaysAgo);
        
        // Group by Date (YYYY-MM-DD) and count distinct user emails
        Map<String, java.util.Set<String>> dailyUsers = new HashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        for (var log : logs) {
            if (log.getTimestamp() != null && log.getUserEmail() != null) {
                String dateKey = log.getTimestamp().format(formatter);
                dailyUsers.computeIfAbsent(dateKey, k -> new java.util.HashSet<>()).add(log.getUserEmail());
            }
        }
        
        return dailyUsers.entrySet().stream()
                .map(e -> Map.<String, Object>of("date", e.getKey(), "activeUsers", e.getValue().size()))
                .sorted((a, b) -> ((String)a.get("date")).compareTo((String)b.get("date")))
                .collect(Collectors.toList());
    }

    @GetMapping("/peak-active-day")
    public Map<String, Object> getPeakActiveDay() {
        var logs = activityLogRepository.findAll();
        
        Map<String, java.util.Set<String>> dailyUsers = new HashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        for (var log : logs) {
            if (log.getTimestamp() != null && log.getUserEmail() != null) {
                String dateKey = log.getTimestamp().format(formatter);
                dailyUsers.computeIfAbsent(dateKey, k -> new java.util.HashSet<>()).add(log.getUserEmail());
            }
        }
        
        if (dailyUsers.isEmpty()) return Map.of("peakDay", "None", "count", 0);
        
        String peakDay = "None";
        int maxCount = 0;
        
        for (Map.Entry<String, java.util.Set<String>> entry : dailyUsers.entrySet()) {
            if (entry.getValue().size() > maxCount) {
                maxCount = entry.getValue().size();
                peakDay = entry.getKey();
            }
        }
        
        return Map.of("peakDay", peakDay, "count", maxCount);
    }

    @GetMapping("/lesson-completions")
    public Map<Long, Long> getLessonCompletions() {
        // Group by lesson_id and count
        List<com.beyondwords.analyticsservice.entity.UserProgress> progress = userProgressRepository.findAll();
        return progress.stream()
                .collect(Collectors.groupingBy(
                        com.beyondwords.analyticsservice.entity.UserProgress::getLessonId,
                        Collectors.counting()
                ));
    }
    
    @GetMapping("/content-views")
    public Map<Long, Long> getContentViews() {
        // Find views based on activity log
        // 'START_LESSON' or 'page_view' for a lesson.
        // Detail contains lessonId
        List<com.beyondwords.analyticsservice.entity.UserActivityLog> logs = activityLogRepository.findAll();
        Map<Long, Long> views = new HashMap<>();
        for (var log : logs) {
            if (("START_LESSON".equals(log.getActivityType()) || "complete_lesson".equals(log.getActivityType())) && log.getDetail() != null) {
                try {
                    Long lessonId = Long.parseLong(log.getDetail());
                    views.put(lessonId, views.getOrDefault(lessonId, 0L) + 1);
                } catch (NumberFormatException e) {
                    // Ignore non-numeric details
                }
            }
        }
        return views;
    }
    @GetMapping("/content-performance")
    public List<Map<String, Object>> getContentPerformance() {
        Map<Long, Long> views = getContentViews();
        Map<Long, Long> completions = getLessonCompletions();
        
        List<Map<String, Object>> performance = new java.util.ArrayList<>();
        
        for (Map.Entry<Long, Long> entry : views.entrySet()) {
            Long lessonId = entry.getKey();
            long viewCount = entry.getValue();
            long completionCount = completions.getOrDefault(lessonId, 0L);
            
            double rate = viewCount > 0 ? (completionCount * 100.0 / viewCount) : 0;
            long roundedRate = Math.round(rate);
            
            if (roundedRate >= 70) {
                performance.add(Map.of(
                    "lessonId", lessonId,
                    "views", viewCount,
                    "completions", completionCount,
                    "rate", roundedRate
                ));
            }
        }
        
        return performance.stream()
                .sorted((a, b) -> Long.compare(((Number)b.get("rate")).longValue(), ((Number)a.get("rate")).longValue()))
                .limit(10)
                .collect(Collectors.toList());
    }
}
