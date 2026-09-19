package com.beyondwords.analyticsservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecentActivityDto {
    private String id;
    private String activityType; 
    private String description;
    private LocalDateTime timestamp;
}
