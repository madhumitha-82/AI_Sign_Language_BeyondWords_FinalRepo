package com.beyondwords.learningservice.repository;

import com.beyondwords.learningservice.entity.QuizLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizLevelRepository extends JpaRepository<QuizLevel, Long> {
}
