package com.beyondwords.userservice.dto.auth;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDto {
    private String accessToken;
    private String refreshToken;
    private String role;
}
