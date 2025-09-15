package com.dev.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record PostResponse(
    UUID id,
    String title,
    String excerpt,
    String content,
    UserDto author,
    LocalDateTime createdAt,
    String thumbnail
) {}
