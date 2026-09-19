package com.beyondwords.userservice.dto.user;

import lombok.Data;

@Data
public class AdminUserUpdateRequestDto {
    private String role;
    private Boolean enabled;
}
