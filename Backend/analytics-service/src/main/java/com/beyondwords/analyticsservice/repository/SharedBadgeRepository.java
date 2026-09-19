package com.beyondwords.analyticsservice.repository;

import com.beyondwords.analyticsservice.document.SharedBadge;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SharedBadgeRepository extends MongoRepository<SharedBadge, String> {
}
