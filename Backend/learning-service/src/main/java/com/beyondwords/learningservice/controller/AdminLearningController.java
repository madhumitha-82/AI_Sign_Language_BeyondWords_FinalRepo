package com.beyondwords.learningservice.controller;

import com.beyondwords.learningservice.dto.*;
import com.beyondwords.learningservice.entity.*;
import com.beyondwords.learningservice.repository.*;
import com.beyondwords.learningservice.service.LearningService;
import com.beyondwords.learningservice.client.UserServiceClient;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminLearningController {
    private final LearningService learningService;
    private final CourseRepository courseRepository;
    private final QuizCategoryRepository quizCategoryRepository;
    private final QuizLevelRepository quizLevelRepository;
    private final UserServiceClient userServiceClient;

    // ─────────────────────────────────────────────────────────
    // COURSE CRUD
    // ─────────────────────────────────────────────────────────

    @GetMapping("/courses")
    public List<Course> listCourses() {
        return courseRepository.findAll();
    }

    @PostMapping("/courses")
    @ResponseStatus(HttpStatus.CREATED)
    public Course createCourse(@RequestBody Map<String, Object> body) {
        Course course = new Course();
        course.setTitle((String) body.getOrDefault("title", "Untitled Course"));
        course.setDescription((String) body.getOrDefault("description", ""));
        course.setStatus((String) body.getOrDefault("status", "draft"));
        Course saved = courseRepository.save(course);
        userServiceClient.broadcastAnnouncement("New Course Available: " + saved.getTitle(), "Check out the new course in the Learning section!");
        return saved;
    }

    @PutMapping("/courses/{id}")
    public Course updateCourse(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + id));
        if (body.containsKey("title"))       course.setTitle((String) body.get("title"));
        if (body.containsKey("description")) course.setDescription((String) body.get("description"));
        if (body.containsKey("status"))      course.setStatus((String) body.get("status"));
        return courseRepository.save(course);
    }

    @DeleteMapping("/courses/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCourse(@PathVariable Long id) {
        courseRepository.deleteById(id);
    }

    // ─────────────────────────────────────────────────────────
    // MODULES CRUD
    // ─────────────────────────────────────────────────────────

    @PostMapping("/modules")
    @ResponseStatus(HttpStatus.CREATED)
    public ModuleResponseDto addModule(@Valid @RequestBody ModuleRequestDto request) {
        return learningService.addModule(request);
    }

    @PutMapping("/modules/{id}")
    public ModuleResponseDto editModule(@PathVariable Long id, @Valid @RequestBody ModuleRequestDto request) {
        return learningService.editModule(id, request);
    }

    @DeleteMapping("/modules/{id}")
    public Map<String, Object> deleteModule(@PathVariable Long id) {
        learningService.deleteModule(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Module deleted successfully");
        return response;
    }

    // ─────────────────────────────────────────────────────────
    // LESSONS CRUD
    // ─────────────────────────────────────────────────────────

    @PostMapping("/modules/{moduleId}/lessons")
    @ResponseStatus(HttpStatus.CREATED)
    public LessonResponseDto addLesson(@PathVariable Long moduleId, @Valid @RequestBody LessonRequestDto request) {
        return learningService.addLesson(moduleId, request);
    }

    @PutMapping("/modules/{moduleId}/lessons/{lessonId}")
    public LessonResponseDto editLesson(@PathVariable Long moduleId,
                                        @PathVariable Long lessonId,
                                        @Valid @RequestBody LessonRequestDto request) {
        return learningService.editLesson(moduleId, lessonId, request);
    }

    @DeleteMapping("/modules/{moduleId}/lessons/{lessonId}")
    public Map<String, Object> deleteLesson(@PathVariable Long moduleId, @PathVariable Long lessonId) {
        learningService.deleteLesson(moduleId, lessonId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lesson deleted successfully");
        return response;
    }

    // ─────────────────────────────────────────────────────────
    // QUIZ CATEGORY CRUD
    // ─────────────────────────────────────────────────────────

    @PostMapping("/quizzes/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public QuizCategory createCategory(@RequestBody Map<String, String> body) {
        QuizCategory cat = new QuizCategory();
        cat.setName(body.getOrDefault("name", ""));
        cat.setSlug(body.getOrDefault("slug", "").toLowerCase().replaceAll("[^a-z0-9]", "-"));
        cat.setIcon(body.getOrDefault("icon", "📚"));
        cat.setDescription(body.getOrDefault("description", ""));
        return quizCategoryRepository.save(cat);
    }

    @PutMapping("/quizzes/categories/{id}")
    public QuizCategory updateCategory(@PathVariable Long id, @RequestBody Map<String, String> body) {
        QuizCategory cat = quizCategoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found: " + id));
        if (body.containsKey("name"))        cat.setName(body.get("name"));
        if (body.containsKey("slug"))        cat.setSlug(body.get("slug").toLowerCase().replaceAll("[^a-z0-9]", "-"));
        if (body.containsKey("icon"))        cat.setIcon(body.get("icon"));
        if (body.containsKey("description")) cat.setDescription(body.get("description"));
        return quizCategoryRepository.save(cat);
    }

    // ─────────────────────────────────────────────────────────
    // QUIZ LEVEL CRUD
    // ─────────────────────────────────────────────────────────

    @PostMapping("/quizzes/levels")
    @ResponseStatus(HttpStatus.CREATED)
    public QuizLevel createLevel(@RequestBody Map<String, Object> body) {
        QuizLevel level = new QuizLevel();
        level.setTitle((String) body.getOrDefault("title", "New Level"));
        level.setDifficulty((String) body.getOrDefault("difficulty", "Easy"));
        level.setXpReward(body.containsKey("xpReward") ? ((Number) body.get("xpReward")).intValue() : 80);
        level.setUnlocked(Boolean.TRUE.equals(body.getOrDefault("unlocked", false)));
        // levelOrder defaults to next available order or 1
        int order = body.containsKey("levelOrder") ? ((Number) body.get("levelOrder")).intValue()
                : (int) (quizLevelRepository.count() + 1);
        level.setLevelOrder(order);
        if (body.containsKey("categoryId")) {
            Long catId = ((Number) body.get("categoryId")).longValue();
            quizCategoryRepository.findById(catId).ifPresent(level::setCategory);
        }
        QuizLevel saved = quizLevelRepository.save(level);
        userServiceClient.broadcastAnnouncement("New Quiz Available: " + saved.getTitle(), "Test your knowledge with our newest quiz!");
        return saved;
    }

    @PutMapping("/quizzes/levels/{id}")
    public QuizLevel updateLevel(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        QuizLevel level = quizLevelRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Level not found: " + id));
        if (body.containsKey("title"))      level.setTitle((String) body.get("title"));
        if (body.containsKey("difficulty")) level.setDifficulty((String) body.get("difficulty"));
        if (body.containsKey("xpReward"))   level.setXpReward(((Number) body.get("xpReward")).intValue());
        if (body.containsKey("unlocked"))   level.setUnlocked(Boolean.TRUE.equals(body.get("unlocked")));
        return quizLevelRepository.save(level);
    }

    @DeleteMapping("/quizzes/levels/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLevel(@PathVariable Long id) {
        quizLevelRepository.deleteById(id);
    }
}
