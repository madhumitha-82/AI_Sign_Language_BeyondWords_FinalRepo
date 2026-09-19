package com.beyondwords.analyticsservice.service;

import com.beyondwords.analyticsservice.dto.ai.*;

public interface AiService {
    GestureRecognizeResponseDto recognizeGesture(String userEmail, GestureRecognizeRequestDto request);
    AiRecommendationResponseDto getRecommendations(String userEmail);
}
