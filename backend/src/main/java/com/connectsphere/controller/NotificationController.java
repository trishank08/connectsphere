package com.connectsphere.controller;

import com.connectsphere.dto.response.ApiResponse;
import com.connectsphere.dto.response.NotificationResponse;
import com.connectsphere.dto.response.PageResponse;
import com.connectsphere.entity.User;
import com.connectsphere.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Real-time and historical notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get paginated notifications for the authenticated user")
    public ApiResponse<PageResponse<NotificationResponse>> list(@AuthenticationPrincipal User currentUser,
                                                                  @RequestParam(defaultValue = "0") int page,
                                                                  @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(notificationService.getNotifications(currentUser.getId(), page, size));
    }

    @PutMapping("/{notificationId}/read")
    @Operation(summary = "Mark a single notification as read")
    public ApiResponse<Void> markRead(@AuthenticationPrincipal User currentUser, @PathVariable Long notificationId) {
        notificationService.markAsRead(currentUser.getId(), notificationId);
        return ApiResponse.success("Notification marked as read", null);
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ApiResponse<Void> markAllRead(@AuthenticationPrincipal User currentUser) {
        notificationService.markAllAsRead(currentUser.getId());
        return ApiResponse.success("All notifications marked as read", null);
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get the unread notification count")
    public ApiResponse<Long> unreadCount(@AuthenticationPrincipal User currentUser) {
        return ApiResponse.success(notificationService.getUnreadCount(currentUser.getId()));
    }
}
