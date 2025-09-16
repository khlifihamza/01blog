package com.dev.backend.dto;


import jakarta.validation.constraints.NotBlank;

public record PostRequest(
    @NotBlank(message = "Title cannot be blank")
    String title,
    @NotBlank(message = "Content cannot be blank")
    String content,
    @NotBlank(message = "thumbnail cannot be blank")
    String thumbnail,
    String[] files
) {}
