package com.beyondwords.learningservice.controller;

import com.beyondwords.learningservice.dto.quiz.*;
import com.beyondwords.learningservice.service.QuizService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class QuizController {
    private final QuizService quizService;

    @GetMapping("/categories")
    public List<QuizCategoryResponseDto> getCategories() {
        return quizService.getQuizCategories();
    }

    @GetMapping("/levels/{levelId}/questions")
    public List<QuestionResponseDto> getQuestions(@PathVariable Long levelId) {
        return quizService.getQuizQuestions(levelId);
    }

    @PostMapping("/levels/{levelId}/submit")
    public QuizSubmitResponseDto submitQuiz(
            @PathVariable Long levelId,
            @RequestBody QuizSubmitRequestDto request,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "anonymousUser";
        return quizService.submitQuizAttempt(email, levelId, request);
    }

    @GetMapping("/scores/me")
    public java.util.Map<String, java.util.Map<String, Object>> getMyScores(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "anonymousUser";
        return quizService.getUserQuizScores(email);
    }
}
