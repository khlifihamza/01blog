package com.dev.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dev.backend.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    List<User> findTop10ByUsernameContainingIgnoreCaseAndCreatedAtLessThanOrderByCreatedAtDesc(String query,
            LocalDateTime lastCreatedAt);

    Page<User> findByUsernameContainingIgnoreCase(String query, Pageable pageable);

    @Query(value = """
                SELECT u.*
                FROM users u
                WHERE u.id <> :currentUserId
                  AND u.id NOT IN (
                      SELECT f.following_id
                      FROM follows f
                      WHERE f.follower_id = :currentUserId
                  )
                ORDER BY (
                    SELECT COUNT(*) FROM follows f2 WHERE f2.following_id = u.id
                ) DESC
                LIMIT 9
            """, nativeQuery = true)
    List<User> findTop9RecommendedUsers(@Param("currentUserId") UUID currentUserId);

    List<User> findTop10ByCreatedAtLessThanOrderByCreatedAtDesc(LocalDateTime lastCreatedAt);
}