package com.beyondwords.analyticsservice.repository;

import com.beyondwords.analyticsservice.document.BadgeDefinition;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BadgeDefinitionRepository extends MongoRepository<BadgeDefinition, String> {
    List<BadgeDefinition> findByStatus(String status);
}
