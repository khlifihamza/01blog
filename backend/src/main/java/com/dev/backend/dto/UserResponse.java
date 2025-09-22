package com.dev.backend.dto;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String username,
        String email,
        String avatar,
        String role,
        String joinDate,
        int postsCount,
        String status) {
}