package com.beyondwords.analyticsservice.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;
import java.time.LocalDateTime;

@Document(collection = "ai_practice_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiPracticeSession {
    @Id
    private String id;
    private String userEmail;
    private Long lessonId;
    private String label;
    private Double confidence;
    private Boolean isCorrect;
    private String rawCoordinates;
    private LocalDateTime timestamp;
}
