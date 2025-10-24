package com.dev.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dev.backend.model.Post;
import com.dev.backend.model.PostStatus;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
    List<Post> findTop10ByUserIdAndStatusAndCreatedAtLessThanOrderByCreatedAtDesc(UUID userId, PostStatus status, LocalDateTime lastCreatedAt);

    @Query("""
                SELECT p
                FROM Post p
                JOIN p.user u
                WHERE (u.id = :userId
                       OR u.id IN (
                           SELECT f.following.id
                           FROM Follow f
                           WHERE f.follower.id = :userId
                       )
                )
                AND p.status = 'PUBLISHED'
                AND (p.createdAt < :lastCreatedAt)
                ORDER BY p.createdAt DESC
                LIMIT 10
            """)
    List<Post> findFeedPosts(
            @Param("userId") UUID userId,
            @Param("lastCreatedAt") LocalDateTime lastCreatedAt);

    List<Post> findTop10ByCreatedAtLessThanAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(LocalDateTime lastCreatedAt,
            String query);

    Page<Post> findByStatusAndTitleContainingIgnoreCase(PostStatus status, String query, Pageable pageable);

    List<Post> findTop9ByUserIdNotAndStatusOrderByLikes(UUID currentUserId, PostStatus status);

    List<Post> findTop10ByCreatedAtLessThanOrderByCreatedAtDesc(LocalDateTime lastCreatedAt);

    long countByUserIdAndStatus(UUID currentUserId, PostStatus status);
}
