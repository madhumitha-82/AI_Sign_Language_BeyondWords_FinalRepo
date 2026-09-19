package com.beyondwords.learningservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_completions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_email", "completion_type", "entity_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "completion_type", nullable = false)
    private String completionType; // "MODULE" or "COURSE"

    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        this.completedAt = LocalDateTime.now();
    }
}
