package com.beyondwords.analyticsservice.repository;

import com.beyondwords.analyticsservice.entity.LeaderboardEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LeaderboardEntryRepository extends JpaRepository<LeaderboardEntry, Long> {
    List<LeaderboardEntry> findByTimeframeOrderByRankValueAsc(String timeframe);
    void deleteByTimeframe(String timeframe);
    void deleteByUserEmail(String userEmail);
}
