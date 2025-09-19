package com.dev.backend.dto;

public record LoginResponse(
        String token,
        String role) {
}