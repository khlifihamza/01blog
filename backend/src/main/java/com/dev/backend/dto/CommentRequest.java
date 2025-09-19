package com.dev.backend.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;

public record CommentRequest(
        UUID postId,
        @NotBlank(message = "Content cannot be blank") String content) {
}