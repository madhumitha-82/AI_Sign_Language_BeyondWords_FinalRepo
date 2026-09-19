package com.beyondwords.userservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_otps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetOtp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(nullable = false, length = 10)
    private String otp;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Channel channel; // EMAIL, SMS

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status; // PENDING, VERIFIED, USED, EXPIRED, FAILED

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public enum Channel {
        EMAIL, SMS
    }

    public enum Status {
        PENDING, VERIFIED, USED, EXPIRED, FAILED
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
