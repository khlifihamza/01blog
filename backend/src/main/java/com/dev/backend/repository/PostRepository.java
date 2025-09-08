package com.dev.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dev.backend.model.Post;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID>{
    List<Post> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
