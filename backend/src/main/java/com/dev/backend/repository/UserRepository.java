package com.dev.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dev.backend.model.User;
import com.dev.backend.model.UserStatus;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    List<User> findTop10ByUsernameContainingIgnoreCaseAndCreatedAtLessThanOrderByCreatedAtDesc(String query,
            LocalDateTime lastCreatedAt);

    Page<User> findByStatusAndUsernameContainingIgnoreCase(UserStatus status, String query, Pageable pageable);

    List<User> findTop9ByIdNotAndStatusOrderByFollowersDesc(UUID currentUserId, UserStatus status);

    List<User> findTop10ByCreatedAtLessThanOrderByCreatedAtDesc(LocalDateTime lastCreatedAt);
}