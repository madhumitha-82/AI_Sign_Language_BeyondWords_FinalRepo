package com.beyondwords.userservice.controller;

import com.beyondwords.userservice.dto.admin.*;
import com.beyondwords.userservice.dto.user.AdminUserUpdateRequestDto;
import com.beyondwords.userservice.dto.user.UserResponseDto;
import com.beyondwords.userservice.entity.Announcement;
import com.beyondwords.userservice.service.AdminService;
import com.beyondwords.userservice.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class AdminController {
    private final UserService userService;
    private final AdminService adminService;

    // --- Dashboard Stats ---
    @GetMapping("/dashboard/stats")
    public java.util.Map<String, Long> getDashboardStats() {
        return java.util.Map.of("totalUsers", userService.countUsers());
    }

    @GetMapping("/analytics/signups")
    public List<java.util.Map<String, Object>> getSignups() {
        java.time.LocalDateTime twelveWeeksAgo = java.time.LocalDateTime.now().minusWeeks(12);
        List<com.beyondwords.userservice.entity.User> users = adminService.getUsersCreatedAfter(twelveWeeksAgo);
        
        java.util.Map<String, Integer> weeklyCounts = new java.util.HashMap<>();
        for (com.beyondwords.userservice.entity.User user : users) {
            if (user.getCreatedAt() != null) {
                long weeksAgo = java.time.temporal.ChronoUnit.WEEKS.between(user.getCreatedAt(), java.time.LocalDateTime.now());
                String weekKey = "Week " + (12 - weeksAgo);
                weeklyCounts.put(weekKey, weeklyCounts.getOrDefault(weekKey, 0) + 1);
            }
        }
        
        List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            String weekKey = "Week " + i;
            result.add(java.util.Map.of("week", weekKey, "Signups", weeklyCounts.getOrDefault(weekKey, 0)));
        }
        return result;
    }

    // --- User Audit / Suspension Management ---
    @GetMapping("/users")
    public List<UserResponseDto> listUsers() {
        return userService.listUsers();
    }

    @PutMapping("/users/{id}")
    public UserResponseDto updateUser(@PathVariable Long id, @Valid @RequestBody AdminUserUpdateRequestDto request) {
        return userService.updateUserAdmin(id, request);
    }

    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    // --- Announcement Broadcaster ---
    @GetMapping("/announcements")
    public List<Announcement> listAnnouncements() {
        return adminService.listAnnouncements();
    }

    @PostMapping("/announcements")
    @ResponseStatus(HttpStatus.CREATED)
    public Announcement createAnnouncement(@Valid @RequestBody AnnouncementRequestDto request) {
        return adminService.createAnnouncement(request);
    }

    @PutMapping("/announcements/{id}")
    public Announcement updateAnnouncement(@PathVariable Long id, @Valid @RequestBody AnnouncementRequestDto request) {
        return adminService.updateAnnouncement(id, request);
    }

    @DeleteMapping("/announcements/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAnnouncement(@PathVariable Long id) {
        adminService.deleteAnnouncement(id);
    }

    // --- Site / Maintenance Properties Settings ---
    @GetMapping("/settings")
    public SiteSettingsRequestDto getSettings() {
        return adminService.getSettings();
    }

    @PutMapping("/settings")
    public SiteSettingsRequestDto updateSettings(@RequestBody SiteSettingsRequestDto request) {
        return adminService.updateSettings(request);
    }
}
