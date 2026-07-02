package com.connectsphere.controller;

import com.connectsphere.dto.request.UpdateProfileRequest;
import com.connectsphere.dto.response.ApiResponse;
import com.connectsphere.dto.response.PageResponse;
import com.connectsphere.dto.response.UserProfileResponse;
import com.connectsphere.dto.response.UserSummaryResponse;
import com.connectsphere.entity.User;
import com.connectsphere.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Profile management and user search")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get the authenticated user's own profile")
    public ApiResponse<UserProfileResponse> getMyProfile(@AuthenticationPrincipal User currentUser) {
        return ApiResponse.success(userService.getProfile(currentUser.getId(), currentUser.getId()));
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get another user's public profile")
    public ApiResponse<UserProfileResponse> getProfile(@PathVariable Long userId, @AuthenticationPrincipal User currentUser) {
        return ApiResponse.success(userService.getProfile(userId, currentUser.getId()));
    }

    @PutMapping("/me")
    @Operation(summary = "Update the authenticated user's profile")
    public ApiResponse<UserProfileResponse> updateProfile(@AuthenticationPrincipal User currentUser,
                                                            @Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.success("Profile updated", userService.updateProfile(currentUser.getId(), request));
    }

    @PostMapping(value = "/me/profile-picture", consumes = "multipart/form-data")
    @Operation(summary = "Upload/replace the profile picture")
    public ApiResponse<String> uploadProfilePicture(@AuthenticationPrincipal User currentUser,
                                                      @RequestParam("file") MultipartFile file) {
        return ApiResponse.success("Profile picture updated", userService.uploadProfilePicture(currentUser.getId(), file));
    }

    @PostMapping(value = "/me/cover-photo", consumes = "multipart/form-data")
    @Operation(summary = "Upload/replace the cover photo")
    public ApiResponse<String> uploadCoverPhoto(@AuthenticationPrincipal User currentUser,
                                                 @RequestParam("file") MultipartFile file) {
        return ApiResponse.success("Cover photo updated", userService.uploadCoverPhoto(currentUser.getId(), file));
    }

    @GetMapping("/search")
    @Operation(summary = "Search users by username or full name")
    public ApiResponse<PageResponse<UserSummaryResponse>> search(@RequestParam String query,
                                                                   @RequestParam(defaultValue = "0") int page,
                                                                   @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(userService.searchUsers(query, page, size));
    }

    @GetMapping("/suggested")
    @Operation(summary = "Get suggested users to connect with")
    public ApiResponse<List<UserSummaryResponse>> suggested(@AuthenticationPrincipal User currentUser,
                                                              @RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.success(userService.getSuggestedUsers(currentUser.getId(), limit));
    }
}
