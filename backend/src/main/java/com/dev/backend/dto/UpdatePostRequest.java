package com.dev.backend.dto;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.Size;

public record UpdatePostRequest(
        @Size(min = 5, max = 200, message = "Title must be between 3 and 15 characters.") String title,
        @Size(min = 100, max = 50000, message = "Content must be between 100 and 50000 characters.") String content,
        List<MultipartFile> files,
        MultipartFile thumbnail,
        String oldThumbnail,
        List<String> oldFileNames) {
}