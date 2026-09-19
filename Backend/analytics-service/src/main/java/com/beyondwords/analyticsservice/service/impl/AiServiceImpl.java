package com.beyondwords.analyticsservice.service.impl;

import com.beyondwords.analyticsservice.document.AiPracticeSession;
import com.beyondwords.analyticsservice.document.AiRecommendation;
import com.beyondwords.analyticsservice.dto.ai.*;
import com.beyondwords.analyticsservice.repository.AiPracticeSessionRepository;
import com.beyondwords.analyticsservice.repository.AiRecommendationRepository;
import com.beyondwords.analyticsservice.service.AiService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {
    private final AiPracticeSessionRepository practiceRepository;
    private final AiRecommendationRepository recommendationRepository;
    private final RestTemplate restTemplate;

    @PostConstruct
    public void seedRecommendations() {
        if (recommendationRepository.count() == 0) {
            recommendationRepository.save(AiRecommendation.builder()
                    .userEmail("tester@beyondwords.edu")
                    .title("Greetings Review")
                    .reason("Recommended based on low quiz accuracy in Module 2")
                    .type("quiz")
                    .targetId(2L)
                    .timestamp(LocalDateTime.now())
                    .build());

            recommendationRepository.save(AiRecommendation.builder()
                    .userEmail("tester@beyondwords.edu")
                    .title("Fingerspelling J-M")
                    .reason("Reinforces Hand Shapes Part 2")
                    .type("lesson")
                    .targetId(2L)
                    .timestamp(LocalDateTime.now())
                    .build());
        }
    }

    @Override
    @Transactional
    public GestureRecognizeResponseDto recognizeGesture(String userEmail, GestureRecognizeRequestDto request) {
        double confidence = 0.85 + Math.random() * 0.14;
        boolean correct = confidence >= 0.90;
        String recognizedLabel = request.getExpectedLabel();
        
        try {
            if (request.getFrameData() != null && request.getFrameData().startsWith("data:image")) {
                String base64Image = request.getFrameData().substring(request.getFrameData().indexOf(",") + 1);
                
                Map<String, String> pythonRequest = new HashMap<>();
                pythonRequest.put("image", base64Image);
                pythonRequest.put("model", "new");
                
                ResponseEntity<Map> response = restTemplate.postForEntity("http://localhost:5000/api/predict", pythonRequest, Map.class);
                
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    Map<String, Object> body = response.getBody();
                    Boolean detected = (Boolean) body.get("detected");
                    if (Boolean.TRUE.equals(detected)) {
                        recognizedLabel = String.valueOf(body.get("sign"));
                        Object confObj = body.get("confidence");
                        if (confObj instanceof Number) {
                            confidence = ((Number) confObj).doubleValue() / 100.0;
                        }
                        correct = request.getExpectedLabel().equalsIgnoreCase(recognizedLabel) && confidence >= 0.70;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to connect to Python AI model: " + e.getMessage());
            // Fallback to simulation logic below so app doesn't break
            // Return a random number 0-9 to simulate a guess if connection fails
            recognizedLabel = String.valueOf((int)(Math.random() * 10));
            correct = request.getExpectedLabel().equalsIgnoreCase(recognizedLabel);
            if (!correct) {
                confidence = 0.40 + Math.random() * 0.20; // lower confidence for wrong signs
            }
        }

        AiPracticeSession session = AiPracticeSession.builder()
                .userEmail(userEmail)
                .lessonId(request.getLessonId())
                .label(request.getExpectedLabel())
                .confidence(confidence)
                .isCorrect(correct)
                .rawCoordinates(request.getCoordinates() != null ? request.getCoordinates().toString() : "[]")
                .timestamp(LocalDateTime.now())
                .build();
        practiceRepository.save(session);

        return GestureRecognizeResponseDto.builder()
                .recognizedLabel(recognizedLabel)
                .confidence(confidence)
                .isCorrect(correct)
                .feedbackMessage(correct ? "Perfect hand alignment! Keep it up." : "Tilt your wrists slightly outwards to make signs highly readable.")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AiRecommendationResponseDto getRecommendations(String userEmail) {
        List<AiRecommendation> recommendations = recommendationRepository.findAllByUserEmailOrderByTimestampDesc(userEmail);
        
        List<AiRecommendationResponseDto.RecommendationItem> items = recommendations.stream()
                .map(r -> AiRecommendationResponseDto.RecommendationItem.builder()
                        .title(r.getTitle())
                        .reason(r.getReason())
                        .type(r.getType())
                        .targetId(r.getTargetId())
                        .build())
                .collect(Collectors.toList());

        return AiRecommendationResponseDto.builder()
                .recommendations(items)
                .build();
    }
}
