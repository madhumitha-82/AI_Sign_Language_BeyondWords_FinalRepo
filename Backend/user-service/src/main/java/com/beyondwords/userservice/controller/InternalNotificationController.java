package com.beyondwords.userservice.controller;

import com.beyondwords.userservice.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/users/internal/notifications")
public class InternalNotificationController {

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/broadcast")
    public ResponseEntity<Void> broadcastAnnouncement(@RequestBody Map<String, String> request) {
        String title = request.get("title");
        String message = request.get("message");
        
        if (title == null || message == null) {
            return ResponseEntity.badRequest().build();
        }
        
        notificationService.broadcastAnnouncement(title, message);
        return ResponseEntity.ok().build();
    }
}
