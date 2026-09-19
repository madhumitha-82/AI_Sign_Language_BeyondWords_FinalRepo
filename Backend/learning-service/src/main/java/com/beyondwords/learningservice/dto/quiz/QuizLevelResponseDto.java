package com.beyondwords.learningservice.dto.quiz;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizLevelResponseDto {
    private Long id;
    private String title;
    private String difficulty;
    private Integer xp;
    private Boolean unlocked;
    private Integer questionsCount;
}
