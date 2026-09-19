package com.beyondwords.learningservice.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Internal HTTP client for calling user-service XP endpoints.
 * Uses RestTemplate (no Feign dependency required).
 */
@Component
@Slf4j
public class UserServiceClient {

    private final RestTemplate restTemplate;
    private final String userServiceBaseUrl;

    public UserServiceClient(RestTemplate restTemplate,
                             @Value("${app.user-service.url:http://localhost:8081}") String userServiceBaseUrl) {
        this.restTemplate = restTemplate;
        this.userServiceBaseUrl = userServiceBaseUrl;
    }

    /**
     * Atomically add XP to a user's profile.
     * Returns the updated total XP, or -1 if the call fails.
     */
    public int addXp(String userEmail, int xpDelta) {
        if (xpDelta <= 0) return 0;
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("email", userEmail);
            payload.put("xp", xpDelta);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    userServiceBaseUrl + "/api/users/internal/xp/add",
                    payload,
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object updated = response.getBody().get("updatedXp");
                return updated != null ? ((Number) updated).intValue() : -1;
            }
        } catch (Exception e) {
            log.error("Failed to add XP for user {}: {}", userEmail, e.getMessage());
        }
        return -1;
    }

    public void awardBadge(String userEmail, String badgeType) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("email", userEmail);
            payload.put("badgeType", badgeType);

            restTemplate.postForEntity(
                    userServiceBaseUrl + "/api/users/internal/badges/award",
                    payload,
                    Void.class
            );
        } catch (Exception e) {
            log.error("Failed to award badge {} for user {}: {}", badgeType, userEmail, e.getMessage());
        }
    }

    /**
     * Broadcast an announcement to all users via user-service.
     */
    public void broadcastAnnouncement(String title, String message) {
        try {
            Map<String, String> payload = new HashMap<>();
            payload.put("title", title);
            payload.put("message", message);

            restTemplate.postForEntity(
                    userServiceBaseUrl + "/api/users/internal/notifications/broadcast",
                    payload,
                    Void.class
            );
        } catch (Exception e) {
            log.error("Failed to broadcast announcement '{}': {}", title, e.getMessage());
        }
    }
}
