package com.dev.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.dev.backend.dto.NotificationResponse;
import com.dev.backend.model.Comment;
import com.dev.backend.model.Like;
import com.dev.backend.model.Notification;
import com.dev.backend.model.NotificationType;
import com.dev.backend.model.Post;
import com.dev.backend.model.User;
import com.dev.backend.repository.NotificationRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void createNotification(Post post, User sender, Comment comment, Like like, User recipient, String title,
            String message, NotificationType type) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setSeen(false);
        notification.setContent(message);
        notification.setTitle(title);
        notification.setPost(post);
        notification.setSender(sender);
        notification.setComment(comment);
        notification.setLike(like);
        notification.setType(type);
        notificationRepository.save(notification);
    }

    public boolean existsBysenderAndRecipient(UUID senderId, UUID recipientId) {
        return notificationRepository.existsBySenderIdAndRecipientId(senderId, recipientId);
    }

    public boolean existsByPostAndRecipient(UUID postId, UUID recipientId) {
        return notificationRepository.existsByPostIdAndRecipientId(postId, recipientId);
    }

    public boolean existsByLikeAndRecipient(UUID likeId, UUID recipientId) {
        return notificationRepository.existsByLikeIdAndRecipientId(likeId, recipientId);
    }

    public boolean existsByCommentAndRecipient(UUID commentId, UUID recipientId) {
        return notificationRepository.existsByCommentIdAndRecipientId(commentId, recipientId);
    }

    public void markAsRead(UUID notificationId, UUID currentUserId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found"));
        if (!notification.getRecipient().getId().equals(currentUserId)) {
            throw new AccessDeniedException("You cannot mark as read another user's notification.");
        }
        notification.setSeen(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(UUID currentUserId) {
        List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(currentUserId);
        for (Notification notification : notifications) {
            markAsRead(notification.getId(), currentUserId);
        }
    }

    public List<NotificationResponse> getNotifications(UUID currentUserId, LocalDateTime lastCreatedAt) {
        lastCreatedAt = (lastCreatedAt == null) ? LocalDateTime.now() : lastCreatedAt;
        List<Notification> notifications = notificationRepository
                .findTop10ByRecipientIdAndCreatedAtLessThanOrderByCreatedAtDesc(currentUserId, lastCreatedAt);
        List<NotificationResponse> notificationsResponse = new ArrayList<>();
        for (Notification notification : notifications) {
            NotificationResponse notificationResponse = new NotificationResponse(notification.getId(),
                    notification.getType().name().toLowerCase(),
                    notification.getTitle(), notification.getContent(),
                    notification.getCreatedAt().toString(),
                    notification.getSeen(), createLink(notification));
            notificationsResponse.add(notificationResponse);
        }
        return notificationsResponse;
    }

    public void deleteFollowNotification(UUID senderId, UUID recipientId) {
        Notification notification = notificationRepository.findBySenderIdAndRecipientId(senderId, recipientId);
        notificationRepository.delete(notification);
    }

    public void deletePostNotification(UUID postId, UUID recipientId) {
        Notification notification = notificationRepository.findByPostIdAndRecipientId(postId, recipientId);
        notificationRepository.delete(notification);
    }

    public void deleteLikeNotification(UUID likeId, UUID recipientId) {
        Notification notification = notificationRepository.findByLikeIdAndRecipientId(likeId, recipientId);
        notificationRepository.delete(notification);
    }

    public void deleteCommentNotification(UUID commentId, UUID recipientId) {
        Notification notification = notificationRepository.findByCommentIdAndRecipientId(commentId, recipientId);
        notificationRepository.delete(notification);
    }

    public void deleteNotification(UUID id, UUID currentUserId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found"));
        if (!notification.getRecipient().getId().equals(currentUserId)) {
            throw new AccessDeniedException("You cannot delete another user's notification.");
        }
        notificationRepository.deleteById(id);
    }

    public void deleteAllNotification(UUID currentUserId) {
        List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(currentUserId);
        for (Notification notification : notifications) {
            deleteNotification(notification.getId(), currentUserId);
        }
    }

    public long countUnread(UUID currentUserID) {
        return notificationRepository.countByRecipientIdAndSeenFalse(currentUserID);
    }

    private String createLink(Notification notification) {
        String res = "";
        switch (notification.getType().name()) {
            case "LIKE":
                res = "/post/" + notification.getLike().getPost().getId().toString();
                break;
            case "COMMENT":
                res = "/post/" + notification.getComment().getPost().getId().toString();
                break;
            case "FOLLOW":
                res = "/profile/" + notification.getSender().getUsername();
                break;
            default:
                res = "/post/" + notification.getPost().getId().toString();
                break;
        }
        return res;
    }
}
