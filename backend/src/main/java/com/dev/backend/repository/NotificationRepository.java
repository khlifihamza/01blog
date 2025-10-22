package com.dev.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.backend.model.Notification;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findTop10ByRecipientIdAndCreatedAtLessThanOrderByCreatedAtDesc(UUID userId,
            LocalDateTime lastCreatedAt);

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(UUID userId);

    Notification findBySenderIdAndRecipientId(UUID senderId, UUID recipientId);

    Notification findByPostIdAndRecipientId(UUID postId, UUID recipientId);

    Notification findByLikeIdAndRecipientId(UUID likeId, UUID recipientId);

    Notification findByCommentIdAndRecipientId(UUID commentId, UUID recipientId);

    long countByRecipientIdAndSeenFalse(UUID userId);

    boolean existsBySenderIdAndRecipientId(UUID senderId, UUID recipientId);

    boolean existsByPostIdAndRecipientId(UUID postId, UUID recipientId);

    boolean existsByLikeIdAndRecipientId(UUID likeId, UUID recipientId);

    boolean existsByCommentIdAndRecipientId(UUID commentId, UUID recipientId);
}