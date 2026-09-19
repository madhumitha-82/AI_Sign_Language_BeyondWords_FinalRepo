package com.beyondwords.learningservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonResponseDto {
    private Long id;
    private Long moduleId;
    private String title;
    @Builder.Default
    private String type = "lesson";
    private String videoUrl;
    private String meaning;
    private String aiExplanation;
    private String exampleSentence;
    private String status;
    private Integer durationMinutes;
    private Integer lessonOrder;
}
