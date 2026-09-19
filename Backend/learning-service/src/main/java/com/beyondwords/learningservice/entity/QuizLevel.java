package com.beyondwords.learningservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "quiz_levels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizLevel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private QuizCategory category;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 20)
    private String difficulty; // Easy, Medium, Hard

    @Column(name = "xp_reward", nullable = false)
    private Integer xpReward;

    @Column(name = "level_order", nullable = false)
    private Integer levelOrder;

    @Column(nullable = false)
    private Boolean unlocked;

    @OneToMany(mappedBy = "level", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<QuizQuestion> questions = new LinkedHashSet<>();
}
