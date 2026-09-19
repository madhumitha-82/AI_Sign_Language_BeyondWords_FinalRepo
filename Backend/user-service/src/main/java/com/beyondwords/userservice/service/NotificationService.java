package com.beyondwords.userservice.service;

import com.beyondwords.userservice.dto.notification.NotificationResponseDto;
import com.beyondwords.userservice.entity.Notification;
import com.beyondwords.userservice.entity.User;
import com.beyondwords.userservice.repository.NotificationRepository;
import com.beyondwords.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void createNotification(User user, String title, String message, String type) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional
    public void broadcastAnnouncement(String title, String message) {
        // Find all users and create a notification for each
        // For a very large scale app, this would be a single SystemNotification entity that users fetch 
        // with a separate read-status tracking table. For the current scale, creating individual records is requested.
        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            createNotification(user, title, message, "ANNOUNCEMENT");
        }
    }

    public List<NotificationResponseDto> getUserNotifications(User user, int limit) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(0, limit))
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Transactional
    public void markAsRead(Long notificationId, User user) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            if (notification.getUser().getId().equals(user.getId())) {
                notification.setIsRead(true);
                notificationRepository.save(notification);
            }
        });
    }

    @Transactional
    public void markAllAsRead(User user) {
        // Only fetch unread to optimize
        List<Notification> unreadNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(0, 1000))
                .stream()
                .filter(n -> !n.getIsRead())
                .collect(Collectors.toList());
                
        for (Notification n : unreadNotifications) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(unreadNotifications);
    }

    private NotificationResponseDto mapToDto(Notification notification) {
        return NotificationResponseDto.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
