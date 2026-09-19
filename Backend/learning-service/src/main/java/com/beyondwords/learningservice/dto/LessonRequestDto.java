package com.beyondwords.learningservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonRequestDto {
    @NotBlank(message = "Title is required")
    private String title;

    private String videoUrl;

    private String meaning;

    private String aiExplanation;

    private String exampleSentence;

    @NotNull(message = "Duration in minutes is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    @NotNull(message = "Lesson order is required")
    private Integer lessonOrder;

    @NotBlank(message = "Status is required")
    private String status; // 'locked', 'unlocked'
}
