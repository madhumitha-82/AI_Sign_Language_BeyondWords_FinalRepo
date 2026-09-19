package com.beyondwords.userservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "badges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "emoji", length = 50)
    private String emoji;

    @Column(name = "badge_type", length = 100)
    private String badgeType;

    @Column(name = "requirement", length = 100)
    private String requirement;

    // Legacy fields to prevent SQL NOT NULL constraint errors
    @Column(name = "required_xp", nullable = false, columnDefinition = "INT DEFAULT 0")
    @Builder.Default
    private int requiredXp = 0;

    @Column(name = "icon_url")
    private String iconUrl;
}
