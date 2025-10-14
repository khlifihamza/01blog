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
    private final FollowRepository followRepository;

    private final UserRepository userRepository;

    private final NotificationService notificationService;

    @Autowired
    public FollowService(FollowRepository followRepository, UserRepository userRepository,
            NotificationService notificationService) {
        this.followRepository = followRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    public void followUser(UUID followerId, String username) {
        UUID userToFollowId = userRepository.findByUsername(username).orElseThrow(() -> new EntityNotFoundException("User not found")).getId();
        if (followerId.equals(userToFollowId)) {
            throw new DataIntegrityViolationException("You cannot follow yourself.");
        }

        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new EntityNotFoundException("Follower not found"));
        User following = userRepository.findById(userToFollowId)
                .orElseThrow(() -> new EntityNotFoundException("Following user not found"));

        if (followRepository.existsByFollowerIdAndFollowingId(followerId, userToFollowId)) {
            throw new DataIntegrityViolationException("you already follow this user");
        }

        if (!followRepository.existsByFollowerIdAndFollowingId(followerId, userToFollowId)) {
            Follow follow = new Follow(follower, following);

            notificationService.createNotificationForFollow(follower, following,
                    follower.getUsername() + " started following you",
                    "You have a new follower! Check out their profile.");

            followRepository.save(follow);
        }
    }

    public void unfollowUser(UUID unfollowerId, String username) {
        UUID userToUnfollowId = userRepository.findByUsername(username).orElseThrow(() -> new EntityNotFoundException("User not found")).getId();
        if (unfollowerId.equals(userToUnfollowId)) {
            throw new DataIntegrityViolationException("You cannot unfollow yourself.");
        }

        userRepository.findById(unfollowerId)
                .orElseThrow(() -> new EntityNotFoundException("Follower not found"));
        userRepository.findById(userToUnfollowId)
                .orElseThrow(() -> new EntityNotFoundException("Following user not found"));

        if (!followRepository.existsByFollowerIdAndFollowingId(unfollowerId, userToUnfollowId)) {
            throw new EntityNotFoundException("Follow status not exist");
        }

        if (followRepository.existsByFollowerIdAndFollowingId(unfollowerId, userToUnfollowId)) {
            Follow followRow = followRepository.findByFollowerIdAndFollowingId(unfollowerId, userToUnfollowId);
            followRepository.delete(followRow);
        }
    }

    public boolean isCurrentUserFollowUser(UUID followerId, UUID followingId) {
        return followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }
}
