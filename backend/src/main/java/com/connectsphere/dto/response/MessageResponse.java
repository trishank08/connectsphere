package com.connectsphere.dto.response;

import java.time.LocalDateTime;

public record MessageResponse(
        Long id,
        Long senderId,
        Long receiverId,
        String content,
        String status,
        LocalDateTime createdAt
) {}
