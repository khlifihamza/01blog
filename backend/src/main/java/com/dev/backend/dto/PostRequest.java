package com.dev.backend.dto;


import jakarta.validation.constraints.NotBlank;

public record PostRequest(
    @NotBlank(message = "Title cannot be blank")
    String title,
    @NotBlank(message = "Content cannot be blank")
    String content,
    String mediaFiles
) {}
