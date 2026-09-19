package com.beyondwords.userservice.controller;

import com.beyondwords.userservice.entity.User;
import com.beyondwords.userservice.repository.UserRepository;
import com.beyondwords.userservice.service.BadgeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/users/internal/badges")
public class InternalBadgeController {

    @Autowired
    private BadgeService badgeService;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private com.beyondwords.userservice.repository.UserBadgeRepository userBadgeRepository;
    
    @Autowired
    private com.beyondwords.userservice.repository.BadgeRepository badgeRepository;

    @DeleteMapping("/delete-all")
    public ResponseEntity<Void> deleteAllBadges() {
        userBadgeRepository.deleteAll();
        badgeRepository.deleteAll();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/debug/{email}")
    public ResponseEntity<java.util.List<com.beyondwords.userservice.entity.UserBadge>> debugBadges(@PathVariable String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(userBadgeRepository.findByUserId(user.getId()));
    }

    @PostMapping("/award")
    public ResponseEntity<Void> awardBadge(@RequestBody Map<String, Object> request) {
        String email = (String) request.get("email");
        String badgeType = (String) request.get("badgeType");
        
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || badgeType == null) {
            return ResponseEntity.badRequest().build();
        }
        
        badgeService.awardBadge(user, badgeType);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/award-weekly")
    public ResponseEntity<Void> awardWeeklyBadge(@RequestBody Map<String, Object> request) {
        String email = (String) request.get("email");
        String badgeType = (String) request.get("badgeType");
        String weekStartStr = (String) request.get("weekStart");
        String weekEndStr = (String) request.get("weekEnd");
        
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || badgeType == null || weekStartStr == null || weekEndStr == null) {
            return ResponseEntity.badRequest().build();
        }
        
        LocalDate weekStart = LocalDate.parse(weekStartStr);
        LocalDate weekEnd = LocalDate.parse(weekEndStr);
        
        badgeService.awardWeeklyBadge(user, badgeType, weekStart, weekEnd);
        return ResponseEntity.ok().build();
    }
}
