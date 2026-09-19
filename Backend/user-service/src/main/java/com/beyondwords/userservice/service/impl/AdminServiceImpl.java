package com.beyondwords.userservice.service.impl;

import com.beyondwords.userservice.dto.admin.*;
import com.beyondwords.userservice.entity.Announcement;
import com.beyondwords.userservice.entity.SiteSetting;
import com.beyondwords.userservice.repository.AnnouncementRepository;
import com.beyondwords.userservice.repository.SiteSettingRepository;
import com.beyondwords.userservice.repository.UserRepository;
import com.beyondwords.userservice.service.NotificationService;
import com.beyondwords.userservice.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {
    private final AnnouncementRepository announcementRepository;
    private final SiteSettingRepository siteSettingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    public List<Announcement> listAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    @Transactional
    public Announcement createAnnouncement(AnnouncementRequestDto request) {
        Announcement announcement = Announcement.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .type(request.getType() != null ? request.getType() : "info")
                .target(request.getTarget() != null ? request.getTarget() : "all")
                .status(request.getStatus() != null ? request.getStatus() : "active")
                .build();
        Announcement saved = announcementRepository.save(announcement);
        
        notificationService.broadcastAnnouncement(
                "New Announcement: " + request.getTitle(),
                request.getContent()
        );
        
        return saved;
    }

    @Override
    @Transactional
    public Announcement updateAnnouncement(Long id, AnnouncementRequestDto request) {
        Announcement announcement = announcementRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Announcement not found"));
        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getContent());
        if (request.getType() != null) announcement.setType(request.getType());
        if (request.getTarget() != null) announcement.setTarget(request.getTarget());
        if (request.getStatus() != null) announcement.setStatus(request.getStatus());
        return announcementRepository.save(announcement);
    }

    @Override
    @Transactional
    public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
    }

    @Override
    public SiteSettingsRequestDto getSettings() {
        boolean maintenance = "true".equals(getSettingValue("maintenance_mode"));
        String message = getSettingValue("maintenance_message");
        String expectedBack = getSettingValue("expected_back_time");
        String name = getSettingValue("platform_name");
        String tagline = getSettingValue("platform_tagline");
        String courseId = getSettingValue("featured_course_id");
        String welcome = getSettingValue("welcome_message");
        
        String defLessonStatus = getSettingValue("default_lesson_status");
        String defModuleStatus = getSettingValue("default_module_status");
        String rawAllowRevisit = getSettingValue("allow_revisit_lessons");
        Boolean allowRevisit = rawAllowRevisit != null ? Boolean.parseBoolean(rawAllowRevisit) : true;
        String rawShowDuration = getSettingValue("show_lesson_duration");
        Boolean showDuration = rawShowDuration != null ? Boolean.parseBoolean(rawShowDuration) : true;
        
        String rawQuizTimeLimit = getSettingValue("default_quiz_time_limit");
        Integer quizTimeLimit = rawQuizTimeLimit != null ? Integer.parseInt(rawQuizTimeLimit) : 30;
        String rawPassPercentage = getSettingValue("default_pass_percentage");
        Integer passPercentage = rawPassPercentage != null ? Integer.parseInt(rawPassPercentage) : 80;
        String rawShowCorrectAnswer = getSettingValue("show_correct_answer_after_wrong");
        Boolean showCorrectAnswer = rawShowCorrectAnswer != null ? Boolean.parseBoolean(rawShowCorrectAnswer) : true;
        String rawAllowQuizRetries = getSettingValue("allow_quiz_retries");
        Boolean allowQuizRetries = rawAllowQuizRetries != null ? Boolean.parseBoolean(rawAllowQuizRetries) : true;
        
        // XP Settings
        java.util.Map<String, Integer> xpPerLevel = new java.util.LinkedHashMap<>();
        for (int i = 1; i <= 6; i++) {
            String val = getSettingValue("xp_per_level_" + i);
            xpPerLevel.put("Level " + i, val != null ? Integer.parseInt(val) : 20);
        }
        String rawXpLessonComplete = getSettingValue("xp_lesson_complete");
        Integer xpLessonComplete = rawXpLessonComplete != null ? Integer.parseInt(rawXpLessonComplete) : 20;
        String rawXpQuizPass = getSettingValue("xp_quiz_pass");
        Integer xpQuizPass = rawXpQuizPass != null ? Integer.parseInt(rawXpQuizPass) : 150;
        String rawXpDailyLogin = getSettingValue("xp_daily_login");
        Integer xpDailyLogin = rawXpDailyLogin != null ? Integer.parseInt(rawXpDailyLogin) : 10;
        String rawXpStreakMaintain = getSettingValue("xp_streak_maintain");
        Integer xpStreakMaintain = rawXpStreakMaintain != null ? Integer.parseInt(rawXpStreakMaintain) : 100;
        
        return SiteSettingsRequestDto.builder()
                .maintenanceMode(maintenance)
                .maintenanceMessage(message != null ? message : "Platform is under scheduled maintenance.")
                .expectedBackTime(expectedBack != null ? expectedBack : "")
                .platformName(name != null ? name : "BeyondWords")
                .platformTagline(tagline != null ? tagline : "AI Sign Language Learning Suite")
                .featuredCourseId(courseId)
                .welcomeMessage(welcome != null ? welcome : "Ready to practice fingerspelling and daily vocabulary signs? Let's go!")
                .defaultLessonStatus(defLessonStatus != null ? defLessonStatus : "Unlocked")
                .defaultModuleStatus(defModuleStatus != null ? defModuleStatus : "Unlocked")
                .allowRevisitLessons(allowRevisit)
                .showLessonDuration(showDuration)
                .defaultQuizTimeLimit(quizTimeLimit)
                .defaultPassPercentage(passPercentage)
                .showCorrectAnswerAfterWrong(showCorrectAnswer)
                .allowQuizRetries(allowQuizRetries)
                .xpPerLevel(xpPerLevel)
                .xpLessonComplete(xpLessonComplete)
                .xpQuizPass(xpQuizPass)
                .xpDailyLogin(xpDailyLogin)
                .xpStreakMaintain(xpStreakMaintain)
                .build();
    }

    @Override
    @Transactional
    public SiteSettingsRequestDto updateSettings(SiteSettingsRequestDto request) {
        if (request.getMaintenanceMode() != null) {
            saveSetting("maintenance_mode", String.valueOf(request.getMaintenanceMode()));
        }
        if (request.getMaintenanceMessage() != null) {
            saveSetting("maintenance_message", request.getMaintenanceMessage());
        }
        if (request.getExpectedBackTime() != null) {
            saveSetting("expected_back_time", request.getExpectedBackTime());
        }
        if (request.getPlatformName() != null) {
            saveSetting("platform_name", request.getPlatformName());
        }
        if (request.getPlatformTagline() != null) {
            saveSetting("platform_tagline", request.getPlatformTagline());
        }
        if (request.getFeaturedCourseId() != null) {
            saveSetting("featured_course_id", request.getFeaturedCourseId());
        }
        if (request.getWelcomeMessage() != null) {
            saveSetting("welcome_message", request.getWelcomeMessage());
        }
        if (request.getDefaultLessonStatus() != null) {
            saveSetting("default_lesson_status", request.getDefaultLessonStatus());
        }
        if (request.getDefaultModuleStatus() != null) {
            saveSetting("default_module_status", request.getDefaultModuleStatus());
        }
        if (request.getAllowRevisitLessons() != null) {
            saveSetting("allow_revisit_lessons", String.valueOf(request.getAllowRevisitLessons()));
        }
        if (request.getShowLessonDuration() != null) {
            saveSetting("show_lesson_duration", String.valueOf(request.getShowLessonDuration()));
        }
        if (request.getDefaultQuizTimeLimit() != null) {
            saveSetting("default_quiz_time_limit", String.valueOf(request.getDefaultQuizTimeLimit()));
        }
        if (request.getDefaultPassPercentage() != null) {
            saveSetting("default_pass_percentage", String.valueOf(request.getDefaultPassPercentage()));
        }
        if (request.getShowCorrectAnswerAfterWrong() != null) {
            saveSetting("show_correct_answer_after_wrong", String.valueOf(request.getShowCorrectAnswerAfterWrong()));
        }
        if (request.getAllowQuizRetries() != null) {
            saveSetting("allow_quiz_retries", String.valueOf(request.getAllowQuizRetries()));
        }
        
        if (request.getXpPerLevel() != null) {
            for (java.util.Map.Entry<String, Integer> entry : request.getXpPerLevel().entrySet()) {
                String lvlNum = entry.getKey().replace("Level ", "");
                saveSetting("xp_per_level_" + lvlNum, String.valueOf(entry.getValue()));
            }
        }
        if (request.getXpLessonComplete() != null) {
            saveSetting("xp_lesson_complete", String.valueOf(request.getXpLessonComplete()));
        }
        if (request.getXpQuizPass() != null) {
            saveSetting("xp_quiz_pass", String.valueOf(request.getXpQuizPass()));
        }
        if (request.getXpDailyLogin() != null) {
            saveSetting("xp_daily_login", String.valueOf(request.getXpDailyLogin()));
        }
        if (request.getXpStreakMaintain() != null) {
            saveSetting("xp_streak_maintain", String.valueOf(request.getXpStreakMaintain()));
        }

        return getSettings();
    }

    @Override
    public java.util.List<com.beyondwords.userservice.entity.User> getUsersCreatedAfter(java.time.LocalDateTime date) {
        return userRepository.findByCreatedAtAfter(date);
    }

    private String getSettingValue(String key) {
        return siteSettingRepository.findById(key)
                .map(SiteSetting::getValue)
                .orElse(null);
    }

    private void saveSetting(String key, String value) {
        siteSettingRepository.save(SiteSetting.builder()
                .key(key)
                .value(value)
                .build());
    }
}
