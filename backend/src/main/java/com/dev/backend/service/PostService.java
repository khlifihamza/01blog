package com.dev.backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import com.dev.backend.dto.PostRequest;
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

    public Post savePost(PostRequest postDto, UUID userId) {
        User user = userRepository.getReferenceById(userId);
        Post post = new Post();
        post.setTitle(postDto.title());
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

    public Post updatePost(UUID id, PostRequest updatedPost, UUID currentUserId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));
        if (!post.getUser().getId().equals(currentUserId)) {
            throw new AccessDeniedException("You cannot delete another user's post.");
        }
        post.setTitle(updatedPost.title());
        post.setContent(updatedPost.content());
        post.setFiles(String.join(", ", updatedPost.files()));
        post.setThumbnail(updatedPost.thumbnail());
        return postRepository.save(post);
    }

    public void deletePost(UUID id, UUID currentUserId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (!post.getUser().getId().equals(user.getId()) && !user.getRole().equals(Role.ADMIN)) {
            throw new AccessDeniedException("You cannot delete another user's post.");
        }
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

    public List<Post> getPosts(UUID userId) {
        return postRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Post> getFeedPosts(UUID userId) {
        return postRepository.findFeedPosts(userId);
    }

    public Post getPost(UUID postId) {
        return postRepository.findById(postId).orElseThrow();
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public long getAllPostsCount() {
        return postRepository.count();
    }
}
