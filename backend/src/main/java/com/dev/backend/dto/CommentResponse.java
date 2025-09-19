package com.dev.backend.dto;

public record CommentResponse(
        String username,
        String avatar,
        String createAt,
        String content,
        int likes) {
}
