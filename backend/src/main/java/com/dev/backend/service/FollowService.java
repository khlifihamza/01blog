package com.dev.backend.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.dev.backend.model.Follow;
import com.dev.backend.model.User;
import com.dev.backend.repository.FollowRepository;
import com.dev.backend.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class FollowService {
    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private UserRepository userRepository;

    public void followUser(UUID followerId, UUID followingId) {
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new EntityNotFoundException("Follower not found"));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new EntityNotFoundException("Following user not found"));

        if (followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            throw new DataIntegrityViolationException("you already follow this user");
        }
        if (!followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            Follow follow = new Follow(follower, following);
            followRepository.save(follow);
        }
    }

    public void unfollowUser(UUID followerId, UUID followingId) {
        userRepository.findById(followerId)
                .orElseThrow(() -> new EntityNotFoundException("Follower not found"));
        userRepository.findById(followingId)
                .orElseThrow(() -> new EntityNotFoundException("Following user not found"));
        if (!followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            throw new EntityNotFoundException("Follow status not exist");
        }
        if (followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            Follow followRow = followRepository.findByFollowerIdAndFollowingId(followerId, followingId);
            followRepository.delete(followRow);
        }
    }

    public boolean isCurrentUserFollowUser(UUID followerId, UUID followingId) {
        return followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }
}
