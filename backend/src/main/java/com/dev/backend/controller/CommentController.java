package com.dev.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dev.backend.dto.ApiResponse;
import com.dev.backend.dto.CommentRequest;
import com.dev.backend.dto.CommentResponse;
import com.dev.backend.model.User;
import com.dev.backend.service.CommentService;

@RestController
@RequestMapping("/api/comment")
public class CommentController {
        private final CommentService commentService;

        public CommentController(CommentService commentService) {
                this.commentService = commentService;
        }

        @PostMapping("/add")
        public ResponseEntity<CommentResponse> addComment(@Validated @RequestBody CommentRequest commentDto,
                        @AuthenticationPrincipal User currentUser) {
                CommentResponse comment = commentService.comment(currentUser, commentDto.postId(),
                                commentDto.content());
                return ResponseEntity.ok(comment);
        }

        @DeleteMapping("/delete/{commentId}")
        public ResponseEntity<ApiResponse> deleteComment(@PathVariable UUID commentId,
                        @AuthenticationPrincipal User currentUser) {
                commentService.deleteComment(commentId, currentUser.getId());
                return ResponseEntity.ok(new ApiResponse("Comment deleted successful"));
        }

        @GetMapping("/{postId}")
        public ResponseEntity<List<CommentResponse>> getComments(@PathVariable UUID postId,
                        @AuthenticationPrincipal User currentUser,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {
                List<CommentResponse> comments = commentService.getPostComments(postId, currentUser.getId(),
                                PageRequest.of(page, size));
                return ResponseEntity.ok(comments);
        }

        @PostMapping("/update/{commentId}")
        public ResponseEntity<CommentResponse> updateComment(@PathVariable UUID commentId,
                        @Validated @RequestBody CommentRequest commentDto,
                        @AuthenticationPrincipal User currentUser) {
                CommentResponse comment = commentService.updateComment(commentId, commentDto.content(),
                                currentUser.getId());
                return ResponseEntity.ok(comment);
        }
}
