package com.beyondwords.learningservice.repository;

import com.beyondwords.learningservice.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
    List<QuizQuestion> findAllByLevelId(Long levelId);
}
