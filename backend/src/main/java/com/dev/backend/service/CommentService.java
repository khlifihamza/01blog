package com.dev.backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.backend.model.Comment;
import com.dev.backend.model.Post;
import com.dev.backend.model.User;
import com.dev.backend.repository.CommentRepository;
import com.dev.backend.repository.PostRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class CommentService {
    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private NotificationService notificationService;

    public Comment comment(User currentUser, UUID postId, String content) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));
        Comment comment = new Comment(currentUser, post, content);
        if (!currentUser.getId().equals(post.getUser().getId())) {
            notificationService.createNotification(post, post.getUser(),
                    currentUser.getUsername() + " commented on your post",
                    comment.getContent(), "comment");
        }
        commentRepository.save(comment);
        return comment;
    }

    public List<Comment> getPostComments(UUID postId) {
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId);
    }
}
