package com.beyondwords.learningservice.controller;

import com.beyondwords.learningservice.dto.CourseResponseDto;
import com.beyondwords.learningservice.dto.LessonNotesRequestDto;
import com.beyondwords.learningservice.dto.LessonResponseDto;
import com.beyondwords.learningservice.entity.Course;
import com.beyondwords.learningservice.repository.CourseRepository;
import com.beyondwords.learningservice.service.LearningService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class LearningController {
    private final LearningService learningService;
    private final CourseRepository courseRepository;
    
    @GetMapping
    public java.util.List<Course> getAllCourses() {
        return courseRepository.findAllPublishedCoursesWithModulesAndLessons();
    }

    @GetMapping("/active")
    public CourseResponseDto getActiveCourse() {
        return learningService.getActiveCourse();
    }

    @GetMapping("/lessons/{id}")
    public LessonResponseDto getLesson(@PathVariable Long id) {
        return learningService.getLesson(id);
    }

    @PostMapping("/lessons/{id}/notes")
    public Map<String, Object> saveNotes(@PathVariable Long id,
                                         Authentication authentication,
                                         @RequestBody LessonNotesRequestDto request) {
        System.out.println("RECEIVED POST REQUEST FOR NOTES. ID: " + id + ", AUTH: " + (authentication != null ? authentication.getName() : "null"));
        String userEmail = authentication != null ? authentication.getName() : "anonymousUser";
        learningService.saveNotes(userEmail, id, request.getNotesText());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Notes auto-saved successfully");
        return response;
    }

    @GetMapping("/lessons/{id}/notes")
    public Map<String, String> getNotes(@PathVariable Long id,
                                        Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : "anonymousUser";
        String notesText = learningService.getNotes(userEmail, id);
        Map<String, String> response = new HashMap<>();
        response.put("notesText", notesText);
        return response;
    }

    @GetMapping("/bookmarks")
    public List<Long> getBookmarks(Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : "anonymousUser";
        return learningService.getBookmarks(userEmail);
    }

    @PostMapping("/bookmarks/{lessonId}")
    public Map<String, Object> addBookmark(@PathVariable Long lessonId, Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : "anonymousUser";
        learningService.addBookmark(userEmail, lessonId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return response;
    }

    @DeleteMapping("/bookmarks/{lessonId}")
    public Map<String, Object> removeBookmark(@PathVariable Long lessonId, Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : "anonymousUser";
        learningService.removeBookmark(userEmail, lessonId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return response;
    }

    @ExceptionHandler(Exception.class)
    public org.springframework.http.ResponseEntity<String> handleException(Exception e) {
        System.err.println("GLOBAL EXCEPTION IN LEARNING CONTROLLER: " + e.getMessage());
        e.printStackTrace();
        return org.springframework.http.ResponseEntity.status(500).body(e.getMessage());
    }
}
