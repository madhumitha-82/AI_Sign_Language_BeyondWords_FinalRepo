package com.beyondwords.learningservice.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseResponseDto {
    private Long id;
    private String title;
    private String description;
    private String status;
    private List<ModuleResponseDto> modules;
}
