package com.connectsphere.dto.response;

import java.time.LocalDateTime;

public record FriendRequestResponse(
        Long id,
        UserSummaryResponse sender,
        UserSummaryResponse receiver,
        String status,
        int mutualFriendCount,
        LocalDateTime createdAt
) {}
