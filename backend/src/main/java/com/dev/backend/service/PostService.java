package com.dev.backend.service;

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
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.dev.backend.dto.AdminPostResponse;
import com.dev.backend.dto.Author;
import com.dev.backend.dto.DetailPostResponse;
import com.dev.backend.dto.DiscoveryPostResponse;
import com.dev.backend.dto.EditPostResponse;
import com.dev.backend.dto.FeedPostResponse;
import com.dev.backend.dto.PostRequest;
import com.dev.backend.dto.ProfilePostResponse;
import com.dev.backend.dto.UploadResponse;
import com.dev.backend.dto.UserDto;
import com.dev.backend.exception.SafeHtmlException;
import com.dev.backend.model.Follow;
import com.dev.backend.model.NotificationType;
import com.dev.backend.model.Post;
import com.dev.backend.model.PostStatus;
import com.dev.backend.model.Role;
import com.dev.backend.model.User;
import com.dev.backend.repository.PostRepository;
import com.dev.backend.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    @Autowired
    private FollowService followService;

    @Autowired
    private LikeService likeService;

    @Autowired
    private HtmlSanitizerService htmlSanitizerService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${file.fetchUrl}")
    private String fetchUrl;

    public Post savePost(PostRequest postDto, UUID userId) throws SafeHtmlException {
        String sanitizedTitle = htmlSanitizerService.sanitizeTitle(postDto.title());
        String sanitizedContent = htmlSanitizerService.sanitizeContent(postDto.content());

        if (sanitizedTitle.trim().isEmpty()) {
            throw new SafeHtmlException("Title cannot be empty or contain only HTML");
        }

        if (sanitizedContent.trim().isEmpty()) {
            throw new SafeHtmlException("Title cannot be empty or contain only HTML");
        }

        User user = userRepository.getReferenceById(userId);
        Post post = new Post();
        post.setTitle(sanitizedTitle);
        post.setContent(postDto.content());
        post.setFiles(String.join(", ", postDto.files()));
        post.setUser(user);
        post.setThumbnail(postDto.thumbnail());
        post.setStatus(PostStatus.PUBLISHED);
        postRepository.save(post);
        List<Follow> followers = user.getFollowers();
        for (Follow follow : followers) {
            notificationService.createNotification(post, follow.getFollower(), "New post from " + user.getUsername(),
                    user.getUsername() + " published: \"" + post.getTitle() + "\"", NotificationType.POST);
        }
        return post;
    }

    public Post updatePost(UUID id, PostRequest updatedPost, UUID currentUserId) throws SafeHtmlException {
        String sanitizedTitle = htmlSanitizerService.sanitizeTitle(updatedPost.title());
        String sanitizedContent = htmlSanitizerService.sanitizeContent(updatedPost.content());

        if (sanitizedTitle.trim().isEmpty()) {
            throw new SafeHtmlException("Title cannot be empty or contain only HTML");
        }

        if (sanitizedContent.trim().isEmpty()) {
            throw new SafeHtmlException("Title cannot be empty or contain only HTML");
        }

        Post post = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));
        if (!post.getUser().getId().equals(currentUserId)) {
            throw new AccessDeniedException("You cannot delete another user's post.");
        }
        post.setTitle(sanitizedTitle);
        post.setContent(updatedPost.content());
        post.setFiles(String.join(", ", updatedPost.files()));
        post.setThumbnail(updatedPost.thumbnail());
        return postRepository.save(post);
    }

    public void deletePost(UUID id, UUID currentUserId) throws IOException {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (!post.getUser().getId().equals(user.getId()) && !user.getRole().equals(Role.ADMIN)) {
            throw new AccessDeniedException("You cannot delete another user's post.");
        }
        deleteMedia(post.getThumbnail(), post.getFiles());
        postRepository.deleteById(id);
    }

    public void hidePost(UUID id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));
        post.setStatus(PostStatus.HIDDEN);
        postRepository.save(post);
    }

    public void unhidePost(UUID id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));
        post.setStatus(PostStatus.PUBLISHED);
        postRepository.save(post);
    }

    public List<FeedPostResponse> getFeedPosts(UUID userId, Pageable pageable) {
        List<Post> posts = postRepository.findFeedPosts(userId, pageable).getContent();
        List<FeedPostResponse> feedPostsResponses = new ArrayList<>();
        for (Post post : posts) {
            Author author = new Author(post.getUser().getUsername(),
                    post.getUser().getAvatar() != null
                            ? fetchUrl + post.getUser().getAvatar()
                            : null);
            FeedPostResponse feedPost = new FeedPostResponse(post.getId(), post.getTitle(), post.getContent(), author,
                    post.getCreatedAt().toString(), post.getLikes().size(), post.getComments().size(),
                    fetchUrl + post.getThumbnail());
            feedPostsResponses.add(feedPost);
        }
        return feedPostsResponses;
    }

    public DetailPostResponse getPost(UUID postId, UUID currentUserId) {
        Post post = postRepository.findById(postId).orElseThrow();
        User user = post.getUser();
        UserDto author = new UserDto(user.getUsername(),
                user.getAvatar() != null
                        ? fetchUrl + user.getAvatar()
                        : null,
                user.getBio(), user.getFollowers().size(), user.getFollowing().size(),
                followService.isCurrentUserFollowUser(currentUserId, user.getId()));
        boolean isAuthor = currentUserId.equals(user.getId());
        DetailPostResponse postResponse = new DetailPostResponse(post.getId(), post.getTitle(), post.getContent(),
                author, post.getCreatedAt().toString(), fetchUrl + post.getThumbnail(),
                post.getLikes().size(),
                post.getComments().size(),
                likeService.isUserLikedPost(currentUserId, post.getId()), false, isAuthor);
        return postResponse;
    }

    public EditPostResponse getPostToEdit(UUID postId, UUID currentUserId) {
        Post post = postRepository.findById(postId).orElseThrow();
        if (!post.getUser().getId().equals(currentUserId)) {
            throw new AccessDeniedException("You cannot Edit another user's post.");
        }
        EditPostResponse editpost = new EditPostResponse(post.getId(), post.getTitle(), post.getContent(),
                fetchUrl + post.getThumbnail(), post.getFiles().split(", "));
        return editpost;
    }

    public List<ProfilePostResponse> getProfilePosts(String username, UUID currentUserId, Pageable pageable) {
        UUID userId = userService.getUserByUsername(username).getId();
        List<Post> posts = postRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable).getContent();
        List<ProfilePostResponse> postsResponse = new ArrayList<>();
        for (Post post : posts) {
            if (post.getStatus() == PostStatus.HIDDEN && !userId.equals(currentUserId)) {
                continue;
            }
            ProfilePostResponse postResponse = new ProfilePostResponse(post.getId(), post.getTitle(), post.getContent(),
                    post.getCreatedAt().toString(), post.getLikes().size(), post.getComments().size(),
                    fetchUrl + post.getThumbnail());
            postsResponse.add(postResponse);
        }
        return postsResponse;
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public List<AdminPostResponse> getAllPosts(Pageable pageable) {
        List<Post> posts = postRepository.findAll(pageable).getContent();
        List<AdminPostResponse> postsResponse = new ArrayList<>();
        for (Post post : posts) {
            AdminPostResponse postResponse = new AdminPostResponse(post.getId(), post.getTitle(),
                    post.getUser().getUsername(), post.getCreatedAt().toString(), post.getLikes().size(),
                    post.getComments().size(), post.getStatus().name());
            postsResponse.add(postResponse);
        }
        return postsResponse;
    }

    public long getAllPostsCount() {
        return postRepository.count();
    }

    public List<AdminPostResponse> getSearchedPosts(String query, Pageable pageable) {
        List<Post> posts = postRepository.findByTitleContainingIgnoreCase(query, pageable).getContent();
        List<AdminPostResponse> postsResponse = new ArrayList<>();
        for (Post post : posts) {
            AdminPostResponse postResponse = new AdminPostResponse(post.getId(), post.getTitle(),
                    post.getUser().getUsername(), post.getCreatedAt().toString(), post.getLikes().size(),
                    post.getComments().size(), post.getStatus().name());
            postsResponse.add(postResponse);
        }
        return postsResponse;
    }

    public List<DiscoveryPostResponse> getSearchedDiscoveryPosts(String query, Pageable pageable) {
        List<Post> posts = postRepository.findByTitleContainingIgnoreCase(query, pageable).getContent();
        List<DiscoveryPostResponse> postsResponse = new ArrayList<>();
        for (Post post : posts) {
            DiscoveryPostResponse discoveryPostResponse = new DiscoveryPostResponse(post.getId(),
                    post.getTitle(),
                    post.getContent(),
                    new Author(post.getUser().getUsername(),
                            post.getUser().getAvatar() != null
                                    ? fetchUrl
                                            + post.getUser().getAvatar()
                                    : null),
                    post.getCreatedAt().toString(), post.getLikes().size(),
                    post.getComments().size(),
                    fetchUrl + post.getThumbnail());
            postsResponse.add(discoveryPostResponse);
        }
        return postsResponse;
    }

    public List<DiscoveryPostResponse> getTop9Posts() {
        List<Post> posts = postRepository.findTop9ByOrderByLikes();
        List<DiscoveryPostResponse> postsResponse = new ArrayList<>();
        for (Post post : posts) {
            DiscoveryPostResponse discoveryPostResponse = new DiscoveryPostResponse(post.getId(),
                    post.getTitle(),
                    post.getContent(),
                    new Author(post.getUser().getUsername(),
                            post.getUser().getAvatar() != null
                                    ? fetchUrl
                                            + post.getUser().getAvatar()
                                    : null),
                    post.getCreatedAt().toString(), post.getLikes().size(),
                    post.getComments().size(),
                    fetchUrl + post.getThumbnail());
            postsResponse.add(discoveryPostResponse);
        }
        return postsResponse;
    }

    public UploadResponse upload(MultipartFile thumbnail, List<MultipartFile> files) throws IOException {
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
        return response;
    }

    public ResponseEntity<?> getFile(String mediaName) throws IOException {
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

    private void deleteMedia(String thumbnail, String files) throws IOException {
        Path pathThumbnail = Paths.get(uploadDir + "/images").resolve(thumbnail).normalize();

        if (pathThumbnail == null || !Files.exists(pathThumbnail)) {
            return;
        }

        Files.delete(pathThumbnail);

        String[] fileNames = files.split(", ");

        for (String file : fileNames) {
            Path filePath = (Files.exists(Paths.get(uploadDir + "/images").resolve(file).normalize()))
                    ? Paths.get(uploadDir + "/images").resolve(file).normalize()
                    : Paths.get(uploadDir + "/videos").resolve(file).normalize();

            if (filePath == null || !Files.exists(filePath)) {
                return;
            }

            Files.delete(filePath);
        }
    }
}
