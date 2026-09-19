package com.beyondwords.analyticsservice.repository;

import com.beyondwords.analyticsservice.entity.UserActivityLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserActivityLogRepository extends MongoRepository<UserActivityLog, String> {
    List<UserActivityLog> findByUserEmailOrderByTimestampDesc(String userEmail);
    List<UserActivityLog> findByUserEmailAndTimestampBetween(String userEmail, LocalDateTime start, LocalDateTime end);
    List<UserActivityLog> findTop20ByOrderByTimestampDesc();
    List<UserActivityLog> findByTimestampAfter(LocalDateTime timestamp);
    void deleteByUserEmail(String userEmail);
}
