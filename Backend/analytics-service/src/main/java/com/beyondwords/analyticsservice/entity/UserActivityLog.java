package com.beyondwords.analyticsservice.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.time.LocalDateTime;

@Document(collection = "user_activity_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserActivityLog {
    @Id
    private String id;

    @Field("user_email")
    private String userEmail;

    @Field("activity_type")
    private String activityType; // "search", "page_view", "complete_lesson", "attempt_quiz"

    private String detail;

    @Field("time_spent_seconds")
    private Integer timeSpentSeconds;

    private LocalDateTime timestamp;
}
