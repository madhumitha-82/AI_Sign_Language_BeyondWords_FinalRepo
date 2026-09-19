package com.beyondwords.userservice.repository;

import com.beyondwords.userservice.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {
    List<Badge> findByBadgeType(String badgeType);
}
