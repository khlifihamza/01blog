package com.dev.backend.dto;

import java.util.UUID;

public record ProfileUserResponse(
                UUID id,
                String username,
                String avatar,
                String bio,
                String joinDate,
                int followers,
                int following,
                int posts,
                boolean isOwner,
                boolean isFollowed) {
}
