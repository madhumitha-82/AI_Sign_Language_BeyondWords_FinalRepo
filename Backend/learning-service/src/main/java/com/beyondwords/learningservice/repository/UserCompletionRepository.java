package com.beyondwords.learningservice.repository;

import com.beyondwords.learningservice.entity.UserCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserCompletionRepository extends JpaRepository<UserCompletion, Long> {
    Optional<UserCompletion> findByUserEmailAndCompletionTypeAndEntityId(String userEmail, String completionType, Long entityId);
    
    long countByUserEmailAndCompletionTypeAndCompletedAtBetween(String userEmail, String completionType, LocalDateTime start, LocalDateTime end);
}
