package com.dev.backend.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.backend.dto.ApiResponse;
import com.dev.backend.dto.CommentRequest;
import com.dev.backend.dto.CommentResponse;
import com.dev.backend.model.Comment;
import com.dev.backend.model.User;
import com.dev.backend.service.CommentService;

@RestController
@RequestMapping("/api/comment")
public class CommentController {
    @Autowired
    private CommentService commentService;

    @PostMapping("/add")
    public ResponseEntity<ApiResponse> like(@Validated @RequestBody CommentRequest commentDto,
            @AuthenticationPrincipal User currentUser) {
        commentService.comment(currentUser, commentDto.postId(), commentDto.content());
        return ResponseEntity.ok(new ApiResponse("comment added successefully"));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable UUID postId,
            @AuthenticationPrincipal User currentUser) {
        List<Comment> comments = commentService.getPostComments(postId);
        List<CommentResponse> commentsResponse = new ArrayList<>();
        for (Comment comment : comments) {
            CommentResponse commentResponse = new CommentResponse(comment.getId(), comment.getUser().getUsername(),
                    "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
                    comment.getCreatedAt().toString(), comment.getContent(), 0);
            commentsResponse.add(commentResponse);
        }
        return ResponseEntity.ok(commentsResponse);
    }
}
