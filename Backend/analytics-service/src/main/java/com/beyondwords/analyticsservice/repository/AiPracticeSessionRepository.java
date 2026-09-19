package com.beyondwords.analyticsservice.repository;

import com.beyondwords.analyticsservice.document.AiPracticeSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AiPracticeSessionRepository extends MongoRepository<AiPracticeSession, String> {
    List<AiPracticeSession> findAllByUserEmailOrderByTimestampDesc(String userEmail);
    void deleteByUserEmail(String userEmail);
}
