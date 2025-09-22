package com.dev.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.backend.dto.ProfileUserResponse;
import com.dev.backend.model.User;
import com.dev.backend.service.FollowService;
import com.dev.backend.service.UserService;

@RestController
@RequestMapping("/api/profile")
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private FollowService followService;

    @GetMapping("/{username}")
    public ResponseEntity<ProfileUserResponse> getProfileDetails(@PathVariable String username,
            @AuthenticationPrincipal User currentUser) {
        User user = userService.getUserByUsername(username);
        ProfileUserResponse userResponse = new ProfileUserResponse(user.getId(), user.getUsername(),
                user.getAvatar(),
                "no bio yet", user.getCreatedAt().toString(), user.getFollowers().size(),
                user.getFollowing().size(), user.getPosts().size(),
                user.getId().equals(currentUser.getId()),
                followService.isCurrentUserFollowUser(currentUser.getId(), user.getId()));
        return ResponseEntity.ok(userResponse);
    }
}
