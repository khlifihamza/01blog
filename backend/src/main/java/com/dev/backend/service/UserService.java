package com.dev.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.dev.backend.dto.DiscoveryUserResponse;
import com.dev.backend.dto.FeedUser;
import com.dev.backend.dto.LoginRequest;
import com.dev.backend.dto.ProfileEditResponse;
import com.dev.backend.dto.ProfileUserResponse;
import com.dev.backend.dto.RegisterRequest;
import com.dev.backend.dto.UserResponse;
import com.dev.backend.model.Post;
import com.dev.backend.model.PostStatus;
import com.dev.backend.model.Role;
import com.dev.backend.model.User;
import com.dev.backend.model.UserStatus;
import com.dev.backend.repository.PostRepository;
import com.dev.backend.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class UserService {
    private final UserRepository userRepository;

    private final FollowService followService;

    private final PostRepository postRepository;

    private final PostService postService;

    private final AuthenticationManager authenticationManager;

    private final PasswordEncoder passwordEncoder;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${file.fetchUrl}")
    private String fetchUrl;

    private static final List<String> ACCEPTED_TYPES = List.of(
            MediaType.IMAGE_JPEG_VALUE,
            "image/jpg",
            MediaType.IMAGE_PNG_VALUE,
            "image/gif",
            "image/webp",
            "image/svg+xml",
            "video/mp4",
            "video/webm",
            "video/ogg",
            "video/quicktime");

    @Autowired
    public UserService(UserRepository userRepository, FollowService followService,
            AuthenticationManager authenticationManager, PasswordEncoder passwordEncoder,
            PostRepository postRepository, PostService postService) {
        this.authenticationManager = authenticationManager;
        this.followService = followService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.postService = postService;
    }

    public User signup(RegisterRequest input) {
        if (userRepository.existsByUsername(input.username())) {
            throw new IllegalArgumentException("Username already exists.");
        }
        if (userRepository.existsByEmail(input.email())) {
            throw new IllegalArgumentException("Email already exists.");
        }
        if (!input.password().equals(input.confirmPassword())) {
            throw new IllegalArgumentException("confirm password incorrect");
        }
        User user = new User(input.username(), input.email(), passwordEncoder.encode(input.password()), Role.USER,
                UserStatus.ACTIVE);
        return userRepository.save(user);
    }

    public User login(LoginRequest input) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        input.identifier(),
                        input.password()));

        User user = (User) authentication.getPrincipal();
        return user;
    }

    public User getUserByUsername(String username) {
        if (!userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username don't exists.");
        }
        return userRepository.findByUsername(username).orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    public ProfileUserResponse getUserResponseByUsername(String username, UUID currentUserId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        ProfileUserResponse userResponse = new ProfileUserResponse(user.getId(), user.getUsername(),
                user.getAvatar() != null
                        ? fetchUrl + user.getAvatar()
                        : null,
                user.getBio(), user.getCreatedAt().toString(), user.getFollowers().size(),
                user.getFollowing().size(), postRepository.countByUserIdAndStatus(user.getId(), PostStatus.PUBLISHED),
                user.getId().equals(currentUserId),
                followService.isCurrentUserFollowUser(currentUserId, user.getId()));
        return userResponse;
    }

    public ProfileEditResponse getEditUserResponseByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        ProfileEditResponse profileEditResponse = new ProfileEditResponse(user.getUsername(), user.getEmail(),
                user.getAvatar() != null
                        ? fetchUrl + user.getAvatar()
                        : null,
                user.getBio());
        return profileEditResponse;
    }

    private String uploadAvatar(MultipartFile avatar) throws IOException {
        String avatarId = "";
        String avatarName = avatar.getOriginalFilename();
        String avatarExtension = (avatarName != null && avatarName.contains("."))
                ? avatarName.substring(avatarName.lastIndexOf("."))
                : "";
        avatarId = UUID.randomUUID() + avatarExtension;
        Path path = Paths.get(uploadDir + "/images", avatarId);
        Files.createDirectories(path.getParent());
        Files.copy(avatar.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
        return avatarId;
    }

    private void deleteAvatar(String filename) throws IOException {
        if (filename == null)
            return;
        Path avatarPath = Paths.get(uploadDir + "/images").resolve(filename).normalize();

        if (avatarPath == null || !Files.exists(avatarPath)) {
            return;
        }

        Files.delete(avatarPath);
    }

    public FeedUser getFeedUser(User currentUser) {
        return new FeedUser(currentUser.getUsername(), currentUser.getRole().name(),
                currentUser.getAvatar() != null
                        ? fetchUrl
                                + currentUser.getAvatar()
                        : null);
    }

    public void saveData(String currentUsername, String username, String email, String bio, MultipartFile avatar,
            String defaultAvatar)
            throws IOException {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (!user.getUsername().equals(username) && userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists.");
        }
        if (!user.getEmail().equals(email) && userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists.");
        }

        user.setUsername(username);
        user.setEmail(email);
        if (avatar != null) {
            String contentType = avatar.getContentType();

            if (contentType == null || !ACCEPTED_TYPES.contains(contentType)) {
                throw new IllegalArgumentException("Unsupported file type: " + contentType);
            }

            deleteAvatar(user.getAvatar());
            user.setAvatar(uploadAvatar(avatar));
        }
        if (defaultAvatar != null) {
            deleteAvatar(user.getAvatar());
            user.setAvatar(null);
        }
        user.setBio(bio);
        userRepository.save(user);
    }

    public List<User> getAllUSers() {
        return userRepository.findAll();
    }

    public List<UserResponse> getAllUsers(LocalDateTime lastCreatedAt) {
        lastCreatedAt = (lastCreatedAt == null) ? LocalDateTime.now() : lastCreatedAt;
        List<User> users = userRepository.findTop10ByCreatedAtLessThanOrderByCreatedAtDesc(lastCreatedAt);
        List<UserResponse> usersResponse = new ArrayList<>();
        for (User user : users) {
            UserResponse userResponse = new UserResponse(user.getId(), user.getUsername(), user.getEmail(),
                    user.getAvatar() != null ? fetchUrl + user.getAvatar() : null,
                    user.getRole().name(), user.getCreatedAt().toString(), user.getPosts().size(),
                    user.getStatus().name());
            usersResponse.add(userResponse);
        }
        return usersResponse;
    }

    public List<UserResponse> getSearchedUsers(String query, LocalDateTime lastCreatedAt) {
        lastCreatedAt = (lastCreatedAt == null) ? LocalDateTime.now() : lastCreatedAt;
        List<User> users = userRepository
                .findTop10ByUsernameContainingIgnoreCaseAndCreatedAtLessThanOrderByCreatedAtDesc(query, lastCreatedAt);
        List<UserResponse> usersResponse = new ArrayList<>();
        for (User user : users) {
            UserResponse userResponse = new UserResponse(user.getId(), user.getUsername(), user.getEmail(),
                    user.getAvatar() != null ? fetchUrl + user.getAvatar() : null,
                    user.getRole().name(), user.getCreatedAt().toString(), user.getPosts().size(),
                    user.getStatus().name());
            usersResponse.add(userResponse);
        }
        return usersResponse;
    }

    public List<DiscoveryUserResponse> getSearchedDiscoveryUsers(UUID currentUserId, String query, Pageable pageable) {
        List<User> users = userRepository
                .findByUsernameContainingIgnoreCase(query, pageable).getContent();
        List<DiscoveryUserResponse> usersResponse = new ArrayList<>();
        for (User user : users) {
            DiscoveryUserResponse discoveryUserResponse = new DiscoveryUserResponse(user.getId(),
                    user.getUsername(),
                    user.getAvatar() != null
                            ? fetchUrl + user.getAvatar()
                            : null,
                    user.getBio(),
                    user.getFollowers().size(), user.getPosts().size(),
                    currentUserId.equals(user.getId()),
                    followService.isCurrentUserFollowUser(currentUserId, user.getId()));
            usersResponse.add(discoveryUserResponse);
        }
        return usersResponse;
    }

    public void banUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (user.getRole().equals(Role.ADMIN)) {
            throw new DataIntegrityViolationException("You cannot ban yourself.");
        }
        user.setStatus(UserStatus.BANNED);
        userRepository.save(user);
    }

    public void unbanUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (user.getRole().equals(Role.ADMIN)) {
            throw new DataIntegrityViolationException("You cannot unban yourself.");
        }
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
    }

    public void deleteUser(String username) throws IOException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (user.getRole().equals(Role.ADMIN)) {
            throw new DataIntegrityViolationException("You dont have permession to do this action.");
        }
        deleteAvatar(user.getAvatar());
        for (Post post : user.getPosts()) {
            postService.deleteMedia(post.getThumbnail(), post.getFiles());
        }
        userRepository.delete(user);
    }

    public long getAllUsersCount() {
        return userRepository.count();
    }

    public List<DiscoveryUserResponse> getTop9Profiles(UUID currentUserId) {
        List<User> users = userRepository.findTop9RecommendedUsers(currentUserId);
        List<DiscoveryUserResponse> usersResponse = new ArrayList<>();
        for (User user : users) {
            DiscoveryUserResponse discoveryUserResponse = new DiscoveryUserResponse(user.getId(),
                    user.getUsername(),
                    user.getAvatar() != null
                            ? fetchUrl + user.getAvatar()
                            : null,
                    user.getBio(),
                    user.getFollowers().size(), user.getPosts().size(),
                    currentUserId.equals(user.getId()),
                    followService.isCurrentUserFollowUser(currentUserId, user.getId()));
            usersResponse.add(discoveryUserResponse);
        }
        return usersResponse;
    }
}
