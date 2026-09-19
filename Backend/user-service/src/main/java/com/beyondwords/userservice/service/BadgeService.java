package com.beyondwords.userservice.service;

import com.beyondwords.userservice.entity.Badge;
import com.beyondwords.userservice.entity.User;
import com.beyondwords.userservice.entity.UserBadge;
import com.beyondwords.userservice.repository.BadgeRepository;
import com.beyondwords.userservice.repository.UserBadgeRepository;
import com.beyondwords.userservice.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BadgeService {

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private UserBadgeRepository userBadgeRepository;
    
    @Autowired
    private NotificationService notificationService;

    @jakarta.annotation.PostConstruct
    public void seedBadges() {
        if (badgeRepository.count() == 0) {
            badgeRepository.save(Badge.builder().badgeType("Precision Hands").name("Precision Hands").description("Completed 5 lessons with 100% accuracy").emoji("🎯").build());
            badgeRepository.save(Badge.builder().badgeType("Fast Learner").name("Fast Learner").description("Completed a module in under 5 minutes").emoji("⚡").build());
            badgeRepository.save(Badge.builder().badgeType("Dedication").name("Dedication").description("Maintained a 7-day streak").emoji("🔥").build());
            badgeRepository.save(Badge.builder().badgeType("First Step").name("First Step").description("Completed your first lesson").emoji("🌱").build());
            badgeRepository.save(Badge.builder().badgeType("Quiz Master").name("Quiz Master").description("Scored 100% on 3 quizzes").emoji("👑").build());
            badgeRepository.save(Badge.builder().badgeType("Night Owl").name("Night Owl").description("Completed a lesson after 10 PM").emoji("🦉").build());
            badgeRepository.save(Badge.builder().badgeType("Early Bird").name("Early Bird").description("Completed a lesson before 7 AM").emoji("🌅").build());
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public void awardBadge(User user, String badgeType) {
        List<Badge> badges = badgeRepository.findByBadgeType(badgeType);
        if (badges.isEmpty()) return;
        
        Badge badge = badges.get(0);

        if ("FIRST_STEP".equals(badgeType)) {
            java.time.LocalDate regDate = user.getCreatedAt().toLocalDate();
            java.time.LocalDate today = java.time.LocalDate.now();
            if (!regDate.equals(today)) {
                return; // Not completed on the first day
            }
        }

        if (!userBadgeRepository.existsByUserIdAndBadgeId(user.getId(), badge.getId())) {
            UserBadge userBadge = UserBadge.builder()
                    .user(user)
                    .badge(badge)
                    .build();
            userBadgeRepository.save(userBadge);
            
            notificationService.createNotification(
                    user, 
                    "Achievement Earned! " + badge.getEmoji(), 
                    "You've unlocked the '" + badge.getName() + "' badge.", 
                    "BADGE"
            );
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public void awardWeeklyBadge(User user, String badgeType, java.time.LocalDate weekStart, java.time.LocalDate weekEnd) {
        List<Badge> badges = badgeRepository.findByBadgeType(badgeType);
        if (badges.isEmpty()) return;
        
        Badge badge = badges.get(0);
        
        // Check if they already had it this week so we don't spam them
        boolean alreadyHad = userBadgeRepository.existsByUserIdAndBadgeId(user.getId(), badge.getId());

        // Remove existing holder for this week
        userBadgeRepository.deleteByBadgeIdAndWeekStart(badge.getId(), weekStart);
        
        UserBadge userBadge = UserBadge.builder()
                .user(user)
                .badge(badge)
                .weekStart(weekStart)
                .weekEnd(weekEnd)
                .build();
        userBadgeRepository.save(userBadge);
        
        if (!alreadyHad) {
            notificationService.createNotification(
                    user, 
                    "Weekly Leader! " + badge.getEmoji(), 
                    "You've earned the '" + badge.getName() + "' badge for this week.", 
                    "BADGE"
            );
        }
    }
}
