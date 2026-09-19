package com.beyondwords.userservice.controller;

import com.beyondwords.userservice.dto.auth.*;
import com.beyondwords.userservice.entity.User;
import com.beyondwords.userservice.service.AuthService;
import com.beyondwords.userservice.service.UserService;
import com.beyondwords.userservice.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponseDto register(@Valid @RequestBody RegisterRequestDto request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponseDto login(@Valid @RequestBody LoginRequestDto request) {
        return authService.login(request);
    }

    @PostMapping("/google")
    public AuthResponseDto googleLogin(@Valid @RequestBody GoogleLoginRequestDto request) {
        return authService.googleLogin(request);
    }

    @PostMapping("/refresh")
    public AuthResponseDto refresh(@Valid @RequestBody RefreshTokenRequestDto request) {
        return authService.refreshToken(request);
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    public AuthResponseDto me(@AuthenticationPrincipal(expression = "#this") User user) {
        // Return details
        return AuthResponseDto.builder()
                .accessToken(null) // Not issuing new token on basic lookup
                .refreshToken(null)
                .role(user.getRole())
                .build();
    }

    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setResetToken(UUID.randomUUID().toString());
            userRepository.save(user);
            
            String resetLink = "http://localhost:5173/auth/reset-password?token=" + user.getResetToken();
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("Password Reset Request");
            message.setText("To reset your password, click the link below:\n" + resetLink);
            mailSender.send(message);
        });
        Map<String, String> response = new HashMap<>();
        response.put("message", "If the account exists, a password reset link has been sent to your email.");
        return response;
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token."));
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        userRepository.save(user);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successfully. You can now sign in.");
        return response;
    }
}
