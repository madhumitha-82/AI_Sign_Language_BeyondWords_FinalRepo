package com.beyondwords.analyticsservice.controller;

import com.beyondwords.analyticsservice.dto.ai.*;
import com.beyondwords.analyticsservice.service.AiService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class AiController {
    private final AiService aiService;

    @PostMapping("/recognize")
    public GestureRecognizeResponseDto recognizeGesture(
            @RequestBody GestureRecognizeRequestDto request,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "anonymousUser";
        return aiService.recognizeGesture(email, request);
    }

    @GetMapping("/recommendations")
    public AiRecommendationResponseDto getRecommendations(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "tester@beyondwords.edu";
        return aiService.getRecommendations(email);
    }
}
