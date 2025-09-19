package com.dev.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dev.backend.model.Post;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
    List<Post> findByUserIdOrderByCreatedAtDesc(UUID userId);

    @Query("SELECT p FROM Post p JOIN p.user u WHERE u.id = :userId OR u.id IN (SELECT f.following.id FROM Follow f WHERE f.follower.id = :userId) ORDER BY p.createdAt DESC")
    List<Post> findFeedPosts(@Param("userId") UUID userId);
}
