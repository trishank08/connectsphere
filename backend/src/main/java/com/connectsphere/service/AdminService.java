package com.connectsphere.service;

import com.connectsphere.dto.response.AdminDashboardResponse;
import com.connectsphere.dto.response.PageResponse;
import com.connectsphere.dto.response.UserSummaryResponse;

public interface AdminService {
    PageResponse<UserSummaryResponse> getAllUsers(int page, int size);
    void disableUser(Long userId);
    void enableUser(Long userId);
    void deleteUser(Long userId);
    void deletePost(Long postId);
    AdminDashboardResponse getDashboardStats();
}
