package com.dev.backend.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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
    @Value("${file.upload-dir}")
    private String uploadDir;

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
    public ResponseEntity<?> createPost(@Validated @RequestBody PostRequest postDto,
            @AuthenticationPrincipal User currentUser) {
        try {
            Post createdPost = postService.savePost(postDto, currentUser);
            return ResponseEntity.ok(createdPost);
        } catch (JwtException e) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Server error: " + e.getMessage());
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("files") List<MultipartFile> files,
            @AuthenticationPrincipal User currentUser) {
        if (files == null || files.isEmpty()) {
            return ResponseEntity.badRequest().body("there is no files to upload");
        }
        try {
            List<String> fileNames = new ArrayList<>();
            for (MultipartFile file : files) {
                String fileName = file.getOriginalFilename();
                String extension = (fileName != null && fileName.contains("."))
                        ? fileName.substring(fileName.lastIndexOf("."))
                        : "";
                String id = UUID.randomUUID() + extension;

                String contentType = file.getContentType();
                String subDir = "";
                if (contentType != null) {
                    subDir = (contentType.startsWith("image")) ? "/images" : "/videos";
                }

                Path path = Paths.get(uploadDir + subDir, id);

                Files.createDirectories(path.getParent());
                Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

                fileNames.add(id);
            }
            return ResponseEntity.ok(fileNames);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("error uploading files");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPost(@PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        try {
            Post post = postService.getPost(id);
            return ResponseEntity.ok(post);
        } catch (JwtException e) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Server error: " + e.getMessage());
        }
    }

    @GetMapping("/file/{mediaName}")
    public ResponseEntity<?> getFile(@PathVariable String mediaName,
            @AuthenticationPrincipal User currentUser) {
        try {
            Path path = (Files.exists(Paths.get(uploadDir + "/images").resolve(mediaName).normalize()))
                    ? Paths.get(uploadDir + "/images").resolve(mediaName).normalize()
                    : Paths.get(uploadDir + "/videos").resolve(mediaName).normalize();

            if (path == null || !Files.exists(path)) {
                return ResponseEntity.notFound().build();
            }

            UrlResource resource = new UrlResource(path.toUri());

            String contentType = Files.probeContentType(path);
            
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);

        } catch (JwtException e) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Server error: " + e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updatePost(@PathVariable UUID id, @Validated @RequestBody PostRequest postDto,
            @AuthenticationPrincipal User currentUser) {
        try {
            Post updatedPost = postService.updatePost(id, postDto);
            return ResponseEntity.ok(updatedPost);
        } catch (JwtException e) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Server error: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deletePost(@PathVariable UUID id) {
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
