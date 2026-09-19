package com.beyondwords.learningservice.controller;

import com.beyondwords.learningservice.dto.TopQuizDto;
import com.beyondwords.learningservice.repository.CourseRepository;
import com.beyondwords.learningservice.repository.LessonRepository;
import com.beyondwords.learningservice.repository.QuizAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCourses", courseRepository.count());
        stats.put("publishedCourses", courseRepository.countByStatus("published"));
        stats.put("draftCourses", courseRepository.countByStatus("draft"));
        stats.put("totalLessons", lessonRepository.count());
        
        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.now().with(LocalTime.MAX);
        stats.put("quizCompletedToday", quizAttemptRepository.countByCreatedAtBetween(startOfDay, endOfDay));
        
        return stats;
    }

    @GetMapping("/top-quizzes")
    public List<TopQuizDto> getTopQuizzesThisWeek() {
        LocalDateTime startOfWeek = LocalDateTime.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).with(LocalTime.MIN);
        LocalDateTime endOfWeek = LocalDateTime.now().with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).with(LocalTime.MAX);
        return quizAttemptRepository.findTopQuizzesThisWeek(startOfWeek, endOfWeek, PageRequest.of(0, 3));
    }
}
