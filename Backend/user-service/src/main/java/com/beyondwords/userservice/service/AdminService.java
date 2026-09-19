package com.beyondwords.userservice.service;

import com.beyondwords.userservice.dto.admin.*;
import com.beyondwords.userservice.entity.Announcement;
import java.util.List;

public interface AdminService {
    List<Announcement> listAnnouncements();
    Announcement createAnnouncement(AnnouncementRequestDto request);
    Announcement updateAnnouncement(Long id, AnnouncementRequestDto request);
    void deleteAnnouncement(Long id);
    
    SiteSettingsRequestDto getSettings();
    SiteSettingsRequestDto updateSettings(SiteSettingsRequestDto request);
    List<com.beyondwords.userservice.entity.User> getUsersCreatedAfter(java.time.LocalDateTime date);
}
