package com.beyondwords.learningservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleRequestDto {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Module order is required")
    private Integer order;

    @NotBlank(message = "Status is required")
    private String status; // 'locked', 'unlocked'
}
