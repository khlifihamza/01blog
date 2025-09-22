package com.dev.backend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
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

import com.dev.backend.dto.PostRequest;
import com.dev.backend.dto.ProfilePostResponse;
import com.dev.backend.dto.ApiResponse;
import com.dev.backend.dto.Author;
import com.dev.backend.dto.DetailPostResponse;
import com.dev.backend.dto.EditPostResponse;
import com.dev.backend.dto.FeedPostResponse;
import com.dev.backend.dto.UploadResponse;
import com.dev.backend.dto.UserDto;
import com.dev.backend.model.Post;
import com.dev.backend.model.User;
import com.dev.backend.service.FollowService;
import com.dev.backend.service.LikeService;
import com.dev.backend.service.PostService;
import com.dev.backend.service.UserService;

@RestController
@RequestMapping("/api/post")
public class PostController {
    @Autowired
    private PostService postService;

    @Autowired
    private UserService userService;

    @Autowired
    private FollowService followService;

    @Autowired
    private LikeService likeService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @GetMapping("/feed")
    public ResponseEntity<List<FeedPostResponse>> getFeedPosts(@AuthenticationPrincipal User currentUser) {
        List<Post> posts = postService.getFeedPosts(currentUser.getId());
        List<FeedPostResponse> feedPostsResponses = new ArrayList<>();
        for (Post post : posts) {
            Author author = new Author(post.getUser().getUsername(),
                    post.getUser().getAvatar());
            FeedPostResponse feedPost = new FeedPostResponse(post.getId(), post.getTitle(), post.getContent(), author,
                    post.getCreatedAt().toString(), 0, post.getLikes().size(), post.getComments().size(),
                    post.getThumbnail());
            feedPostsResponses.add(feedPost);
        }
        return ResponseEntity.ok(feedPostsResponses);
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<List<ProfilePostResponse>> getUserPosts(@PathVariable String username,
            @AuthenticationPrincipal User currentUser) {
        User user = userService.getUserByUsername(username);
        List<Post> posts = postService.getPosts(user.getId());
        List<ProfilePostResponse> postsResponse = new ArrayList<>();
        for (Post post : posts) {
            ProfilePostResponse postResponse = new ProfilePostResponse(post.getId(), post.getTitle(),
                    post.getCreatedAt().toString(), 0, 0, 0, post.getThumbnail());
            postsResponse.add(postResponse);
        }
        return ResponseEntity.ok(postsResponse);
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse> createPost(@Validated @RequestBody PostRequest postDto,
            @AuthenticationPrincipal User currentUser) {
        postService.savePost(postDto, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse("Post created successefully"));
    }

    @PostMapping("/upload")
    public ResponseEntity<UploadResponse> upload(
            @RequestParam(name = "files", required = false) List<MultipartFile> files,
            @RequestParam("thumbnail") MultipartFile thumbnail,
            @AuthenticationPrincipal User currentUser) throws IOException {
        String thumbnailId = "";
        String thumbnailName = thumbnail.getOriginalFilename();
        String thumbnailExtension = (thumbnailName != null && thumbnailName.contains("."))
                ? thumbnailName.substring(thumbnailName.lastIndexOf("."))
                : "";
        thumbnailId = UUID.randomUUID() + thumbnailExtension;

        Path path = Paths.get(uploadDir + "/images", thumbnailId);

        Files.createDirectories(path.getParent());
        Files.copy(thumbnail.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
        List<String> fileNames = new ArrayList<>();
        if (files != null && !files.isEmpty()) {
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

                path = Paths.get(uploadDir + subDir, id);

                Files.createDirectories(path.getParent());
                Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

                fileNames.add(id);
            }
        }
        UploadResponse response = new UploadResponse(thumbnailId, fileNames);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetailPostResponse> getPost(@PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        Post post = postService.getPost(id);
        User user = post.getUser();
        UserDto author = new UserDto(post.getUser().getUsername(),
                post.getUser().getAvatar(),
                "no bio yet", user.getFollowers().size(), user.getFollowing().size(),
                followService.isCurrentUserFollowUser(currentUser.getId(), user.getId()));
        boolean isAuthor = currentUser.getId().equals(post.getUser().getId());
        DetailPostResponse postResponse = new DetailPostResponse(post.getId(), post.getTitle(), post.getContent(),
                author, post.getCreatedAt().toString(), post.getThumbnail(), 0, post.getLikes().size(),
                post.getComments().size(),
                likeService.isUserLikedPost(currentUser, post.getId()), false, isAuthor);
        return ResponseEntity.ok(postResponse);
    }

    @GetMapping("/file/{mediaName}")
    public ResponseEntity<?> getFile(@PathVariable String mediaName,
            @AuthenticationPrincipal User currentUser) throws IOException {
        Path path = (Files.exists(Paths.get(uploadDir + "/images").resolve(mediaName).normalize()))
                ? Paths.get(uploadDir + "/images").resolve(mediaName).normalize()
                : Paths.get(uploadDir + "/videos").resolve(mediaName).normalize();

        if (path == null || !Files.exists(path)) {
            return ResponseEntity.notFound().build();
        }

        String mimeType = Files.probeContentType(path);
        if (mimeType == null) {
            mimeType = "application/octet-stream";
        }

        byte[] fileBytes = Files.readAllBytes(path);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mimeType))
                .body(fileBytes);
    }

    @GetMapping("/edit/{id}")
    public ResponseEntity<EditPostResponse> getPostToEdit(@PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        Post post = postService.getPost(id);
        EditPostResponse editpost = new EditPostResponse(post.getId(), post.getTitle(), post.getContent(),
                post.getThumbnail(), post.getFiles().split(", "));
        return ResponseEntity.ok(editpost);
    }

    @PatchMapping("/update/{id}")
    public ResponseEntity<ApiResponse> updatePost(@PathVariable UUID id, @Validated @RequestBody PostRequest postDto,
            @AuthenticationPrincipal User currentUser) {
        postService.updatePost(id, postDto, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse("Blog updated successful"));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse> deletePost(@PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        postService.deletePost(id, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse("Blog deleted successful"));
    }
}
