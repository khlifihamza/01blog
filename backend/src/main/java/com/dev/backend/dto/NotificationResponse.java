package com.dev.backend.dto;

import java.util.UUID;

public record NotificationResponse(
        UUID id,
        String type,
        String title,
        String message,
        String createdAt,
        boolean isRead,
        String link) {
}