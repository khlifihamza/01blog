package com.dev.backend.dto;

import java.util.UUID;

public record ProfilePostResponse(
                UUID id,
                String title,
                String createdAt,
                int readTime,
                int likes,
                int comments,
                String thumbnail) {
}