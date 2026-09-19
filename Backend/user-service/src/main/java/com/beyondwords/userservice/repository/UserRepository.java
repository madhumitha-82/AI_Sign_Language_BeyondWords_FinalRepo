package com.beyondwords.userservice.repository;

import com.beyondwords.userservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByResetToken(String resetToken);
    boolean existsByEmail(String email);
    java.util.List<User> findByCreatedAtAfter(java.time.LocalDateTime date);
    List<User> findAllByEnabledTrueOrderByXpDesc();
}

