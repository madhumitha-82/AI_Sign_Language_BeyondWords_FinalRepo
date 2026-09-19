package com.beyondwords.analyticsservice.repository;

import com.beyondwords.analyticsservice.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
    List<UserProgress> findByUserEmail(String userEmail);
    Optional<UserProgress> findByUserEmailAndLessonId(String userEmail, Long lessonId);
    long countByUserEmail(String userEmail);
    void deleteByUserEmail(String userEmail);
}
