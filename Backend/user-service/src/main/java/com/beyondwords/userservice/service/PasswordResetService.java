package com.beyondwords.userservice.service;

import com.beyondwords.userservice.dto.auth.PasswordResetRequestDto;
import com.beyondwords.userservice.entity.PasswordResetOtp;
import com.beyondwords.userservice.entity.User;
import com.beyondwords.userservice.repository.PasswordResetOtpRepository;
import com.beyondwords.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {
    private final UserRepository userRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void generateAndSendOtp(String email) {
        if (!userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email address not found");
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        PasswordResetOtp otpEntity = PasswordResetOtp.builder()
                .email(email)
                .otp(otp)
                .channel(PasswordResetOtp.Channel.EMAIL)
                .status(PasswordResetOtp.Status.PENDING)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();
        otpRepository.save(otpEntity);

        // Send Email (or log as backup)
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("madhumithagopal82@gmail.com");
            message.setTo(email);
            message.setSubject("BeyondWords Password Reset OTP");
            message.setText("Your OTP code to reset your password is: " + otp + "\nIt will expire in 10 minutes.");
            mailSender.send(message);
            log.info("Successfully sent OTP email to {}", email);
        } catch (Exception e) {
            log.warn("Could not send mail to {}. Logging OTP code instead: {}", email, otp);
        }
    }

    @Transactional
    public void verifyAndResetPassword(PasswordResetRequestDto request) {
        PasswordResetOtp otpEntity = otpRepository.findFirstByEmailAndOtpOrderByCreatedAtDesc(
                request.getEmail(), request.getOtp())
                .orElseThrow(() -> new IllegalArgumentException("Invalid OTP code"));

        if (otpEntity.getStatus() != PasswordResetOtp.Status.PENDING) {
            throw new IllegalArgumentException("OTP code has already been used or verified");
        }
        if (otpEntity.getExpiresAt().isBefore(LocalDateTime.now())) {
            otpEntity.setStatus(PasswordResetOtp.Status.EXPIRED);
            otpRepository.save(otpEntity);
            throw new IllegalArgumentException("OTP code has expired");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        otpEntity.setStatus(PasswordResetOtp.Status.USED);
        otpRepository.save(otpEntity);
    }
}
