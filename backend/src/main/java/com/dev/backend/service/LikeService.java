package com.dev.backend.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.dev.backend.model.Like;
import com.dev.backend.model.NotificationType;
import com.dev.backend.model.Post;
import com.dev.backend.model.User;
import com.dev.backend.repository.LikeRepository;
import com.dev.backend.repository.PostRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class LikeService {
    private final LikeRepository likeRepository;

    private final PostRepository postRepository;

    private final NotificationService notificationService;

    @Autowired
    public LikeService(LikeRepository likeRepository, PostRepository postRepository,
            NotificationService notificationService) {
        this.likeRepository = likeRepository;
        this.notificationService = notificationService;
        this.postRepository = postRepository;
    }

    public void like(User currentUser, UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));
        if (likeRepository.existsByUserIdAndPostId(currentUser.getId(), post.getId())) {
            throw new DataIntegrityViolationException("you already liked this post");
        }
        Like like = new Like(currentUser, post);
        likeRepository.save(like);
        if (!currentUser.getId().equals(post.getUser().getId())) {
            notificationService.createNotification(null, null, null, like, post.getUser(),
                    currentUser.getUsername() + " liked your post",
                    "Your post \"" + post.getTitle() + "\" received a new like", NotificationType.LIKE);
        }
    }

    public void dislike(User currentUser, UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));
        if (!likeRepository.existsByUserIdAndPostId(currentUser.getId(), post.getId())) {
            throw new DataIntegrityViolationException("you already disliked this post");
        }
        Like like = likeRepository.findByUserAndPost(currentUser, post);

        if (notificationService.existsByLikeAndRecipient(like.getId(), post.getUser().getId())) {
            notificationService.deleteLikeNotification(like.getId(), post.getUser().getId());
        }

        likeRepository.delete(like);
    }

    public boolean isUserLikedPost(UUID currentUserId, UUID postId) {
        return likeRepository.existsByUserIdAndPostId(currentUserId, postId);
    }

    public long getAllLikesCount() {
        return likeRepository.count();
    }
}
