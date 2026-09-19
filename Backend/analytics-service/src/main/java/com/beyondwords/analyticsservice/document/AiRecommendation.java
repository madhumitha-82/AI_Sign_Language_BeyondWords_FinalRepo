package com.beyondwords.analyticsservice.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;
import java.time.LocalDateTime;

@Document(collection = "ai_recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiRecommendation {
    @Id
    private String id;
    private String userEmail;
    private String title;
    private String reason;
    private String type; // lesson, quiz
    private Long targetId;
    private LocalDateTime timestamp;
}
