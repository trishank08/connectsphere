package com.connectsphere.service;

import com.connectsphere.dto.response.FriendRequestResponse;
import com.connectsphere.dto.response.UserSummaryResponse;

import java.util.List;

public interface FriendService {
    FriendRequestResponse sendRequest(Long senderId, Long receiverId);
    FriendRequestResponse acceptRequest(Long userId, Long requestId);
    void rejectRequest(Long userId, Long requestId);
    void cancelRequest(Long userId, Long requestId);
    void removeFriend(Long userId, Long friendId);
    List<FriendRequestResponse> getPendingRequests(Long userId);
    List<FriendRequestResponse> getSentRequests(Long userId);
    List<UserSummaryResponse> getFriends(Long userId);
    int getMutualFriendCount(Long userIdA, Long userIdB);
}
