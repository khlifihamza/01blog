package com.dev.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.dev.backend.dto.CommentResponse;
import com.dev.backend.model.Comment;
import com.dev.backend.model.NotificationType;
import com.dev.backend.model.Post;
import com.dev.backend.model.User;
import com.dev.backend.repository.CommentRepository;
import com.dev.backend.repository.PostRepository;
import com.dev.backend.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class CommentService {
        private final CommentRepository commentRepository;

        private final PostRepository postRepository;

        private final NotificationService notificationService;

        private final UserRepository userRepository;

        @Value("${file.fetchUrl}")
        private String fetchUrl;

        @Autowired
        public CommentService(CommentRepository commentRepository, PostRepository postRepository,
                        NotificationService notificationService, UserRepository userRepository) {
                this.commentRepository = commentRepository;
                this.notificationService = notificationService;
                this.postRepository = postRepository;
                this.userRepository = userRepository;
        }

        public CommentResponse comment(User currentUser, UUID postId, String content) {
                Post post = postRepository.findById(postId)
                                .orElseThrow(() -> new EntityNotFoundException("Post not found"));
                Comment comment = new Comment(currentUser, post, content);
                commentRepository.save(comment);
                CommentResponse commentResponse = new CommentResponse(comment.getId(), comment.getUser().getUsername(),
                                comment.getUser().getAvatar() != null
                                                ? fetchUrl + comment.getUser().getAvatar()
                                                : null,
                                comment.getCreatedAt().toString(), comment.getContent(),
                                currentUser.getId().equals(comment.getUser().getId()));
                if (!currentUser.getId().equals(post.getUser().getId())) {
                        notificationService.createNotification(null, null, comment, null, post.getUser(),
                                        currentUser.getUsername() + " commented on your post",
                                        comment.getContent(), NotificationType.COMMENT);
                }
                return commentResponse;
        }

        public void deleteComment(UUID commentId, UUID currentUserId) {
                Comment comment = commentRepository.findById(commentId)
                                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));
                User user = userRepository.findById(currentUserId)
                                .orElseThrow(() -> new EntityNotFoundException("User not found"));
                if (!comment.getUser().getId().equals(user.getId())) {
                        throw new AccessDeniedException("You cannot delete another user's comment.");
                }

                if (notificationService.existsByCommentAndRecipient(comment.getId(),
                                comment.getPost().getUser().getId())) {
                        notificationService.deleteCommentNotification(comment.getId(),
                                        comment.getPost().getUser().getId());
                }

                commentRepository.deleteById(commentId);
        }

        public List<CommentResponse> getPostComments(UUID postId, UUID currentUserId, LocalDateTime lastCreatedAt) {
                lastCreatedAt = (lastCreatedAt == null) ? LocalDateTime.now() : lastCreatedAt;
                postRepository.findById(postId)
                                .orElseThrow(() -> new EntityNotFoundException("Post not found"));
                List<Comment> comments = commentRepository
                                .findTop10ByPostIdAndCreatedAtLessThanOrderByCreatedAtDesc(postId, lastCreatedAt);
                List<CommentResponse> commentsResponse = new ArrayList<>();
                for (Comment comment : comments) {
                        CommentResponse commentResponse = new CommentResponse(comment.getId(),
                                        comment.getUser().getUsername(),
                                        comment.getUser().getAvatar() != null
                                                        ? fetchUrl + comment.getUser().getAvatar()
                                                        : null,
                                        comment.getCreatedAt().toString(), comment.getContent(),
                                        currentUserId.equals(comment.getUser().getId()));
                        commentsResponse.add(commentResponse);
                }
                return commentsResponse;
        }

        public long getCommentsCount() {
                return commentRepository.count();
        }

        public CommentResponse updateComment(UUID commentId, String content, UUID currentUserId) {
                Comment comment = commentRepository.findById(commentId)
                                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));
                User user = userRepository.findById(currentUserId)
                                .orElseThrow(() -> new EntityNotFoundException("User not found"));

                if (!comment.getUser().getId().equals(user.getId())) {
                        throw new AccessDeniedException("You cannot update another user's comment.");
                }

                comment.setContent(content);
                commentRepository.save(comment);

                return new CommentResponse(
                                comment.getId(),
                                comment.getUser().getUsername(),
                                comment.getUser().getAvatar() != null
                                                ? fetchUrl + comment.getUser().getAvatar()
                                                : null,
                                comment.getCreatedAt().toString(),
                                comment.getContent(),
                                true);
        }
}
