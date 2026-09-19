package com.beyondwords.analyticsservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardEntryDto {
    private Integer rank;
    private String name;
    private String username;
    private Integer level;
    private Long xp;
    private Integer accuracy;
    private Integer streak;
}
