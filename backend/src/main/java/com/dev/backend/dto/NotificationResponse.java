package com.dev.backend.dto;

import java.util.UUID;

public record NotificationResponse(
        UUID id,
        String title,
        String message,
        String avatar,
        String createdAt,
        boolean isRead,
        String link) {
}