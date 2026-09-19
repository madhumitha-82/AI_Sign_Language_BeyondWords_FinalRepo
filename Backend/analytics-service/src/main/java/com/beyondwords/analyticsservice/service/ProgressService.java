package com.beyondwords.analyticsservice.service;

import com.beyondwords.analyticsservice.dto.*;
import com.beyondwords.analyticsservice.document.SharedBadge;
import java.util.List;
import java.util.Map;

public interface ProgressService {
    ProgressResponseDto completeLesson(String userEmail, Long lessonId);
    Map<String, Integer> getHeatmap(String userEmail);
    ProgressSummaryDto getSummary(String userEmail);
    List<LeaderboardEntryDto> getLeaderboard(String timeframe);
    void logActivity(String userEmail, ActivityLogRequestDto request);
    
    SharedBadge shareBadge(String userEmail, Map<String, Object> badgeData);
    SharedBadge getSharedBadge(String shareId);
    void deleteUserProgress(String userEmail);
}
