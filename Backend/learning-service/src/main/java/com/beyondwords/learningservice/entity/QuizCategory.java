package com.beyondwords.learningservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "quiz_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String slug;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 20)
    private String icon;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("levelOrder ASC")
    @Builder.Default
    private Set<QuizLevel> levels = new LinkedHashSet<>();
}
