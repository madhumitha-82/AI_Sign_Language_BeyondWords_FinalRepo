package com.beyondwords.userservice.dto.admin;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminStatsDto {
    private Long totalUsers;
    private Long activeUsers;
    private Long suspendedUsers;
    private Long totalLessons;
    private Long draftCoursesCount;
    private Long publishedCoursesCount;
}
