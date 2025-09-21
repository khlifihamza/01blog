package com.dev.backend.dto;

import java.util.UUID;

import com.dev.backend.model.ReportStatus;

public record ReportResponse(
        UUID id,
        UUID postId,
        String postTitle,
        String ReportedUser,
        String reportedBy,
        String reason,
        String details,
        ReportStatus status,
        String createdAt) {
}