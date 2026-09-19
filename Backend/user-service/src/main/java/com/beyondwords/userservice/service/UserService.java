package com.beyondwords.userservice.service;

import com.beyondwords.userservice.dto.user.AdminUserUpdateRequestDto;
import com.beyondwords.userservice.dto.user.UserProfileResponseDto;
import com.beyondwords.userservice.dto.user.UserResponseDto;
import com.beyondwords.userservice.dto.user.UserSettingsRequestDto;
import com.beyondwords.userservice.dto.user.UserSettingsResponseDto;
import com.beyondwords.userservice.entity.User;
import com.beyondwords.userservice.entity.UserSettings;
import com.beyondwords.userservice.repository.UserRepository;
import com.beyondwords.userservice.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final BadgeService badgeService;
    private final com.beyondwords.userservice.repository.UserBadgeRepository userBadgeRepository;

    public UserProfileResponseDto getProfile(User user) {
        return toProfileDto(user);
    }

    @Transactional
    public UserProfileResponseDto updateProfile(User user, UserProfileResponseDto request) {
        validateNotAnonymous(user);
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getEmail() != null) user.setEmail(request.getEmail().trim().toLowerCase(Locale.ROOT));
        if (request.getRole() != null) user.setRole(normalizeRole(request.getRole()));
        if (request.getXp() >= 0) user.setXp(request.getXp());
        if (request.getStreak() >= 0) {
            user.setStreak(request.getStreak());
            if (request.getStreak() >= 100) {
                badgeService.awardBadge(user, "LEGEND_100");
            }
        }
        userRepository.save(user);
        
        return toProfileDto(user);
    }

    /**
     * Atomically increment XP for a user identified by email.
     * Called by other microservices via the internal API.
     * Never overwrites; always adds.
     */
    @Transactional
    public int addXp(String email, int xpDelta) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
        user.setXp(user.getXp() + xpDelta);
        userRepository.save(user);
        return user.getXp();
    }

    public UserSettingsResponseDto getSettings(User user) {
        UserSettings settings = userSettingsRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultSettings(user));
        return toSettingsDto(settings);
    }

    @Transactional
    public UserSettingsResponseDto updateSettings(User user, UserSettingsRequestDto request) {
        validateNotAnonymous(user);
        UserSettings settings = userSettingsRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultSettings(user));
        if (request.getTheme() != null) settings.setTheme(request.getTheme());
        if (request.getLanguage() != null) settings.setLanguage(request.getLanguage());
        if (request.getNotificationsEnabled() != null) settings.setNotificationsEnabled(request.getNotificationsEnabled());
        if (request.getAutoplayEnabled() != null) settings.setAutoplayEnabled(request.getAutoplayEnabled());
        if (request.getWeeklyGoal() != null) settings.setWeeklyGoal(request.getWeeklyGoal());
        if (request.getPrivacyVisible() != null) settings.setPrivacyVisible(request.getPrivacyVisible());
        
        userSettingsRepository.save(settings);
        return toSettingsDto(settings);
    }

    public Long getCurrentUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("Authentication required");
        }
        if ("anonymousUser".equals(authentication.getName())) {
            throw new IllegalArgumentException("Anonymous users are not supported");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"))
                .getId();
    }

    public User getEntityById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public List<UserResponseDto> listUsers() {
        return userRepository.findAll().stream().map(this::toUserDto).toList();
    }

    public long countUsers() {
        return userRepository.count();
    }

    /**
     * Returns all enabled users sorted by XP descending for leaderboard display.
     * Called by analytics-service via internal API.
     */
    public java.util.List<Map<String, Object>> getLeaderboardUsers() {
        return userRepository.findAllByEnabledTrueOrderByXpDesc().stream()
                .filter(u -> u.getRole() == null || (!u.getRole().toUpperCase().contains("ADMIN")))
                .map(u -> {
            Map<String, Object> m = new java.util.HashMap<>();
            m.put("email", u.getEmail());
            m.put("name", u.getFullName());
            // Generate a username from email (before the @)
            String username = u.getEmail().contains("@")
                    ? u.getEmail().substring(0, u.getEmail().indexOf('@')).toLowerCase()
                    : u.getEmail().toLowerCase();
            m.put("username", username);
            m.put("xp", u.getXp());
            m.put("streak", u.getStreak());
            return m;
        }).collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public UserResponseDto updateUserAdmin(Long id, AdminUserUpdateRequestDto request) {
        User user = getEntityById(id);
        validateNotAnonymous(user);
        if (request.getRole() != null) user.setRole(normalizeRole(request.getRole()));
        if (request.getEnabled() != null) user.setEnabled(request.getEnabled());
        return toUserDto(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = getEntityById(id);
        userRepository.delete(user);
    }

    private UserSettings createDefaultSettings(User user) {
        UserSettings settings = new UserSettings();
        settings.setUserId(user.getId());
        return userSettingsRepository.save(settings);
    }

    private void validateNotAnonymous(User user) {
        if (user == null) {
            return;
        }
        if ("anonymousUser" .equals(user.getEmail())) {
            throw new IllegalStateException("Cannot persist anonymous user to database");
        }
    }

    private String normalizeRole(String role) {
        if (role == null) {
            return null;
        }
        String normalized = role.trim().toUpperCase(Locale.ROOT);
        if ("ROLE_ADMIN".equals(normalized) || "ADMIN".equals(normalized)) {
            return "ROLE_ADMIN";
        }
        return "ROLE_USER";
    }

    private UserProfileResponseDto toProfileDto(User user) {
        UserProfileResponseDto dto = new UserProfileResponseDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setXp(user.getXp());
        dto.setStreak(user.getStreak());
        return dto;
    }

    private UserSettingsResponseDto toSettingsDto(UserSettings settings) {
        UserSettingsResponseDto dto = new UserSettingsResponseDto();
        dto.setId(settings.getId());
        dto.setUserId(settings.getUserId());
        dto.setTheme(settings.getTheme());
        dto.setLanguage(settings.getLanguage());
        dto.setNotificationsEnabled(settings.isNotificationsEnabled());
        dto.setAutoplayEnabled(settings.isAutoplayEnabled());
        dto.setWeeklyGoal(settings.getWeeklyGoal());
        dto.setPrivacyVisible(settings.isPrivacyVisible());
        return dto;
    }

    private UserResponseDto toUserDto(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setXp(user.getXp());
        dto.setStreak(user.getStreak());
        dto.setEnabled(user.isEnabled());
        return dto;
    }

    public java.util.List<Map<String, Object>> getUserBadges(User user) {
        return userBadgeRepository.findByUserId(user.getId()).stream().map(ub -> {
            Map<String, Object> m = new java.util.HashMap<>();
            m.put("name", ub.getBadge().getName());
            m.put("description", ub.getBadge().getDescription());
            m.put("emoji", ub.getBadge().getEmoji());
            m.put("earnedAt", ub.getAwardedAt() != null ? ub.getAwardedAt().toLocalDate() : java.time.LocalDate.now());
            return m;
        }).collect(java.util.stream.Collectors.toList());
    }
}
