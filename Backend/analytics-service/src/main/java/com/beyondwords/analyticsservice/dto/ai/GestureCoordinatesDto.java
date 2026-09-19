package com.beyondwords.analyticsservice.dto.ai;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GestureCoordinatesDto {
    private Double x;
    private Double y;
    private Double z;
    private Double visibility;
}
