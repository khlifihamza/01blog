package com.dev.backend.controller;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.backend.dto.ApiResponse;
import com.dev.backend.model.User;
import com.dev.backend.service.LikeService;

@RestController
@RequestMapping("/api")
public class LikeController {
    private LikeService likeService;

    @Autowired
    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    }

    @GetMapping("/like/{postId}")
    public ResponseEntity<ApiResponse> like(@PathVariable UUID postId, @AuthenticationPrincipal User currentUser) {
        likeService.like(currentUser, postId);
        return ResponseEntity.ok(new ApiResponse("Liked successfully"));
    }

    @GetMapping("/dislike/{postId}")
    public ResponseEntity<ApiResponse> dislike(@PathVariable UUID postId, @AuthenticationPrincipal User currentUser) {
        likeService.dislike(currentUser, postId);
        return ResponseEntity.ok(new ApiResponse("Disliked successfully"));
    }
}
