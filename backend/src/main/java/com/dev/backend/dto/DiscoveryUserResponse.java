package com.dev.backend.dto;

import java.util.UUID;

public record DiscoveryUserResponse(
        UUID id,
        String username,
        String avatar,
        String bio,
        int followers,
        int posts,
        boolean isFollowing) {
}