package com.dev.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.backend.model.Follow;

@Repository
public interface FollowRepository extends JpaRepository<Follow, UUID> {
    List<Follow> findByFollowerId(UUID followerId);

    List<Follow> findByFollowingId(UUID followingId);

    boolean existsByFollowerIdAndFollowingId(UUID followerId, UUID followingId);

    Follow findByFollowerIdAndFollowingId(UUID followerId, UUID followingId);
}
