package com.dev.backend.dto;

import java.util.UUID;

public record ProfilePostResponse(
                UUID id,
                String title,
                String content,
                String createdAt,
                int likes,
                int comments,
                String thumbnail) {
}