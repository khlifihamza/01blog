package com.dev.backend.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
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
    public ResponseEntity<CommentResponse> addComment(@Validated @RequestBody CommentRequest commentDto,
            @AuthenticationPrincipal User currentUser) {
        Comment comment = commentService.comment(currentUser, commentDto.postId(), commentDto.content());
        CommentResponse commentResponse = new CommentResponse(comment.getId(), comment.getUser().getUsername(),
                comment.getUser().getAvatar() != null
                        ? "http://localhost:8080/api/post/file/" + comment.getUser().getAvatar()
                        : null,
                comment.getCreatedAt().toString(), comment.getContent(),
                currentUser.getId().equals(comment.getUser().getId()));
        return ResponseEntity.ok(commentResponse);
    }

    @DeleteMapping("/delete/{commentId}")
    public ResponseEntity<ApiResponse> deleteComment(@PathVariable UUID commentId,
            @AuthenticationPrincipal User currentUser) {
        commentService.deleteComment(commentId, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse("Comment deleted successful"));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable UUID postId,
            @AuthenticationPrincipal User currentUser) {
        List<Comment> comments = commentService.getPostComments(postId);
        List<CommentResponse> commentsResponse = new ArrayList<>();
        for (Comment comment : comments) {
            CommentResponse commentResponse = new CommentResponse(comment.getId(), comment.getUser().getUsername(),
                    comment.getUser().getAvatar() != null
                            ? "http://localhost:8080/api/post/file/" + comment.getUser().getAvatar()
                            : null,
                    comment.getCreatedAt().toString(), comment.getContent(),
                    currentUser.getId().equals(comment.getUser().getId()));
            commentsResponse.add(commentResponse);
        }
        return ResponseEntity.ok(commentsResponse);
    }
}
