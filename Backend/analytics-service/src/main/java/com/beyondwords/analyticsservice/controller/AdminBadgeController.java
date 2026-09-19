package com.beyondwords.analyticsservice.controller;

import com.beyondwords.analyticsservice.document.BadgeDefinition;
import com.beyondwords.analyticsservice.repository.BadgeDefinitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/badges")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminBadgeController {

    private final BadgeDefinitionRepository badgeRepository;

    @GetMapping
    public List<BadgeDefinition> getAllBadges() {
        return badgeRepository.findAll();
    }

    @PostMapping
    public BadgeDefinition createBadge(@RequestBody BadgeDefinition badge) {
        return badgeRepository.save(badge);
    }

    @PutMapping("/{id}")
    public BadgeDefinition updateBadge(@PathVariable String id, @RequestBody BadgeDefinition updated) {
        BadgeDefinition existing = badgeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Badge not found"));
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setIcon(updated.getIcon());
        existing.setTier(updated.getTier());
        existing.setCriteria(updated.getCriteria());
        existing.setXpReward(updated.getXpReward());
        existing.setStatus(updated.getStatus());
        return badgeRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public void deleteBadge(@PathVariable String id) {
        badgeRepository.deleteById(id);
    }
}
