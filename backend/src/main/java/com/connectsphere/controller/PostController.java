package com.connectsphere.controller;

import com.connectsphere.dto.request.CreatePostRequest;
import com.connectsphere.dto.request.UpdatePostRequest;
import com.connectsphere.dto.response.ApiResponse;
import com.connectsphere.dto.response.PageResponse;
import com.connectsphere.dto.response.PostResponse;
import com.connectsphere.entity.User;
import com.connectsphere.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Tag(name = "Posts", description = "News feed, timelines, likes and sharing")
public class PostController {

    private final PostService postService;

    @PostMapping
    @Operation(summary = "Create a new post")
    public ResponseEntity<ApiResponse<PostResponse>> create(@AuthenticationPrincipal User currentUser,
                                                              @Valid @RequestBody CreatePostRequest request) {
        PostResponse response = postService.createPost(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Post created", response));
    }

    @PutMapping("/{postId}")
    @Operation(summary = "Edit an existing post")
    public ApiResponse<PostResponse> update(@AuthenticationPrincipal User currentUser, @PathVariable Long postId,
                                             @Valid @RequestBody UpdatePostRequest request) {
        return ApiResponse.success("Post updated", postService.updatePost(currentUser.getId(), postId, request));
    }

    @DeleteMapping("/{postId}")
    @Operation(summary = "Delete a post")
    public ApiResponse<Void> delete(@AuthenticationPrincipal User currentUser, @PathVariable Long postId) {
        postService.deletePost(currentUser.getId(), postId);
        return ApiResponse.success("Post deleted", null);
    }

    @GetMapping("/{postId}")
    @Operation(summary = "Get a single post by id")
    public ApiResponse<PostResponse> getOne(@AuthenticationPrincipal User currentUser, @PathVariable Long postId) {
        return ApiResponse.success(postService.getPost(postId, currentUser.getId()));
    }

    @GetMapping("/feed")
    @Operation(summary = "Get the authenticated user's home feed (own + friends' posts, paginated)")
    public ApiResponse<PageResponse<PostResponse>> feed(@AuthenticationPrincipal User currentUser,
                                                          @RequestParam(defaultValue = "0") int page,
                                                          @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(postService.getFeed(currentUser.getId(), page, size));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get a user's timeline (all of their posts, paginated)")
    public ApiResponse<PageResponse<PostResponse>> timeline(@AuthenticationPrincipal User currentUser, @PathVariable Long userId,
                                                              @RequestParam(defaultValue = "0") int page,
                                                              @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(postService.getUserTimeline(userId, currentUser.getId(), page, size));
    }

    @PostMapping("/{postId}/like")
    @Operation(summary = "Like a post")
    public ApiResponse<PostResponse> like(@AuthenticationPrincipal User currentUser, @PathVariable Long postId) {
        return ApiResponse.success(postService.likePost(currentUser.getId(), postId));
    }

    @DeleteMapping("/{postId}/like")
    @Operation(summary = "Unlike a post")
    public ApiResponse<Void> unlike(@AuthenticationPrincipal User currentUser, @PathVariable Long postId) {
        postService.unlikePost(currentUser.getId(), postId);
        return ApiResponse.success("Post unliked", null);
    }

    @PostMapping("/{postId}/share")
    @Operation(summary = "Share/repost an existing post")
    public ApiResponse<PostResponse> share(@AuthenticationPrincipal User currentUser, @PathVariable Long postId,
                                            @RequestParam(required = false, defaultValue = "") String comment) {
        return ApiResponse.success("Post shared", postService.sharePost(currentUser.getId(), postId, comment));
    }

    @PostMapping(value = "/upload-image", consumes = "multipart/form-data")
    @Operation(summary = "Upload an image to attach to a post")
    public ApiResponse<String> uploadImage(@AuthenticationPrincipal User currentUser, @RequestParam("file") MultipartFile file) {
        return ApiResponse.success(postService.uploadPostImage(currentUser.getId(), file));
    }
}
