package com.connectsphere.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record CommentResponse(
        Long id,
        Long postId,
        UserSummaryResponse author,
        String content,
        Long parentCommentId,
        List<CommentResponse> replies,
        LocalDateTime createdAt
) {}
