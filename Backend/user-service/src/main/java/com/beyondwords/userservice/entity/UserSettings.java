package com.beyondwords.userservice.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "user_settings")
@Data
public class UserSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(length = 50)
    private String theme = "light";

    @Column(length = 50)
    private String language = "en";

    @Column(nullable = false)
    private boolean notificationsEnabled = true;

    @Column(nullable = false)
    private boolean autoplayEnabled = false;

    @Column(nullable = false)
    private Integer weeklyGoal = 0;

    @Column(name = "privacy_visible", nullable = false)
    private boolean privacyVisible = true;
}
