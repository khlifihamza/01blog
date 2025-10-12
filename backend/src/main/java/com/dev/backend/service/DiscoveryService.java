package com.dev.backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.dev.backend.dto.DiscoveryPostResponse;
import com.dev.backend.dto.DiscoveryResponse;
import com.dev.backend.dto.DiscoveryUserResponse;

@Service
public class DiscoveryService {
    private final UserService userService;

    private final PostService postService;

    public DiscoveryService(UserService userService, PostService postService) {
        this.postService = postService;
        this.userService = userService;
    }

    public DiscoveryResponse getDiscoveryData(UUID currentUserId) {
        List<DiscoveryUserResponse> users = userService.getTop9Profiles(currentUserId);
        List<DiscoveryPostResponse> posts = postService.getTop9Posts(currentUserId);
        DiscoveryResponse discoveryResponse = new DiscoveryResponse(users, posts);
        return discoveryResponse;
    }

    public DiscoveryResponse getSearchedData(UUID currentUserId, String query, Pageable pageable) {
        List<DiscoveryUserResponse> users = userService.getSearchedDiscoveryUsers(currentUserId, query,
                pageable);
        List<DiscoveryPostResponse> posts = postService.getSearchedDiscoveryPosts(query, pageable);
        DiscoveryResponse discoveryResponse = new DiscoveryResponse(users, posts);
        return discoveryResponse;
    }
}
