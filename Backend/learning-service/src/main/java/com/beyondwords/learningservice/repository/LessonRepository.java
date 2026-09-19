package com.beyondwords.learningservice.repository;

import com.beyondwords.learningservice.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByModuleIdOrderByLessonOrderAsc(Long moduleId);
}
