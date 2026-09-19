package com.beyondwords.learningservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lessons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Module module;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "video_url", length = 255)
    private String videoUrl;

    @Column(columnDefinition = "TEXT")
    private String meaning;

    @Column(name = "ai_explanation", columnDefinition = "TEXT")
    private String aiExplanation;

    @Column(name = "example_sentence", columnDefinition = "TEXT")
    private String exampleSentence;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "lesson_order", nullable = false)
    private Integer lessonOrder;
}
