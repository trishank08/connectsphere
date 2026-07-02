package com.connectsphere.controller;

import com.connectsphere.dto.response.ApiResponse;
import com.connectsphere.dto.response.FriendRequestResponse;
import com.connectsphere.dto.response.UserSummaryResponse;
import com.connectsphere.entity.User;
import com.connectsphere.service.FriendService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
@Tag(name = "Friend Network", description = "Friend requests, friendships and mutual connections")
public class FriendController {

    private final FriendService friendService;

    @PostMapping("/requests/{receiverId}")
    @Operation(summary = "Send a friend request")
    public ApiResponse<FriendRequestResponse> sendRequest(@AuthenticationPrincipal User currentUser, @PathVariable Long receiverId) {
        return ApiResponse.success("Friend request sent", friendService.sendRequest(currentUser.getId(), receiverId));
    }

    @PutMapping("/requests/{requestId}/accept")
    @Operation(summary = "Accept a pending friend request")
    public ApiResponse<FriendRequestResponse> accept(@AuthenticationPrincipal User currentUser, @PathVariable Long requestId) {
        return ApiResponse.success("Friend request accepted", friendService.acceptRequest(currentUser.getId(), requestId));
    }

    @PutMapping("/requests/{requestId}/reject")
    @Operation(summary = "Reject a pending friend request")
    public ApiResponse<Void> reject(@AuthenticationPrincipal User currentUser, @PathVariable Long requestId) {
        friendService.rejectRequest(currentUser.getId(), requestId);
        return ApiResponse.success("Friend request rejected", null);
    }

    @DeleteMapping("/requests/{requestId}")
    @Operation(summary = "Cancel a friend request you previously sent")
    public ApiResponse<Void> cancel(@AuthenticationPrincipal User currentUser, @PathVariable Long requestId) {
        friendService.cancelRequest(currentUser.getId(), requestId);
        return ApiResponse.success("Friend request cancelled", null);
    }

    @DeleteMapping("/{friendId}")
    @Operation(summary = "Remove an existing friend")
    public ApiResponse<Void> removeFriend(@AuthenticationPrincipal User currentUser, @PathVariable Long friendId) {
        friendService.removeFriend(currentUser.getId(), friendId);
        return ApiResponse.success("Friend removed", null);
    }

    @GetMapping("/requests/pending")
    @Operation(summary = "List friend requests received and awaiting a response")
    public ApiResponse<List<FriendRequestResponse>> pending(@AuthenticationPrincipal User currentUser) {
        return ApiResponse.success(friendService.getPendingRequests(currentUser.getId()));
    }

    @GetMapping("/requests/sent")
    @Operation(summary = "List friend requests you have sent that are still pending")
    public ApiResponse<List<FriendRequestResponse>> sent(@AuthenticationPrincipal User currentUser) {
        return ApiResponse.success(friendService.getSentRequests(currentUser.getId()));
    }

    @GetMapping
    @Operation(summary = "List the authenticated user's friends")
    public ApiResponse<List<UserSummaryResponse>> myFriends(@AuthenticationPrincipal User currentUser) {
        return ApiResponse.success(friendService.getFriends(currentUser.getId()));
    }

    @GetMapping("/mutual/{otherUserId}")
    @Operation(summary = "Get the mutual friend count with another user")
    public ApiResponse<Integer> mutualCount(@AuthenticationPrincipal User currentUser, @PathVariable Long otherUserId) {
        return ApiResponse.success(friendService.getMutualFriendCount(currentUser.getId(), otherUserId));
    }
}
