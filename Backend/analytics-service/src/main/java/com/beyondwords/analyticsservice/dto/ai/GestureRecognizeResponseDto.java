package com.beyondwords.analyticsservice.dto.ai;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GestureRecognizeResponseDto {
    private Boolean isCorrect;
    private Double confidence;
    private String recognizedLabel;
    private String feedbackMessage;
}
