package com.connectsphere.service;

import com.connectsphere.dto.request.UpdateProfileRequest;
import com.connectsphere.dto.response.PageResponse;
import com.connectsphere.dto.response.UserProfileResponse;
import com.connectsphere.dto.response.UserSummaryResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    UserProfileResponse getProfile(Long targetUserId, Long currentUserId);
    UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request);
    String uploadProfilePicture(Long userId, MultipartFile file);
    String uploadCoverPhoto(Long userId, MultipartFile file);
    PageResponse<UserSummaryResponse> searchUsers(String query, int page, int size);
    List<UserSummaryResponse> getSuggestedUsers(Long userId, int limit);
}
