package com.dev.backend.controller;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.dev.backend.dto.ApiResponse;
import com.dev.backend.dto.CreatePostRequest;
import com.dev.backend.dto.DetailPostResponse;
import com.dev.backend.dto.EditPostResponse;
import com.dev.backend.dto.FeedPostResponse;
import com.dev.backend.dto.ProfilePostResponse;
import com.dev.backend.dto.UpdatePostRequest;
import com.dev.backend.exception.SafeHtmlException;
import com.dev.backend.model.User;
import com.dev.backend.service.PostService;

@RestController
@RequestMapping("/api/post")
public class PostController {
    private final PostService postService;

    @Autowired
    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping("/feed")
    public ResponseEntity<List<FeedPostResponse>> getFeedPosts(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime lastCreatedAt) {
        List<FeedPostResponse> posts = postService.getFeedPosts(currentUser.getId(), lastCreatedAt);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<List<ProfilePostResponse>> getUserPosts(@PathVariable String username,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime lastCreatedAt) {
        List<ProfilePostResponse> posts = postService.getProfilePosts(username, lastCreatedAt);
        return ResponseEntity.ok(posts);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createPost(@RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(name = "files", required = false) List<MultipartFile> files,
            @RequestParam("thumbnail") MultipartFile thumbnail,
            @AuthenticationPrincipal User currentUser) throws SafeHtmlException, IOException {
        CreatePostRequest createPostRequest = new CreatePostRequest(title, content, files, thumbnail);
        postService.savePost(currentUser.getId(), createPostRequest);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetailPostResponse> getPost(@PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        DetailPostResponse post = postService.getPost(id, currentUser.getId());
        return ResponseEntity.ok(post);
    }

    @GetMapping("/file/{mediaName}")
    public ResponseEntity<?> getFile(@PathVariable String mediaName,
            @AuthenticationPrincipal User currentUser) throws IOException {
        return postService.getFile(mediaName);
    }

    @GetMapping("/edit/{id}")
    public ResponseEntity<EditPostResponse> getPostToEdit(@PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        EditPostResponse post = postService.getPostToEdit(id, currentUser.getId());
        return ResponseEntity.ok(post);
    }

    @PatchMapping("/update/{id}")
    public ResponseEntity<ApiResponse> updatePost(
            @PathVariable UUID id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @RequestParam(value = "oldThumbnail", required = false) String oldThumbnail,
            @RequestParam(value = "oldFileNames", required = false) List<String> oldFileNames,
            @AuthenticationPrincipal User currentUser) throws SafeHtmlException, IOException {
        UpdatePostRequest updatePostRequest = new UpdatePostRequest(title, content, files, thumbnail, oldThumbnail,
                oldFileNames);
        postService.updatePost(id,
                currentUser.getId(), updatePostRequest);
        return ResponseEntity.ok(new ApiResponse("Blog updated successfully"));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse> deletePost(@PathVariable UUID id, @AuthenticationPrincipal User currentUser)
            throws IOException {
        postService.deletePost(id, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse("Blog deleted successful"));
    }
}
