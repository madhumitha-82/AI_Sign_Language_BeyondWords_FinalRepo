package com.beyondwords.userservice.dto.user;

import lombok.Data;

@Data
public class UserProfileResponseDto {
    private Long id;
    private String fullName;
    private String email;
    private String role;
    private int xp;
    private int streak;
}
