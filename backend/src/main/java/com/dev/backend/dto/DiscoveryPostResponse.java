package com.dev.backend.dto;

import java.util.UUID;

public record DiscoveryPostResponse(
                UUID id,
                String title,
                String content,
                Author author,
                String publishedDate,
                int likes,
                int comments,
                String thumbnail) {
}