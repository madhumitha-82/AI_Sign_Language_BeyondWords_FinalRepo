package com.beyondwords.learningservice.service.impl;

import com.beyondwords.learningservice.dto.quiz.*;
import com.beyondwords.learningservice.entity.*;
import com.beyondwords.learningservice.mapper.QuizMapper;
import com.beyondwords.learningservice.repository.*;
import com.beyondwords.learningservice.service.QuizService;
import com.beyondwords.learningservice.client.UserServiceClient;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {
    private final QuizCategoryRepository categoryRepository;
    private final QuizLevelRepository levelRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizAttemptRepository attemptRepository;
    private final QuizMapper quizMapper;
    private final UserServiceClient userServiceClient;

    /** XP awarded for passing a quiz level for the first time */
    private static final int QUIZ_PASS_XP = 30;
    /** Minimum accuracy to qualify as a pass */
    private static final int PASS_ACCURACY_THRESHOLD = 50;

    @PostConstruct
    @Transactional
    public void seedQuizzes() {
        if (categoryRepository.count() == 0) {
            // Category 1: Alphabets
            QuizCategory alphabets = QuizCategory.builder()
                    .slug("alphabets")
                    .name("Alphabets")
                    .icon("🔤")
                    .description("Master A to Z hand signs")
                    .build();
            categoryRepository.save(alphabets);

            QuizLevel level1 = QuizLevel.builder()
                    .category(alphabets)
                    .title("Letters A–G")
                    .difficulty("Easy")
                    .xpReward(80)
                    .levelOrder(1)
                    .unlocked(true)
                    .build();
            levelRepository.save(level1);

            QuizQuestion q1 = QuizQuestion.builder()
                    .level(level1)
                    .questionText("Which ASL letter is shown in this sign configuration?")
                    .signImageUrl("https://beyondwords.edu/assets/signs/a.jpg")
                    .correctAnswer("A")
                    .build();
            questionRepository.save(q1);

            List<QuizOption> q1Opts = List.of(
                    QuizOption.builder().question(q1).optionText("A").build(),
                    QuizOption.builder().question(q1).optionText("B").build(),
                    QuizOption.builder().question(q1).optionText("C").build(),
                    QuizOption.builder().question(q1).optionText("D").build()
            );
            q1.setOptions(new ArrayList<>(q1Opts));
            questionRepository.save(q1);

            QuizQuestion q2 = QuizQuestion.builder()
                    .level(level1)
                    .questionText("Which ASL letter configuration requires a closed fist with thumb crossing over the fingers?")
                    .signImageUrl("")
                    .correctAnswer("S")
                    .build();
            questionRepository.save(q2);

            List<QuizOption> q2Opts = List.of(
                    QuizOption.builder().question(q2).optionText("A").build(),
                    QuizOption.builder().question(q2).optionText("S").build(),
                    QuizOption.builder().question(q2).optionText("T").build(),
                    QuizOption.builder().question(q2).optionText("M").build()
            );
            q2.setOptions(new ArrayList<>(q2Opts));
            questionRepository.save(q2);

            // Category 2: Greetings
            QuizCategory greetings = QuizCategory.builder()
                    .slug("greetings")
                    .name("Greetings")
                    .icon("👋")
                    .description("Sign daily greetings and common actions")
                    .build();
            categoryRepository.save(greetings);

            QuizLevel level2 = QuizLevel.builder()
                    .category(greetings)
                    .title("Greetings Basics")
                    .difficulty("Easy")
                    .xpReward(80)
                    .levelOrder(1)
                    .unlocked(true)
                    .build();
            levelRepository.save(level2);

            QuizQuestion q3 = QuizQuestion.builder()
                    .level(level2)
                    .questionText("Identify the sign gesture for 'Hello'.")
                    .signImageUrl("")
                    .correctAnswer("Hello")
                    .build();
            questionRepository.save(q3);

            List<QuizOption> q3Opts = List.of(
                    QuizOption.builder().question(q3).optionText("Hello").build(),
                    QuizOption.builder().question(q3).optionText("Thank you").build(),
                    QuizOption.builder().question(q3).optionText("Goodbye").build(),
                    QuizOption.builder().question(q3).optionText("Please").build()
            );
            q3.setOptions(new ArrayList<>(q3Opts));
            questionRepository.save(q3);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizCategoryResponseDto> getQuizCategories() {
        return categoryRepository.findAllWithLevelsAndQuestions().stream()
                .map(quizMapper::toCategoryDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionResponseDto> getQuizQuestions(Long levelId) {
        return questionRepository.findAllByLevelId(levelId).stream()
                .map(quizMapper::toQuestionDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public QuizSubmitResponseDto submitQuizAttempt(String userEmail, Long levelId, QuizSubmitRequestDto request) {
        QuizLevel level = levelRepository.findById(levelId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz level not found"));

        // Calculate accuracy if not provided by client
        int accuracy = 0;
        if (request.getAccuracy() != null) {
            accuracy = request.getAccuracy();
        } else if (request.getTotalQuestions() != null && request.getTotalQuestions() > 0 && request.getScore() != null) {
            accuracy = (int) Math.round((request.getScore() * 100.0) / request.getTotalQuestions());
        }

        // Anti-farming: only award XP on first pass of this level
        boolean alreadyPassed = attemptRepository
                .existsByUserEmailAndLevelIdAndAccuracyGreaterThanEqual(userEmail, levelId, PASS_ACCURACY_THRESHOLD);

        int xpEarned = 0;
        if (accuracy >= PASS_ACCURACY_THRESHOLD && !alreadyPassed) {
            xpEarned = QUIZ_PASS_XP;
            if (accuracy == 100) {
                xpEarned += 10; // Perfect-score bonus
            }
            // Persist XP to user profile
            userServiceClient.addXp(userEmail, xpEarned);
        }

        // Save Attempt
        QuizAttempt attempt = QuizAttempt.builder()
                .userEmail(userEmail)
                .levelId(levelId)
                .score(request.getScore())
                .totalQuestions(request.getTotalQuestions())
                .accuracy(accuracy)
                .timeTaken(request.getTimeTaken() != null ? request.getTimeTaken() : "N/A")
                .xpEarned(xpEarned)
                .build();
        attemptRepository.save(attempt);

        List<String> badges = new ArrayList<>();
        if (accuracy == 100) {
            badges.add("Badge Unlocked: Perfect 100");
        }
        if (attemptRepository.countByUserEmail(userEmail) == 1) {
            badges.add("Badge Unlocked: First Sign Steps");
        }

        return QuizSubmitResponseDto.builder()
                .xpEarned(xpEarned)
                .accuracy(accuracy)
                .score(request.getScore())
                .totalQuestions(request.getTotalQuestions())
                .badgesUnlocked(badges)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.Map<String, java.util.Map<String, Object>> getUserQuizScores(String userEmail) {
        List<QuizAttempt> attempts = attemptRepository.findAllByUserEmail(userEmail);
        java.util.Map<String, java.util.Map<String, Object>> result = new java.util.HashMap<>();
        
        for (QuizAttempt attempt : attempts) {
            QuizLevel level = levelRepository.findById(attempt.getLevelId()).orElse(null);
            if (level != null) {
                String key = level.getCategory().getSlug() + "_" + level.getId();
                java.util.Map<String, Object> currentBest = result.get(key);
                
                boolean passed = attempt.getAccuracy() >= PASS_ACCURACY_THRESHOLD;
                if (currentBest == null || attempt.getScore() > (Integer) currentBest.get("score")) {
                    java.util.Map<String, Object> scoreData = new java.util.HashMap<>();
                    scoreData.put("score", attempt.getScore());
                    scoreData.put("passed", passed || (currentBest != null && (Boolean) currentBest.get("passed")));
                    result.put(key, scoreData);
                } else if (passed) {
                    currentBest.put("passed", true);
                }
            }
        }
        return result;
    }
}
