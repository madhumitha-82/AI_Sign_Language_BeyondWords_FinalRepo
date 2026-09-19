package com.beyondwords.analyticsservice.repository;

import com.beyondwords.analyticsservice.document.AiRecommendation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AiRecommendationRepository extends MongoRepository<AiRecommendation, String> {
    List<AiRecommendation> findAllByUserEmailOrderByTimestampDesc(String userEmail);
    void deleteByUserEmail(String userEmail);
}
