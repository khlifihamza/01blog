package com.dev.backend.dto;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "Email cannot be blank") @Email(message = "Please provide a valid email address.") String email,
        @NotBlank(message = "Username cannot be blank") @Size(min = 3, max = 15, message = "Username must be between 3 and 15 characters.") @Pattern(regexp = "^[a-zA-Z0-9\\-]+$", message = "Invalid username format") String username,
        @Size(max = 500, message = "Bio nedd to be less than 500 characters") String bio,
        MultipartFile avatar,
        String defaultAvatar) {
}