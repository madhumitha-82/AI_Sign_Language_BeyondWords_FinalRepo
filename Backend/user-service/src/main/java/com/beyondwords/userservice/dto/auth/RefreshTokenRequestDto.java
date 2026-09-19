package com.beyondwords.userservice.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshTokenRequestDto {
    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
}
