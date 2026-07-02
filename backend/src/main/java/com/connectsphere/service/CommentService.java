package com.connectsphere.service;

import com.connectsphere.dto.request.CreateCommentRequest;
import com.connectsphere.dto.response.CommentResponse;

import java.util.List;

public interface CommentService {
    CommentResponse addComment(Long userId, Long postId, CreateCommentRequest request);
    void deleteComment(Long userId, Long commentId);
    List<CommentResponse> getCommentsForPost(Long postId);
}
