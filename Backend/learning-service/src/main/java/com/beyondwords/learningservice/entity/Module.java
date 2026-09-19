package com.beyondwords.learningservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "modules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Module {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Course course;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "module_order", nullable = false)
    private Integer moduleOrder;

    @Column(nullable = false, length = 20)
    private String status; // 'locked', 'unlocked'

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("lessonOrder ASC")
    @Builder.Default
    private java.util.Set<Lesson> lessons = new java.util.LinkedHashSet<>();
}
