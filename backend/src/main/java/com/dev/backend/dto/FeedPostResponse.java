package com.dev.backend.dto;

import java.util.UUID;

public record FeedPostResponse(
        UUID id,
        String title,
        String content,
        Author author,
        String createdAt,
        int readTime,
        int likes,
        int comments,
        String thumbnail) {
}