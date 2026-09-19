package com.beyondwords.analyticsservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "leaderboard_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false, length = 100)
    private String userEmail;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String username;

    @Column(nullable = false)
    private Integer level;

    @Column(nullable = false)
    private Long xp;

    @Column(nullable = false)
    private Integer accuracy;

    @Column(nullable = false)
    private Integer streak;

    @Column(nullable = false, length = 20)
    private String timeframe; // "weekly", "monthly", "allTime"

    @Column(name = "rank_value", nullable = false)
    private Integer rankValue;
}
