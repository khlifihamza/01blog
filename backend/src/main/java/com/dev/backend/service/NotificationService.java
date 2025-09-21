package com.dev.backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.dev.backend.model.Notification;
import com.dev.backend.model.NotificationType;
import com.dev.backend.model.Post;
import com.dev.backend.model.User;
import com.dev.backend.repository.NotificationRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    public void createNotification(Post post, User recipient, String title, String message, NotificationType type) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setSeen(false);
        notification.setContent(message);
        notification.setTitle(title);
        notification.setLink("/post/" + post.getId());
        notification.setType(type);
        notificationRepository.save(notification);
    }

    public void createNotificationForFollow(User user, User recipient, String title, String message) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setSeen(false);
        notification.setContent(message);
        notification.setTitle(title);
        notification.setLink("/profile/" + user.getUsername());
        notification.setType(NotificationType.FOLLOW);
        notificationRepository.save(notification);
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

    public List<Notification> getNotifications(UUID currentUserId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(currentUserId);
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
}
