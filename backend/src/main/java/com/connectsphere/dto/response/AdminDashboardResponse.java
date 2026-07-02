package com.connectsphere.dto.response;

public record AdminDashboardResponse(
        long totalUsers,
        long activeUsers,
        long totalPosts,
        long totalComments,
        long totalMessages,
        long pendingFriendRequests
) {}
