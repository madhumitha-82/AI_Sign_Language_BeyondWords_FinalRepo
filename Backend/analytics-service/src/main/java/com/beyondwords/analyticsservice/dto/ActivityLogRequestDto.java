package com.beyondwords.analyticsservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLogRequestDto {
    @NotBlank(message = "Activity type is required")
    private String activityType;

    private String detail;

    private Integer timeSpentSeconds;
}
