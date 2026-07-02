package com.connectsphere.dto.response;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String type,
        UserSummaryResponse actor,
        String message,
        Long referenceId,
        boolean read,
        LocalDateTime createdAt
) {}
