package com.beyondwords.learningservice.repository;

import com.beyondwords.learningservice.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findAllByUserEmail(String userEmail);
    long countByUserEmail(String userEmail);
    
    long countByCreatedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);

    @org.springframework.data.jpa.repository.Query("SELECT new com.beyondwords.learningservice.dto.TopQuizDto(l.category.name, COUNT(a)) " +
            "FROM QuizAttempt a JOIN QuizLevel l ON a.levelId = l.id " +
            "WHERE a.createdAt >= :startDate AND a.createdAt <= :endDate " +
            "GROUP BY l.category.name " +
            "ORDER BY COUNT(a) DESC")
    List<com.beyondwords.learningservice.dto.TopQuizDto> findTopQuizzesThisWeek(
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate,
            org.springframework.data.domain.Pageable pageable);

    /** Returns true if this user has already passed (accuracy >= threshold) this quiz level before */
    boolean existsByUserEmailAndLevelIdAndAccuracyGreaterThanEqual(String userEmail, Long levelId, Integer accuracyThreshold);
}
