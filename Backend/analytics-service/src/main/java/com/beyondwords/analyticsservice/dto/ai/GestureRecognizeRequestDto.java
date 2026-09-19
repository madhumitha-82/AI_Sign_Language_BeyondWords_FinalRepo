package com.beyondwords.analyticsservice.dto.ai;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GestureRecognizeRequestDto {
    private Long lessonId;
    private String expectedLabel;
    private String frameData;
    private List<GestureCoordinatesDto> coordinates;
}
