package com.beyondwords.analyticsservice.controller;

import com.beyondwords.analyticsservice.entity.UserActivityLog;
import com.beyondwords.analyticsservice.repository.UserActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {
    private final UserActivityLogRepository activityLogRepository;

    @GetMapping("/activity")
    public List<UserActivityLog> getRecentActivity() {
        return activityLogRepository.findTop20ByOrderByTimestampDesc();
    }
}
