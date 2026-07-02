package com.connectsphere.service.impl;

import com.connectsphere.dto.response.AdminDashboardResponse;
import com.connectsphere.dto.response.PageResponse;
import com.connectsphere.dto.response.UserSummaryResponse;
import com.connectsphere.entity.FriendRequest.FriendRequestStatus;
import com.connectsphere.entity.Post;
import com.connectsphere.entity.User;
import com.connectsphere.exception.ResourceNotFoundException;
import com.connectsphere.repository.*;
import com.connectsphere.service.AdminService;
import com.connectsphere.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final MessageRepository messageRepository;
    private final FriendRequestRepository friendRequestRepository;

    @Override
    public PageResponse<UserSummaryResponse> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return PageResponse.from(userRepository.findAll(pageable).map(DtoMapper::toUserSummary));
    }

    @Override
    @Transactional
    public void disableUser(Long userId) {
        User user = getUser(userId);
        user.setEnabled(false);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void enableUser(Long userId) {
        User user = getUser(userId);
        user.setEnabled(true);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = getUser(userId);
        userRepository.delete(user);
    }

    @Override
    @Transactional
    public void deletePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        postRepository.delete(post);
    }

    @Override
    public AdminDashboardResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByEnabledTrue();
        long totalPosts = postRepository.count();
        long totalComments = commentRepository.count();
        long totalMessages = messageRepository.count();
        long pendingRequests = friendRequestRepository.findAll().stream()
                .filter(fr -> fr.getStatus() == FriendRequestStatus.PENDING).count();

        return new AdminDashboardResponse(totalUsers, activeUsers, totalPosts, totalComments, totalMessages, pendingRequests);
    }

    private User getUser(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }
}
