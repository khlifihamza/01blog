package com.dev.backend.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dev.backend.model.Like;
import com.dev.backend.model.Post;
import com.dev.backend.model.User;

@Repository
public interface LikeRepository extends JpaRepository<Like, UUID> {
    Like findByUserAndPost(User user, Post post);

    boolean existsByUserAndPost(User user, Post post);
}