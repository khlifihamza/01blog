package com.dev.backend.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.backend.model.Notification;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

}
