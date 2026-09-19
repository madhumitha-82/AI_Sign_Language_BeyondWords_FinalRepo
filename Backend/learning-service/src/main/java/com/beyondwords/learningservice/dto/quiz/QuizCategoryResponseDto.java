package com.beyondwords.learningservice.dto.quiz;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizCategoryResponseDto {
    private String slug;
    private String name;
    private String icon;
    private String description;
    private List<QuizLevelResponseDto> levels;
}
