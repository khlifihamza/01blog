package com.dev.backend.repository;

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
    Page<Post> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, PostStatus status, Pageable pageable);

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
                ORDER BY p.createdAt DESC
            """)
    Page<Post> findFeedPosts(@Param("userId") UUID userId, Pageable pageable);

    Page<Post> findByTitleContainingIgnoreCase(String query, Pageable pageable);

    Page<Post> findByTitleAndStatusContainingIgnoreCase(String query, PostStatus status, Pageable pageable);

    List<Post> findTop9ByUserIdNotAndStatusOrderByLikesDesc(UUID currentUserId, PostStatus status);

    Page<Post> findAll(Pageable pageable);
}
