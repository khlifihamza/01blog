package com.dev.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
                @NotBlank(message = "Email cannot be blank") @Email(message = "Please provide a valid email address.") String email,
                @NotBlank(message = "Username cannot be blank") @Size(min = 3, max = 15, message = "Username must be between 3 and 15 characters.") @Pattern(regexp = "^[a-zA-Z0-9\\-]+$", message = "Invalid username format") String username,
                @NotBlank(message = "Password cannot be blank") @Size(min = 8, max = 24, message = "Password must be between 8 and 24 characters.") String password,
                @NotBlank(message = "Confirm Password is required") String confirmPassword) {
}
