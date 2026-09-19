package com.beyondwords.learningservice.service;

import com.beyondwords.learningservice.dto.quiz.*;
import java.util.List;

public interface QuizService {
    List<QuizCategoryResponseDto> getQuizCategories();
    List<QuestionResponseDto> getQuizQuestions(Long levelId);
    QuizSubmitResponseDto submitQuizAttempt(String userEmail, Long levelId, QuizSubmitRequestDto request);
    java.util.Map<String, java.util.Map<String, Object>> getUserQuizScores(String userEmail);
}
