package com.beyondwords.learningservice.repository;

import com.beyondwords.learningservice.entity.UserBookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserBookmarkRepository extends JpaRepository<UserBookmark, Long> {
    List<UserBookmark> findAllByUserEmail(String userEmail);
    Optional<UserBookmark> findByUserEmailAndLessonId(String userEmail, Long lessonId);
    void deleteByUserEmailAndLessonId(String userEmail, Long lessonId);
}
