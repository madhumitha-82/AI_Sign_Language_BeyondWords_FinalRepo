package com.beyondwords.analyticsservice.mapper;

import com.beyondwords.analyticsservice.dto.LeaderboardEntryDto;
import com.beyondwords.analyticsservice.entity.LeaderboardEntry;
import org.springframework.stereotype.Component;

@Component
public class ProgressMapper {

    public LeaderboardEntryDto toLeaderboardDto(LeaderboardEntry entry) {
        if (entry == null) return null;
        return LeaderboardEntryDto.builder()
                .rank(entry.getRankValue())
                .name(entry.getName())
                .username(entry.getUsername())
                .level(entry.getLevel())
                .xp(entry.getXp())
                .accuracy(entry.getAccuracy())
                .streak(entry.getStreak())
                .build();
    }
}
