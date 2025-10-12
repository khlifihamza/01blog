package com.dev.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.backend.dto.ApiResponse;
import com.dev.backend.model.User;
import com.dev.backend.service.FollowService;

@RestController
@RequestMapping("/api")
public class FollowController {
    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    @GetMapping("/follow/{username}")
    public ResponseEntity<ApiResponse> followUser(@PathVariable String username,
            @AuthenticationPrincipal User currentUser) {
        followService.followUser(currentUser.getId(), username);
        return ResponseEntity.ok(new ApiResponse("Follewed successfully"));
    }

    @GetMapping("/unfollow/{username}")
    public ResponseEntity<ApiResponse> unfollowUser(@PathVariable String username,
            @AuthenticationPrincipal User currentUser) {
        followService.unfollowUser(currentUser.getId(), username);
        return ResponseEntity.ok(new ApiResponse("Unfollewed successfully"));
    }
}
