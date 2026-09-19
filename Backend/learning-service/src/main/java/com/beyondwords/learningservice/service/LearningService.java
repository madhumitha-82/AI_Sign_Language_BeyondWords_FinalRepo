package com.beyondwords.learningservice.service;

import com.beyondwords.learningservice.dto.*;
import java.util.List;

public interface LearningService {
    CourseResponseDto getActiveCourse();
    LessonResponseDto getLesson(Long lessonId);
    void saveNotes(String userEmail, Long lessonId, String notesText);
    String getNotes(String userEmail, Long lessonId);

    // Admin Syllabus Management APIs
    ModuleResponseDto addModule(ModuleRequestDto request);
    ModuleResponseDto editModule(Long moduleId, ModuleRequestDto request);
    void deleteModule(Long moduleId);

    LessonResponseDto addLesson(Long moduleId, LessonRequestDto request);
    LessonResponseDto editLesson(Long moduleId, Long lessonId, LessonRequestDto request);
    void deleteLesson(Long moduleId, Long lessonId);
    // Bookmark methods
    java.util.List<Long> getBookmarks(String userEmail);
    void addBookmark(String userEmail, Long lessonId);
    void removeBookmark(String userEmail, Long lessonId);
    void evaluateCompletion(String userEmail, Long lessonId);
}
