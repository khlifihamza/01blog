package com.dev.backend.controller;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.dev.backend.dto.ApiResponse;
import com.dev.backend.dto.DetailPostResponse;
import com.dev.backend.dto.EditPostResponse;
import com.dev.backend.dto.FeedPostResponse;
import com.dev.backend.dto.PostRequest;
import com.dev.backend.dto.ProfilePostResponse;
import com.dev.backend.dto.UploadResponse;
import com.dev.backend.exception.SafeHtmlException;
import com.dev.backend.model.User;
import com.dev.backend.service.PostService;

@RestController
@RequestMapping("/api/post")
public class PostController {
    @Autowired
    private PostService postService;

    @GetMapping("/feed")
    public ResponseEntity<List<FeedPostResponse>> getFeedPosts(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<FeedPostResponse> posts = postService.getFeedPosts(currentUser.getId(), PageRequest.of(page, size));
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<List<ProfilePostResponse>> getUserPosts(@PathVariable String username,
            @AuthenticationPrincipal User currentUser, @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<ProfilePostResponse> posts = postService.getProfilePosts(username, currentUser.getId(),
                PageRequest.of(page, size));
        return ResponseEntity.ok(posts);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createPost(@Validated @RequestBody PostRequest postDto,
            @AuthenticationPrincipal User currentUser) throws SafeHtmlException {
        postService.savePost(postDto, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/upload")
    public ResponseEntity<UploadResponse> upload(
            @RequestParam(name = "files", required = false) List<MultipartFile> files,
            @RequestParam("thumbnail") MultipartFile thumbnail) throws IOException {
        UploadResponse response = postService.upload(thumbnail, files);
        return ResponseEntity.ok(response);
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
    public ResponseEntity<ApiResponse> updatePost(@PathVariable UUID id, @Validated @RequestBody PostRequest postDto,
            @AuthenticationPrincipal User currentUser) throws SafeHtmlException {
        postService.updatePost(id, postDto, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse("Blog updated successful"));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse> deletePost(@PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        postService.deletePost(id, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse("Blog deleted successful"));
    }
}
