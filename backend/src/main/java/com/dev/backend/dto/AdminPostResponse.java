package com.dev.backend.dto;

import java.util.UUID;

public record AdminPostResponse(
        UUID id,
        String title,
        String author,
        String publishedDate,
        int likes,
        int comments,
        String status) {
}