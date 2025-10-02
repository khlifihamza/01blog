package com.dev.backend.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.backend.dto.ApiResponse;
import com.dev.backend.dto.NotificationResponse;
import com.dev.backend.model.Notification;
import com.dev.backend.model.User;
import com.dev.backend.service.NotificationService;

@RestController
@RequestMapping("/api/notification")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;

    @PatchMapping("/seen/{id}")
    public ResponseEntity<ApiResponse> markAsRead(@PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        notificationService.markAsRead(id, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse("Notification marked as read"));
    }

    @PatchMapping("/seenAll")
    public ResponseEntity<ApiResponse> updatePost(@AuthenticationPrincipal User currentUser) {
        notificationService.markAllAsRead(currentUser.getId());
        return ResponseEntity.ok(new ApiResponse("All Notifications marked as read"));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse> delete(@PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        notificationService.deleteNotification(id, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse("Notification deleted successfully"));
    }

    @DeleteMapping("/deleteAll")
    public ResponseEntity<ApiResponse> deleteAll(@AuthenticationPrincipal User currentUser) {
        notificationService.deleteAllNotification(currentUser.getId());
        return ResponseEntity.ok(new ApiResponse("Notification deleted successfully"));
    }

    @GetMapping("/get")
    public ResponseEntity<List<NotificationResponse>> getNotifications(@AuthenticationPrincipal User currentUser) {
        List<Notification> notifications = notificationService.getNotifications(currentUser.getId());
        List<NotificationResponse> notificationsResponse = new ArrayList<>();
        for (Notification notification : notifications) {
            NotificationResponse notificationResponse = new NotificationResponse(notification.getId(),
                    notification.getType().name().toLowerCase(),
                    notification.getTitle(), notification.getContent(),
                    notification.getCreatedAt().toString(),
                    notification.getSeen(), notification.getLink());
            notificationsResponse.add(notificationResponse);
        }
        return ResponseEntity.ok(notificationsResponse);
    }

    @GetMapping("/count")
    public ResponseEntity<Long> count(@AuthenticationPrincipal User currentUser) {
        long count = notificationService.countUnread(currentUser.getId());
        return ResponseEntity.ok(count);
    }
}
