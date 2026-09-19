package com.beyondwords.learningservice.repository;

import com.beyondwords.learningservice.entity.QuizCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizCategoryRepository extends JpaRepository<QuizCategory, Long> {
    java.util.Optional<QuizCategory> findBySlug(String slug);

    @Query("SELECT DISTINCT qc FROM QuizCategory qc LEFT JOIN FETCH qc.levels l LEFT JOIN FETCH l.questions q")
    List<QuizCategory> findAllWithLevelsAndQuestions();
}
