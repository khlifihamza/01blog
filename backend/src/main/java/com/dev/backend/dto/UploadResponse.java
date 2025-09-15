package com.dev.backend.dto;

import java.util.List;

public record UploadResponse(
    String thumbnail,
    List<String> fileNames
) {}
