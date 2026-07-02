package com.connectsphere.service;

import com.connectsphere.dto.request.CreatePostRequest;
import com.connectsphere.dto.request.UpdatePostRequest;
import com.connectsphere.dto.response.PageResponse;
import com.connectsphere.dto.response.PostResponse;
import org.springframework.web.multipart.MultipartFile;

public interface PostService {
    PostResponse createPost(Long userId, CreatePostRequest request);
    PostResponse updatePost(Long userId, Long postId, UpdatePostRequest request);
    void deletePost(Long userId, Long postId);
    PostResponse getPost(Long postId, Long currentUserId);
    PageResponse<PostResponse> getFeed(Long userId, int page, int size);
    PageResponse<PostResponse> getUserTimeline(Long targetUserId, Long currentUserId, int page, int size);
    PostResponse likePost(Long userId, Long postId);
    void unlikePost(Long userId, Long postId);
    PostResponse sharePost(Long userId, Long postId, String commentText);
    String uploadPostImage(Long userId, MultipartFile file);
}
