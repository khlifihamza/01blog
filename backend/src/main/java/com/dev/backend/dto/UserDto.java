package com.dev.backend.dto;

public record UserDto(
        String username,
        String avatar,
        String bio,
        int followers,
        int following,
        boolean isFollowed) {
}
