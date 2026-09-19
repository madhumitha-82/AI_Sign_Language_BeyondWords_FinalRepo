package com.beyondwords.analyticsservice.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;
import java.time.LocalDateTime;

@Document(collection = "speech_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeechSession {
    @Id
    private String id;
    private String userEmail;

    // General session type: "speech_to_text" | "text_to_speech"
    private String type;

    // The spoken/typed text content or transcript
    private String content;
    private String transcript; // alias for legacy support

    // Stats
    private Integer wordCount;
    private Integer durationSeconds;

    // AI-graded fields (for lesson-based sessions)
    private Long lessonId;
    private Double confidence;
    private String speedRating;
    private Boolean isCorrect;

    private LocalDateTime timestamp;
}
