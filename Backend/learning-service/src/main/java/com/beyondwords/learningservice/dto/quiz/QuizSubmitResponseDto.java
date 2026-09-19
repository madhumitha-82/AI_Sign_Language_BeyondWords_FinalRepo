package com.beyondwords.learningservice.dto.quiz;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizSubmitResponseDto {
    private Integer xpEarned;
    private Integer accuracy;
    private Integer score;
    private Integer totalQuestions;
    private List<String> badgesUnlocked;
}
