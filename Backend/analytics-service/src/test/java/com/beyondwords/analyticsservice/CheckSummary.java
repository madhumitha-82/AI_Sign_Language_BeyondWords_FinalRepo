package com.beyondwords.analyticsservice;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import com.beyondwords.analyticsservice.service.ProgressService;
import com.beyondwords.analyticsservice.dto.ProgressSummaryDto;
import com.beyondwords.analyticsservice.repository.UserActivityLogRepository;

@SpringBootTest
public class CheckSummary {

    @Autowired
    private ProgressService progressService;

    @Autowired
    private UserActivityLogRepository repo;

    @Test
    public void testSummary() {
        String email = "madhumithagopal82@gmail.com"; 
        System.out.println("====== TOTAL LOGS: " + repo.findByUserEmailOrderByTimestampDesc(email).size() + " ======");
        ProgressSummaryDto dto = progressService.getSummary(email);
        System.out.println("====== WEEKLY STUDY TIME: " + dto.getWeeklyStudyTime() + " ======");
        System.out.println("====== WEEKLY PROGRESS DAYS: " + dto.getWeeklyProgressDays() + " ======");
    }
}
