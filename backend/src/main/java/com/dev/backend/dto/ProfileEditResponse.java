package com.dev.backend.dto;

public record ProfileEditResponse(
        String username,
        String email,
        String avatar,
        String bio) {
}