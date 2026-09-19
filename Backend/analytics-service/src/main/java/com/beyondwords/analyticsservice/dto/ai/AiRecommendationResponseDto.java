package com.beyondwords.analyticsservice.dto.ai;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiRecommendationResponseDto {
    private List<RecommendationItem> recommendations;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecommendationItem {
        private String title;
        private String reason;
        private String type; // lesson, quiz
        private Long targetId;
    }
}
