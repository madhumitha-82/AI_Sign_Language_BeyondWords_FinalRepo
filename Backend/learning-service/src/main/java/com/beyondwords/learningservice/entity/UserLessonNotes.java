package com.beyondwords.learningservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_lesson_notes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_email", "lesson_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserLessonNotes {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false, length = 100)
    private String userEmail;

    @Column(name = "lesson_id", nullable = false)
    private Long lessonId;

    @Column(name = "notes_text", columnDefinition = "TEXT")
    private String notesText;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
