package com.dev.backend.dto;

public record InsightsResponse(
        long totalUsers,
        long totalPosts,
        long pendingReports,
        long totalEngagement) {
}