package com.beyondwords.userservice.controller;

import com.beyondwords.userservice.entity.Badge;
import com.beyondwords.userservice.repository.BadgeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/badges")
public class AdminBadgeController {

    @Autowired
    private BadgeRepository badgeRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Badge>> getAllBadges() {
        return ResponseEntity.ok(badgeRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Badge> createBadge(@RequestBody Badge badge) {
        return ResponseEntity.ok(badgeRepository.save(badge));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBadge(@PathVariable Long id) {
        badgeRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
