package com.connectsphere.controller;

import com.connectsphere.dto.request.SendMessageRequest;
import com.connectsphere.dto.response.ApiResponse;
import com.connectsphere.dto.response.MessageResponse;
import com.connectsphere.dto.response.PageResponse;
import com.connectsphere.entity.User;
import com.connectsphere.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Tag(name = "Messaging", description = "REST fallback for chat history; live delivery goes over WebSocket")
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    @Operation(summary = "Send a direct message (also pushed live over WebSocket)")
    public ResponseEntity<ApiResponse<MessageResponse>> send(@AuthenticationPrincipal User currentUser,
                                                               @Valid @RequestBody SendMessageRequest request) {
        MessageResponse response = messageService.sendMessage(currentUser.getId(), request.receiverId(), request.content());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/conversation/{otherUserId}")
    @Operation(summary = "Get paginated chat history with another user")
    public ApiResponse<PageResponse<MessageResponse>> conversation(@AuthenticationPrincipal User currentUser,
                                                                     @PathVariable Long otherUserId,
                                                                     @RequestParam(defaultValue = "0") int page,
                                                                     @RequestParam(defaultValue = "30") int size) {
        return ApiResponse.success(messageService.getConversation(currentUser.getId(), otherUserId, page, size));
    }

    @PutMapping("/conversation/{otherUserId}/read")
    @Operation(summary = "Mark all messages from another user as read")
    public ApiResponse<Void> markRead(@AuthenticationPrincipal User currentUser, @PathVariable Long otherUserId) {
        messageService.markAsRead(currentUser.getId(), otherUserId);
        return ApiResponse.success("Conversation marked as read", null);
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get the total unread message count for the authenticated user")
    public ApiResponse<Long> unreadCount(@AuthenticationPrincipal User currentUser) {
        return ApiResponse.success(messageService.getUnreadCount(currentUser.getId()));
    }
}
