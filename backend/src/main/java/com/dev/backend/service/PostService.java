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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.multipart.MultipartFile;

import com.dev.backend.dto.AdminPostResponse;
import com.dev.backend.dto.Author;
import com.dev.backend.dto.CreatePostRequest;
import com.dev.backend.dto.DetailPostResponse;
import com.dev.backend.dto.DiscoveryPostResponse;
import com.dev.backend.dto.EditPostResponse;
import com.dev.backend.dto.FeedPostResponse;
import com.dev.backend.dto.ProfilePostResponse;
import com.dev.backend.dto.UpdatePostRequest;
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
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

@Service
@Validated
public class PostService {
    private final PostRepository postRepository;

    private final UserRepository userRepository;

    private final NotificationService notificationService;

    private final FollowService followService;

    private final LikeService likeService;

    private final HtmlSanitizerService htmlSanitizerService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${file.fetchUrl}")
    private String fetchUrl;

    @Autowired
    public PostService(PostRepository postRepository, UserRepository userRepository,
            NotificationService notificationService, FollowService followService, LikeService likeService,
            HtmlSanitizerService htmlSanitizerService) {
        this.followService = followService;
        this.htmlSanitizerService = htmlSanitizerService;
        this.likeService = likeService;
        this.notificationService = notificationService;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Post savePost(UUID userId, @Valid CreatePostRequest data)
            throws SafeHtmlException, IOException {

        UploadResponse uploadResponse = upload(data.thumbnail(), data.files());

        String content = addLinkToSrc(data.content(), uploadResponse.fileNames());

        String sanitizeContent = htmlSanitizerService.sanitizeContent(content);

        User user = userRepository.getReferenceById(userId);
        Post post = new Post();
        post.setTitle(data.title());
        post.setContent(sanitizeContent);
        post.setFiles(String.join(", ", uploadResponse.fileNames()));
        post.setUser(user);
        post.setThumbnail(uploadResponse.thumbnail());
        post.setStatus(PostStatus.PUBLISHED);
        postRepository.save(post);
        List<Follow> followers = user.getFollowers();
        for (Follow follow : followers) {
            notificationService.createNotification(post, null, null, null, follow.getFollower(),
                    "New post from " + user.getUsername(),
                    user.getUsername() + " published: \"" + post.getTitle() + "\"", NotificationType.POST);
        }
        return post;
    }

    public Post updatePost(UUID id,
            UUID currentUserId, @Valid UpdatePostRequest data)
            throws SafeHtmlException, IOException {

        Post post = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));

        if (!post.getUser().getId().equals(currentUserId)) {
            throw new AccessDeniedException("You cannot delete another user's post.");
        }

        String finalThumbnail;
        if (data.thumbnail() != null && !data.thumbnail().isEmpty()) {
            finalThumbnail = upload(data.thumbnail(), null).thumbnail();
            deleteMedia(data.oldThumbnail(), "");
        } else {
            finalThumbnail = data.oldThumbnail().substring(data.oldThumbnail().lastIndexOf('/') + 1);
        }

        List<String> finalFileNames = new ArrayList<>();
        if (data.oldFileNames() != null && !data.oldFileNames().isEmpty()) {
            List<String> newUploadedFiles = new ArrayList<>();
            if (data.files() != null && !data.files().isEmpty()) {
                newUploadedFiles = upload(null, data.files()).fileNames();
            }

            int newFileIndex = 0;
            for (String fileName : data.oldFileNames()) {
                if (fileName.startsWith("new_file_")) {
                    finalFileNames.add(newUploadedFiles.get(newFileIndex++));
                } else {
                    finalFileNames.add(fileName);
                }
            }
        }

        String content = addLinkToSrc(data.content(), finalFileNames);

        String sanitizeContent = htmlSanitizerService.sanitizeContent(content);

        if (!post.getFiles().equals("")) {
            String[] filesToCheck = post.getFiles().split(", ");
            List<String> filesToDelete = new ArrayList<>();
            for (String file : filesToCheck) {
                if (!sanitizeContent.contains(file)) {
                    filesToDelete.add(file);
                }
            }
            if (!filesToDelete.isEmpty()) {
                deleteMedia(null, String.join(", ", filesToDelete));
            }
        }

        post.setTitle(data.title());
        post.setContent(sanitizeContent);
        post.setFiles(String.join(", ", finalFileNames));
        post.setThumbnail(finalThumbnail);
        return postRepository.save(post);
    }

    @Transactional
    public void deletePost(UUID id, UUID currentUserId) throws IOException {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (!post.getUser().getId().equals(user.getId()) && !user.getRole().equals(Role.ADMIN)) {
            throw new AccessDeniedException("You cannot delete another user's post.");
        }
        List<Follow> followers = user.getFollowers();
        for (Follow follow : followers) {
            if (notificationService.existsByPostAndRecipient(id, follow.getFollower().getId())) {
                notificationService.deletePostNotification(id, follow.getFollower().getId());
            }
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

    public List<FeedPostResponse> getFeedPosts(UUID userId, LocalDateTime lastCreatedAt) {
        if (lastCreatedAt == null) {
            lastCreatedAt = LocalDateTime.now();
        }
        List<Post> posts = postRepository.findFeedPosts(userId, lastCreatedAt);
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
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));
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
                likeService.isUserLikedPost(currentUserId, post.getId()), isAuthor);
        return postResponse;
    }

    public EditPostResponse getPostToEdit(UUID postId, UUID currentUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));
        if (!post.getUser().getId().equals(currentUserId)) {
            throw new AccessDeniedException("You cannot Edit another user's post.");
        }
        EditPostResponse editpost = new EditPostResponse(post.getId(), post.getTitle(), post.getContent(),
                fetchUrl + post.getThumbnail(), post.getFiles().split(", "));
        return editpost;
    }

    public List<ProfilePostResponse> getProfilePosts(String username, LocalDateTime lastCreatedAt) {
        lastCreatedAt = (lastCreatedAt == null) ? LocalDateTime.now() : lastCreatedAt;
        UUID userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found")).getId();
        List<Post> posts = postRepository
                .findTop10ByUserIdAndStatusAndCreatedAtLessThanOrderByCreatedAtDesc(userId, PostStatus.PUBLISHED,
                        lastCreatedAt);
        List<ProfilePostResponse> postsResponse = new ArrayList<>();
        for (Post post : posts) {
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

    public List<AdminPostResponse> getAllPosts(LocalDateTime lastCreatedAt) {
        lastCreatedAt = (lastCreatedAt == null) ? LocalDateTime.now() : lastCreatedAt;
        List<Post> posts = postRepository.findTop10ByCreatedAtLessThanOrderByCreatedAtDesc(lastCreatedAt);
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

    public List<AdminPostResponse> getSearchedPosts(String query, LocalDateTime lastCreatedAt) {
        lastCreatedAt = (lastCreatedAt == null) ? LocalDateTime.now() : lastCreatedAt;
        List<Post> posts = postRepository
                .findTop10ByCreatedAtLessThanAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(lastCreatedAt, query);
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
        List<Post> posts = postRepository
                .findByStatusAndTitleContainingIgnoreCase(PostStatus.PUBLISHED, query, pageable).getContent();
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

    public List<DiscoveryPostResponse> getTop9Posts(UUID currentUserId) {
        List<Post> posts = postRepository.findTop9ByUserIdNotAndStatusOrderByLikes(currentUserId,
                PostStatus.PUBLISHED);
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
        if (thumbnail != null) {
            String thumbnailName = thumbnail.getOriginalFilename();
            String thumbnailExtension = (thumbnailName != null && thumbnailName.contains("."))
                    ? thumbnailName.substring(thumbnailName.lastIndexOf("."))
                    : "";
            thumbnailId = UUID.randomUUID() + thumbnailExtension;

            Path path = Paths.get(uploadDir + "/images", thumbnailId);

            Files.createDirectories(path.getParent());
            Files.copy(thumbnail.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
        }
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

                Path path = Paths.get(uploadDir + subDir, id);

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

    public void deleteMedia(String thumbnail, String files) throws IOException {
        if (thumbnail != null) {
            Path pathThumbnail = Paths.get(uploadDir + "/images").resolve(thumbnail).normalize();

            if (pathThumbnail == null || !Files.exists(pathThumbnail)) {
                return;
            }

            Files.delete(pathThumbnail);
        }

        if (files.equals(""))
            return;

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

    private String addLinkToSrc(String htmlString, List<String> fileNames) {
        Pattern pattern = Pattern.compile("(blob:http://localhost:4200/[a-zA-Z0-9+.-]+)");
        Matcher matcher = pattern.matcher(htmlString);
        StringBuffer result = new StringBuffer();
        int index = 0;

        while (matcher.find()) {
            if (index < fileNames.size()) {
                String newUrl = "http://localhost:8080/api/post/file/" + fileNames.get(index++);
                String replacement = newUrl;
                matcher.appendReplacement(result, Matcher.quoteReplacement(replacement));
            }
        }
        matcher.appendTail(result);
        return result.toString();
    }
}
