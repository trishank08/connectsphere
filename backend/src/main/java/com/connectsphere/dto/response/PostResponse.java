package com.connectsphere.dto.response;

import java.time.LocalDateTime;

public record PostResponse(
        Long id,
        UserSummaryResponse author,
        String content,
        String imageUrl,
        PostResponse sharedPost,
        long likeCount,
        long commentCount,
        boolean likedByCurrentUser,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
