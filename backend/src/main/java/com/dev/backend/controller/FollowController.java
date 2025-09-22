package com.dev.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.backend.dto.ApiResponse;
import com.dev.backend.model.User;
import com.dev.backend.service.FollowService;
import com.dev.backend.service.UserService;

@RestController
@RequestMapping("/api")
public class FollowController {
    @Autowired
    private FollowService followService;
    @Autowired
    private UserService userService;

    @GetMapping("/follow/{username}")
    public ResponseEntity<ApiResponse> followUser(@PathVariable String username, @AuthenticationPrincipal User currentUser) {
        User userToFollow = userService.getUserByUsername(username);
        followService.followUser(currentUser.getId(), userToFollow.getId());
        return ResponseEntity.ok(new ApiResponse("Follewed successfully"));
    }

    @GetMapping("/unfollow/{username}")
    public ResponseEntity<ApiResponse> unfollowUser(@PathVariable String username, @AuthenticationPrincipal User currentUser) {
        User userToFollow = userService.getUserByUsername(username);
        followService.unfollowUser(currentUser.getId(), userToFollow.getId());
        return ResponseEntity.ok(new ApiResponse("Unfollewed successfully"));
    }
}
