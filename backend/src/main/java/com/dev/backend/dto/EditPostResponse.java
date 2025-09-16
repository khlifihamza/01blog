package com.dev.backend.dto;

import java.util.UUID;

public record EditPostResponse(
                UUID id,
                String title,
                String content,
                String thumbnail,
                String[] fileNames) {
}