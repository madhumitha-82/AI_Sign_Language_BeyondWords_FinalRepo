package com.beyondwords.analyticsservice.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressSummaryDto {
    private List<Integer> weeklyStudyTime; // Mon-Sun study minutes
    private Integer dailyCompleted;
    private Integer dailyGoal;
    private String strongestSkill;
    private String strongestSkillDescription;
    private String weakestSkill;
    private String weakestSkillDescription;
    private List<String> insights;
    
    // New fields for comprehensive Dashboard data
    private Integer totalLessonsCompleted;
    private List<Long> completedLessonIds;
    private Double accuracy;
    private Integer weeklyProgressDays;
    private Integer streak;
    private List<RecentActivityDto> recentActivity;
}
