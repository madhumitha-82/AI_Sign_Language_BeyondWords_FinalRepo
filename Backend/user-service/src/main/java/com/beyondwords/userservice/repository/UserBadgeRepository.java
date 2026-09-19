package com.beyondwords.userservice.repository;

import com.beyondwords.userservice.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    List<UserBadge> findByUserId(Long userId);
    boolean existsByUserIdAndBadgeId(Long userId, Long badgeId);
    java.util.Optional<UserBadge> findByBadgeIdAndWeekStart(Long badgeId, java.time.LocalDate weekStart);
    void deleteByBadgeIdAndWeekStart(Long badgeId, java.time.LocalDate weekStart);
}
