package com.connectsphere.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateCommentRequest(
        @NotBlank(message = "Comment content cannot be empty") String content,
        Long parentCommentId
) {}
