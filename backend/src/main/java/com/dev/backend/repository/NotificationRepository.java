package com.dev.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.backend.model.Notification;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(UUID userId);

    long countByRecipientIdAndSeenFalse(UUID userId);

    Notification findByRecipientIdAndSenderId(UUID followerId, UUID followingId);
}
