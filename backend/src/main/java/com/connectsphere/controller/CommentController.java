package com.connectsphere.controller;

import com.connectsphere.dto.request.CreateCommentRequest;
import com.connectsphere.dto.response.ApiResponse;
import com.connectsphere.dto.response.CommentResponse;
import com.connectsphere.entity.User;
import com.connectsphere.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
@Tag(name = "Comments", description = "Comments and threaded replies on posts")
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    @Operation(summary = "Add a comment or reply to a post")
    public ResponseEntity<ApiResponse<CommentResponse>> add(@AuthenticationPrincipal User currentUser,
                                                              @PathVariable Long postId,
                                                              @Valid @RequestBody CreateCommentRequest request) {
        CommentResponse response = commentService.addComment(currentUser.getId(), postId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Comment added", response));
    }

    @DeleteMapping("/{commentId}")
    @Operation(summary = "Delete a comment (author or post owner only)")
    public ApiResponse<Void> delete(@AuthenticationPrincipal User currentUser, @PathVariable Long postId,
                                     @PathVariable Long commentId) {
        commentService.deleteComment(currentUser.getId(), commentId);
        return ApiResponse.success("Comment deleted", null);
    }

    @GetMapping
    @Operation(summary = "Get all top-level comments (with nested replies) for a post")
    public ApiResponse<List<CommentResponse>> list(@PathVariable Long postId) {
        return ApiResponse.success(commentService.getCommentsForPost(postId));
    }
}
