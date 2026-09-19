package com.beyondwords.userservice.dto.user;

import lombok.Data;

@Data
public class UserSettingsRequestDto {
    private String theme;
    private String language;
    private Boolean notificationsEnabled;
    private Boolean autoplayEnabled;
    private Integer weeklyGoal;
    private Boolean privacyVisible;
}
