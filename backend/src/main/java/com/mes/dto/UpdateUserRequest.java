package com.mes.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateUserRequest {
    @Email(message = "Email must be valid")
    private String email;
    
    private String fullName;
    private String role;
    private Boolean enabled;
}
