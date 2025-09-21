package com.dev.backend.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;

public record ReportRequest(
        @NotBlank(message = "reason cannot be blank") String reason,
        String details,
        String reportedUsername,
        UUID reportedPost) {
}