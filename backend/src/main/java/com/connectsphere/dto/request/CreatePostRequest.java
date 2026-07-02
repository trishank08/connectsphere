package com.connectsphere.dto.request;

import jakarta.validation.constraints.Size;

public record CreatePostRequest(
        @Size(max = 5000, message = "Post content must not exceed 5000 characters")
        String content,
        String imageUrl,
        Long sharedPostId
) {}
