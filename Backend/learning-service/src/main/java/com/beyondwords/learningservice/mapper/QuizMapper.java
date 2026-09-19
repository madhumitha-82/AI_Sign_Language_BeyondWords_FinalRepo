package com.beyondwords.learningservice.mapper;

import com.beyondwords.learningservice.dto.quiz.*;
import com.beyondwords.learningservice.entity.*;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;

@Component
public class QuizMapper {

    public QuizCategoryResponseDto toCategoryDto(QuizCategory category) {
        if (category == null) return null;
        return QuizCategoryResponseDto.builder()
                .slug(category.getSlug())
                .name(category.getName())
                .icon(category.getIcon())
                .description(category.getDescription())
                .levels(category.getLevels().stream()
                        .map(this::toLevelDto)
                        .collect(Collectors.toList()))
                .build();
    }

    public QuizLevelResponseDto toLevelDto(QuizLevel level) {
        if (level == null) return null;
        return QuizLevelResponseDto.builder()
                .id(level.getId())
                .title(level.getTitle())
                .difficulty(level.getDifficulty())
                .xp(level.getXpReward())
                .unlocked(level.getUnlocked())
                .questionsCount(level.getQuestions().size())
                .build();
    }

    public QuestionResponseDto toQuestionDto(QuizQuestion question) {
        if (question == null) return null;
        return QuestionResponseDto.builder()
                .id(question.getId())
                .question(question.getQuestionText())
                .image(question.getSignImageUrl())
                .options(question.getOptions().stream()
                        .map(QuizOption::getOptionText)
                        .collect(Collectors.toList()))
                .correctAnswer(question.getCorrectAnswer())
                .build();
    }
}
