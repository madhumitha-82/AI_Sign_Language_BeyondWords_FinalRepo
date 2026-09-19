package com.beyondwords.analyticsservice.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressResponseDto {
    private List<Long> completedLessonIds;
    private Integer completedLessonsCount;
    private Integer xpGained;
    private Boolean levelUp;
    private Integer currentLevel;
}
