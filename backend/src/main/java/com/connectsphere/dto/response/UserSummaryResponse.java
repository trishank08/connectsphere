package com.connectsphere.dto.response;

import java.util.Set;

public record UserSummaryResponse(
        Long id,
        String username,
        String fullName,
        String email,
        String profilePictureUrl,
        boolean online,
        Set<String> roles
) {}
