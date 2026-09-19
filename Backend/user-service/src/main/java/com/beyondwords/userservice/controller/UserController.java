package com.beyondwords.userservice.controller;

import com.beyondwords.userservice.dto.notification.NotificationResponseDto;
import com.beyondwords.userservice.dto.user.UserProfileResponseDto;
import com.beyondwords.userservice.dto.user.UserSettingsRequestDto;
import com.beyondwords.userservice.dto.user.UserSettingsResponseDto;
import com.beyondwords.userservice.entity.User;
import com.beyondwords.userservice.service.NotificationService;
import com.beyondwords.userservice.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import com.beyondwords.userservice.repository.BadgeRepository;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class UserController {
    private final UserService userService;
    private final NotificationService notificationService;
    private final BadgeRepository badgeRepository;

    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/me")
    public UserProfileResponseDto getProfile(@AuthenticationPrincipal(expression = "#this") User user) {
        return userService.getProfile(user);
    }

    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/me")
    public UserProfileResponseDto updateProfile(@AuthenticationPrincipal(expression = "#this") User user,
                                                @RequestBody UserProfileResponseDto request) {
        return userService.updateProfile(user, request);
    }

    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/me/settings")
    public UserSettingsResponseDto getSettings(@AuthenticationPrincipal(expression = "#this") User user) {
        return userService.getSettings(user);
    }

    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/me/settings")
    @ResponseStatus(HttpStatus.OK)
    public UserSettingsResponseDto updateSettings(@AuthenticationPrincipal(expression = "#this") User user,
                                                  @RequestBody UserSettingsRequestDto request) {
        return userService.updateSettings(user, request);
    }

    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/me/badges")
    public java.util.List<Map<String, Object>> getMyBadges(@AuthenticationPrincipal(expression = "#this") User user) {
        return userService.getUserBadges(user);
    }

    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/me/badges/all")
    public java.util.List<com.beyondwords.userservice.entity.Badge> getAllBadges() {
        return badgeRepository.findAll();
    }

    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/me/notifications")
    public java.util.List<NotificationResponseDto> getNotifications(@AuthenticationPrincipal(expression = "#this") User user) {
        return notificationService.getUserNotifications(user, 50);
    }

    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/me/notifications/unread-count")
    public Map<String, Long> getUnreadNotificationCount(@AuthenticationPrincipal(expression = "#this") User user) {
        return Map.of("count", notificationService.getUnreadCount(user));
    }

    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/me/notifications/{id}/read")
    @ResponseStatus(HttpStatus.OK)
    public void markNotificationAsRead(@AuthenticationPrincipal(expression = "#this") User user, @PathVariable Long id) {
        notificationService.markAsRead(id, user);
    }

    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/me/notifications/read-all")
    @ResponseStatus(HttpStatus.OK)
    public void markAllNotificationsAsRead(@AuthenticationPrincipal(expression = "#this") User user) {
        notificationService.markAllAsRead(user);
    }

    @PostMapping("/internal/xp/add")
    @ResponseStatus(HttpStatus.OK)
    public Map<String, Object> addXp(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        int xp = ((Number) body.get("xp")).intValue();
        int updatedXp = userService.addXp(email, xp);
        return Map.of("email", email, "updatedXp", updatedXp);
    }

    /**
     * Internal endpoint for leaderboard — returns all enabled users sorted by XP descending.
     * Called by analytics-service. No JWT auth required (internal service-to-service).
     */
    @GetMapping("/internal/leaderboard")
    public java.util.List<Map<String, Object>> getLeaderboardUsers() {
        return userService.getLeaderboardUsers();
    }

    @DeleteMapping("/me")
    public void deleteMyAccount(@AuthenticationPrincipal(expression = "#this") User user) {
        userService.deleteUser(user.getId());
    }

    @GetMapping("/site-settings")
    public com.beyondwords.userservice.dto.admin.SiteSettingsRequestDto getSiteSettings(
            @org.springframework.beans.factory.annotation.Autowired com.beyondwords.userservice.service.AdminService adminService) {
        return adminService.getSettings();
    }
}
