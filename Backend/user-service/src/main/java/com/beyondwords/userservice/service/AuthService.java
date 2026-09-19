package com.beyondwords.userservice.service;

import com.beyondwords.userservice.dto.auth.*;
import com.beyondwords.userservice.entity.RefreshToken;
import com.beyondwords.userservice.entity.User;
import com.beyondwords.userservice.repository.RefreshTokenRepository;
import com.beyondwords.userservice.repository.UserRepository;
import com.beyondwords.userservice.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponseDto register(RegisterRequestDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = User.builder()
                .email(request.getEmail().trim().toLowerCase(Locale.ROOT))
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .role(request.getRole() != null ? normalizeRole(request.getRole()) : "ROLE_USER")
                .enabled(true)
                .xp(0)
                .streak(0)
                .build();
        userRepository.save(user);

        return issueTokens(user);
    }

    @Transactional
    public AuthResponseDto login(LoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        return issueTokens(user);
    }

    @Transactional
    public AuthResponseDto googleLogin(GoogleLoginRequestDto request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // Register new user via Google
            user = User.builder()
                    .email(email)
                    .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString())) // Random strong password
                    .fullName(request.getName().trim())
                    .role("ROLE_USER")
                    .enabled(true)
                    .xp(0)
                    .streak(0)
                    .build();
            userRepository.save(user);
        }

        return issueTokens(user);
    }

    @Transactional
    public AuthResponseDto refreshToken(RefreshTokenRequestDto request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));
        if (refreshToken.isRevoked() || refreshToken.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Refresh token expired");
        }
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        User user = refreshToken.getUser();
        return issueTokens(user);
    }

    private AuthResponseDto issueTokens(User user) {
        String accessToken = jwtService.generateToken(user.getEmail(), user.getRole());
        String refreshTokenValue = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(refreshTokenValue)
                .expiresAt(Instant.now().plusSeconds(60 * 60 * 24 * 7))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);
        return new AuthResponseDto(accessToken, refreshTokenValue, user.getRole());
    }

    private String normalizeRole(String role) {
        if (role == null) return "ROLE_USER";
        String normalized = role.trim().toUpperCase(Locale.ROOT);
        if ("ROLE_ADMIN".equals(normalized) || "ADMIN".equals(normalized)) {
            return "ROLE_ADMIN";
        }
        return "ROLE_USER";
    }
}
