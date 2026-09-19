package com.beyondwords.userservice.dto.admin;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteSettingsRequestDto {
    private Boolean maintenanceMode;
    private String maintenanceMessage;
    private String expectedBackTime;
    private String platformName;
    private String platformTagline;
    private String featuredCourseId;
    private String welcomeMessage;
    
    // Content Rules
    private String defaultLessonStatus;
    private String defaultModuleStatus;
    private Boolean allowRevisitLessons;
    private Boolean showLessonDuration;
    
    // Quiz Limits
    private Integer defaultQuizTimeLimit;
    private Integer defaultPassPercentage;
    private Boolean showCorrectAnswerAfterWrong;
    private Boolean allowQuizRetries;
    
    // XP Settings
    private java.util.Map<String, Integer> xpPerLevel;
    private Integer xpLessonComplete;
    private Integer xpQuizPass;
    private Integer xpDailyLogin;
    private Integer xpStreakMaintain;
}
