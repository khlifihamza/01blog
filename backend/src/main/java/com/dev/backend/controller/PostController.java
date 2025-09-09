package com.dev.backend.controller;

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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.backend.dto.PostRequest;
import com.dev.backend.model.Post;
import com.dev.backend.model.User;
import com.dev.backend.service.PostService;

import io.jsonwebtoken.JwtException;

@RestController
@RequestMapping("/api/post")
public class PostController {
    @Autowired
    private PostService postService;

    @GetMapping("/profile")
    public ResponseEntity<?> getAuthUserPosts(@AuthenticationPrincipal User currentUser) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(401).body("User not found");
            }
            List<Post> posts = postService.getPosts(currentUser);
            return ResponseEntity.ok(posts);
        } catch (JwtException e) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Server error: " + e.getMessage());
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createPost(@Validated @RequestBody PostRequest postDto,@AuthenticationPrincipal User currentUser) {
        System.out.println(currentUser.toString());
        try {
            Post createdPost = postService.savePost(postDto, currentUser);
            return ResponseEntity.ok(createdPost);
        } catch (JwtException e) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Server error: " + e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updatePost(@PathVariable UUID id, @Validated @RequestBody PostRequest postDto,@AuthenticationPrincipal User currentUser){
        try {
            Post createdPost = postService.updatePost(id, postDto);
            return ResponseEntity.ok(createdPost);
        } catch (JwtException e) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Server error: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deletePost(@PathVariable UUID id){
        try {
            postService.deletePost(id);
            return ResponseEntity.ok("Post deleted");
        } catch (JwtException e) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Server error: " + e.getMessage());
        }
    }
}
