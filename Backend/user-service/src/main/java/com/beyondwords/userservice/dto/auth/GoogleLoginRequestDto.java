package com.beyondwords.userservice.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleLoginRequestDto {
    @NotBlank
    private String token;
    
    @NotBlank
    private String name;
    
    @Email
    @NotBlank
    private String email;
    
    @NotBlank
    private String googleId;
}
