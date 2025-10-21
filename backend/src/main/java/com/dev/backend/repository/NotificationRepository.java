package com.dev.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.backend.model.Notification;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findTop10ByRecipientIdAndCreatedAtLessThanOrderByCreatedAtDesc(UUID userId, LocalDateTime lastCreatedAt);

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(UUID userId);

    long countByRecipientIdAndSeenFalse(UUID userId);
}