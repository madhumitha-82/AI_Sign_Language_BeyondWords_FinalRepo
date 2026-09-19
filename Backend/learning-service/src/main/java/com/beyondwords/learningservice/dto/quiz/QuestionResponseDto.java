package com.beyondwords.learningservice.dto.quiz;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionResponseDto {
    private Long id;
    private String question;
    private String image;
    private List<String> options;
    private String correctAnswer;
}
