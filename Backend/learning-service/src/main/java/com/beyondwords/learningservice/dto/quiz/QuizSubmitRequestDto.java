package com.beyondwords.learningservice.dto.quiz;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizSubmitRequestDto {
    private Integer score;
    private Integer totalQuestions;
    private Integer accuracy;
    private String timeTaken;
}
