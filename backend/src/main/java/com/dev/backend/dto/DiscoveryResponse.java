package com.dev.backend.dto;

import java.util.List;

public record DiscoveryResponse(
        List<DiscoveryUserResponse> discoveryUsers,
        List<DiscoveryPostResponse> discoveryPosts) {
}