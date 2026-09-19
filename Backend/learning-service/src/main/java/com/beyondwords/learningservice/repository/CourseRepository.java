package com.beyondwords.learningservice.repository;

import com.beyondwords.learningservice.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByStatus(String status);
    long countByStatus(String status);

    @Query("SELECT c FROM Course c LEFT JOIN FETCH c.modules m LEFT JOIN FETCH m.lessons l WHERE c.status = 'published'")
    List<Course> findAllPublishedCoursesWithModulesAndLessons();
}
