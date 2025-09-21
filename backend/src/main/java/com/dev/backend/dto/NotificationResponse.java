package com.dev.backend.dto;

import java.util.UUID;

import com.dev.backend.model.NotificationType;

public record NotificationResponse(
                UUID id,
                NotificationType type,
                String title,
                String message,
                String createdAt,
                boolean isRead,
                String link) {
}