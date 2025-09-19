package com.dev.backend.dto;

public record LoginRequest(
        String identifier,
        String password) {
}
