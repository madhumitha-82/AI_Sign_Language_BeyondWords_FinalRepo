package com.beyondwords.userservice.dto.user;

import lombok.Data;

@Data
public class UserSettingsResponseDto {
    private Long id;
    private Long userId;
    private String theme;
    private String language;
    private boolean notificationsEnabled;
    private boolean autoplayEnabled;
    private Integer weeklyGoal;
    private boolean privacyVisible;
}
