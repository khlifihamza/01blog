package com.dev.backend.dto;

import java.util.UUID;

public record CommentResponse(
                UUID id,
                String username,
                String avatar,
                String createAt,
                String content,
                int likes) {
}
