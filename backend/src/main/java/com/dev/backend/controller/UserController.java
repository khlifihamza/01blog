package com.dev.backend.controller;

import java.io.IOException;
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
import com.dev.backend.service.UserService;

@RestController
@RequestMapping("/api/profile")
public class UserController {
        @Autowired
        private UserService userService;

        @Value("${file.upload-dir}")
        private String uploadDir;

        @GetMapping("/{username}")
        public ResponseEntity<ProfileUserResponse> getProfileDetails(@PathVariable String username,
                        @AuthenticationPrincipal User currentUser) {
                ProfileUserResponse user = userService.getUserResponseByUsername(username, currentUser.getId());
                return ResponseEntity.ok(user);
        }

        @GetMapping("/edit-data")
        public ResponseEntity<ProfileEditResponse> getEditProfileDetails(@AuthenticationPrincipal User currentUser) {
                ProfileEditResponse user = userService.getEditUserResponseByUsername(currentUser.getUsername());
                return ResponseEntity.ok(user);
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
                AvatarResponse response = userService.uploadAvatar(avatar);
                return ResponseEntity.ok(response);
        }

        @GetMapping("/me")
        public ResponseEntity<FeedUser> getFeedUser(@AuthenticationPrincipal User currentUser) {
                FeedUser user = userService.getFeedUser(currentUser);
                return ResponseEntity.ok(user);
        }
}
