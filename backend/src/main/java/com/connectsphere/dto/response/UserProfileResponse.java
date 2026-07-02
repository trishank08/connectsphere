package com.connectsphere.dto.response;

import java.time.LocalDateTime;
import java.util.Set;

public record UserProfileResponse(
        Long id,
        String username,
        String fullName,
        String email,
        String bio,
        String location,
        String profilePictureUrl,
        String coverPhotoUrl,
        Set<String> skills,
        Set<String> interests,
        long friendCount,
        long postCount,
        boolean online,
        LocalDateTime lastSeen,
        String friendshipStatus // NONE, FRIENDS, REQUEST_SENT, REQUEST_RECEIVED
) {}
