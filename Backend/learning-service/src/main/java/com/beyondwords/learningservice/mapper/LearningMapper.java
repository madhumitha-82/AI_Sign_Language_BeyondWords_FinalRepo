package com.beyondwords.learningservice.mapper;

import com.beyondwords.learningservice.dto.CourseResponseDto;
import com.beyondwords.learningservice.dto.LessonResponseDto;
import com.beyondwords.learningservice.dto.ModuleResponseDto;
import com.beyondwords.learningservice.entity.Course;
import com.beyondwords.learningservice.entity.Lesson;
import com.beyondwords.learningservice.entity.Module;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;

@Component
public class LearningMapper {

    public CourseResponseDto toCourseDto(Course course) {
        if (course == null) return null;
        return CourseResponseDto.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .status(course.getStatus())
                .modules(course.getModules().stream()
                        .map(this::toModuleDto)
                        .collect(Collectors.toList()))
                .build();
    }

    public ModuleResponseDto toModuleDto(Module module) {
        if (module == null) return null;
        return ModuleResponseDto.builder()
                .id(module.getId())
                .courseId(module.getCourse().getId())
                .title(module.getTitle())
                .description(module.getDescription())
                .order(module.getModuleOrder())
                .status(module.getStatus())
                .lessons(module.getLessons().stream()
                        .map(this::toLessonDto)
                        .collect(Collectors.toList()))
                .build();
    }

    public LessonResponseDto toLessonDto(Lesson lesson) {
        if (lesson == null) return null;
        return LessonResponseDto.builder()
                .id(lesson.getId())
                .moduleId(lesson.getModule().getId())
                .title(lesson.getTitle())
                .type("lesson")
                .videoUrl(lesson.getVideoUrl())
                .meaning(lesson.getMeaning())
                .aiExplanation(lesson.getAiExplanation())
                .exampleSentence(lesson.getExampleSentence())
                .status(lesson.getModule().getStatus()) // map hierarchy status
                .durationMinutes(lesson.getDurationMinutes())
                .lessonOrder(lesson.getLessonOrder())
                .build();
    }
}
