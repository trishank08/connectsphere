package com.connectsphere.controller;

import com.connectsphere.dto.response.AdminDashboardResponse;
import com.connectsphere.dto.response.ApiResponse;
import com.connectsphere.dto.response.PageResponse;
import com.connectsphere.dto.response.UserSummaryResponse;
import com.connectsphere.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin-only user management, moderation and analytics (ROLE_ADMIN required)")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    @Operation(summary = "List all users (paginated)")
    public ApiResponse<PageResponse<UserSummaryResponse>> allUsers(@RequestParam(defaultValue = "0") int page,
                                                                     @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(adminService.getAllUsers(page, size));
    }

    @PutMapping("/users/{userId}/disable")
    @Operation(summary = "Disable a suspicious or violating account")
    public ApiResponse<Void> disable(@PathVariable Long userId) {
        adminService.disableUser(userId);
        return ApiResponse.success("User disabled", null);
    }

    @PutMapping("/users/{userId}/enable")
    @Operation(summary = "Re-enable a previously disabled account")
    public ApiResponse<Void> enable(@PathVariable Long userId) {
        adminService.enableUser(userId);
        return ApiResponse.success("User enabled", null);
    }

    @DeleteMapping("/users/{userId}")
    @Operation(summary = "Permanently delete a user account")
    public ApiResponse<Void> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ApiResponse.success("User deleted", null);
    }

    @DeleteMapping("/posts/{postId}")
    @Operation(summary = "Remove a post that violates platform policy")
    public ApiResponse<Void> deletePost(@PathVariable Long postId) {
        adminService.deletePost(postId);
        return ApiResponse.success("Post removed", null);
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get aggregate platform analytics")
    public ApiResponse<AdminDashboardResponse> dashboard() {
        return ApiResponse.success(adminService.getDashboardStats());
    }
}
