package com.beyondwords.learningservice.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleResponseDto {
    private Long id;
    private Long courseId;
    private String title;
    private String description;
    private Integer order;
    private String status;
    private List<LessonResponseDto> lessons;
}
