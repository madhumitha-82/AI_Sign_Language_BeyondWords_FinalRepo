package com.beyondwords.learningservice.repository;

import com.beyondwords.learningservice.entity.UserLessonNotes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserLessonNotesRepository extends JpaRepository<UserLessonNotes, Long> {
    Optional<UserLessonNotes> findByUserEmailAndLessonId(String userEmail, Long lessonId);
}
