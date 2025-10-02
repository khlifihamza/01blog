package com.dev.backend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
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
import com.dev.backend.dto.AvatarResponse;
import com.dev.backend.dto.FeedUser;
import com.dev.backend.dto.ProfileEditResponse;
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

    @Value("${file.upload-dir}")
    private String uploadDir;

    @GetMapping("/{username}")
    public ResponseEntity<ProfileUserResponse> getProfileDetails(@PathVariable String username,
            @AuthenticationPrincipal User currentUser) {
        User user = userService.getUserByUsername(username);
        ProfileUserResponse userResponse = new ProfileUserResponse(user.getId(), user.getUsername(),
                user.getAvatar() != null
                        ? "http://localhost:8080/api/post/file/" + user.getAvatar()
                        : null,
                user.getBio(), user.getCreatedAt().toString(), user.getFollowers().size(),
                user.getFollowing().size(), user.getPosts().size(),
                user.getId().equals(currentUser.getId()),
                followService.isCurrentUserFollowUser(currentUser.getId(), user.getId()));
        return ResponseEntity.ok(userResponse);
    }

    @GetMapping("/edit-data")
    public ResponseEntity<ProfileEditResponse> getEditProfileDetails(@AuthenticationPrincipal User currentUser) {
        User user = userService.getUserByUsername(currentUser.getUsername());
        ProfileEditResponse profileEditResponse = new ProfileEditResponse(user.getUsername(), user.getEmail(),
                user.getAvatar() != null
                        ? "http://localhost:8080/api/post/file/" + user.getAvatar()
                        : null,
                user.getBio());
        return ResponseEntity.ok(profileEditResponse);
    }

    @PatchMapping("/save-data")
    public ResponseEntity<ApiResponse> saveProfileData(@Validated @RequestBody ProfileEditResponse data,
            @AuthenticationPrincipal User currentUser) throws IOException {
        userService.saveData(currentUser.getUsername(), data);
        return ResponseEntity.ok(new ApiResponse("Profile data updated successfully"));
    }

    @PostMapping("/upload")
    public ResponseEntity<AvatarResponse> uploadAvatar(@RequestParam("avatar") MultipartFile avatar)
            throws IOException {
        String thumbnailId = "";
        String thumbnailName = avatar.getOriginalFilename();
        String thumbnailExtension = (thumbnailName != null && thumbnailName.contains("."))
                ? thumbnailName.substring(thumbnailName.lastIndexOf("."))
                : "";
        thumbnailId = UUID.randomUUID() + thumbnailExtension;
        Path path = Paths.get(uploadDir + "/images", thumbnailId);
        Files.createDirectories(path.getParent());
        Files.copy(avatar.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

        return ResponseEntity.ok(new AvatarResponse(thumbnailId));
    }

    @GetMapping("/me")
    public ResponseEntity<FeedUser> getFeedUser(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity
                .ok(new FeedUser(currentUser.getUsername(), currentUser.getRole().name(),
                        currentUser.getAvatar() != null
                                ? "http://localhost:8080/api/post/file/" + currentUser.getAvatar()
                                : null));
    }
}
