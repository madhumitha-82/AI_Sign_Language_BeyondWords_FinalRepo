package com.beyondwords.userservice.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        String message = ex.getMessage();
        // Conflict: email already registered
        if (message != null && message.toLowerCase().contains("already")) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Conflict", "message", message));
        }
        // Bad credentials or other bad input
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Bad Request", "message", message != null ? message : "Invalid input"));
    }
}
