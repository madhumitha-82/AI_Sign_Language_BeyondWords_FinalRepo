package com.beyondwords.analyticsservice.repository;

import com.beyondwords.analyticsservice.document.SpeechSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SpeechSessionRepository extends MongoRepository<SpeechSession, String> {
    List<SpeechSession> findAllByUserEmailOrderByTimestampDesc(String userEmail);
    void deleteByUserEmail(String userEmail);
}
