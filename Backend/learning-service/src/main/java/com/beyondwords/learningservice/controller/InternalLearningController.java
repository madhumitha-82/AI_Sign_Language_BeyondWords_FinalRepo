package com.beyondwords.learningservice.controller;

import com.beyondwords.learningservice.service.LearningService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/courses/internal")
public class InternalLearningController {

    @Autowired
    private LearningService learningService;

    @PostMapping("/evaluate-completion")
    public ResponseEntity<Void> evaluateCompletion(@RequestBody Map<String, Object> request) {
        String email = (String) request.get("email");
        Object lessonIdObj = request.get("lessonId");
        
        if (email == null || lessonIdObj == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Long lessonId = ((Number) lessonIdObj).longValue();
        learningService.evaluateCompletion(email, lessonId);
        
        return ResponseEntity.ok().build();
    }
}
