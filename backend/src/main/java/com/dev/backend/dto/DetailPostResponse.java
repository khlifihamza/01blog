package com.dev.backend.dto;

import java.util.UUID;

public record DetailPostResponse(
        UUID id,
        String title,
        String content,
        UserDto author,
        String publishedDate,
        String thumbnail,
        int readTime,
        int likes,
        int comments,
        boolean isLiked,
        boolean isBookmarked,
        boolean isAuthor) {
}
