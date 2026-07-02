package com.connectsphere.service.impl;

import com.connectsphere.dto.request.UpdateProfileRequest;
import com.connectsphere.dto.response.PageResponse;
import com.connectsphere.dto.response.UserProfileResponse;
import com.connectsphere.dto.response.UserSummaryResponse;
import com.connectsphere.entity.FriendRequest;
import com.connectsphere.entity.Post;
import com.connectsphere.entity.User;
import com.connectsphere.exception.ResourceNotFoundException;
import com.connectsphere.repository.FriendRequestRepository;
import com.connectsphere.repository.FriendshipRepository;
import com.connectsphere.repository.PostRepository;
import com.connectsphere.repository.UserRepository;
import com.connectsphere.service.FileStorageService;
import com.connectsphere.service.UserService;
import com.connectsphere.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final PostRepository postRepository;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long targetUserId, Long currentUserId) {
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", targetUserId));

        long friendCount = friendshipRepository.countFriends(targetUserId);
        long postCount = postRepository.findByAuthorOrderByCreatedAtDesc(target, PageRequest.of(0, 1)).getTotalElements();

        String friendshipStatus = "NONE";
        if (!targetUserId.equals(currentUserId)) {
            User current = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

            boolean areFriends = friendshipRepository.findByPair(minUser(current, target), maxUser(current, target)).isPresent();
            if (areFriends) {
                friendshipStatus = "FRIENDS";
            } else {
                var pending = friendRequestRepository.findPendingBetween(current, target);
                if (pending.isPresent()) {
                    FriendRequest fr = pending.get();
                    friendshipStatus = fr.getSender().getId().equals(currentUserId) ? "REQUEST_SENT" : "REQUEST_RECEIVED";
                }
            }
        }

        return new UserProfileResponse(
                target.getId(), target.getUsername(), target.getFullName(), target.getEmail(),
                target.getBio(), target.getLocation(), target.getProfilePictureUrl(), target.getCoverPhotoUrl(),
                new java.util.HashSet<>(target.getSkills()), new java.util.HashSet<>(target.getInterests()), friendCount, postCount,
                target.isOnline(), target.getLastSeen(), friendshipStatus);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.fullName() != null && !request.fullName().isBlank()) user.setFullName(request.fullName());
        if (request.bio() != null) user.setBio(request.bio());
        if (request.location() != null) user.setLocation(request.location());
        if (request.skills() != null) user.setSkills(request.skills());
        if (request.interests() != null) user.setInterests(request.interests());

        userRepository.save(user);
        return getProfile(userId, userId);
    }

    @Override
    @Transactional
    public String uploadProfilePicture(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        String url = fileStorageService.store(file, "profile-pictures");
        user.setProfilePictureUrl(url);
        userRepository.save(user);
        return url;
    }

    @Override
    @Transactional
    public String uploadCoverPhoto(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        String url = fileStorageService.store(file, "cover-photos");
        user.setCoverPhotoUrl(url);
        userRepository.save(user);
        return url;
    }

    @Override
    public PageResponse<UserSummaryResponse> searchUsers(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> results = userRepository.searchUsers(query, pageable);
        return PageResponse.from(results.map(DtoMapper::toUserSummary));
    }

    @Override
    public List<UserSummaryResponse> getSuggestedUsers(Long userId, int limit) {
        return userRepository.findSuggestedUsers(userId).stream()
                .limit(limit)
                .map(DtoMapper::toUserSummary)
                .collect(Collectors.toList());
    }

    private User minUser(User a, User b) {
        return a.getId() < b.getId() ? a : b;
    }

    private User maxUser(User a, User b) {
        return a.getId() < b.getId() ? b : a;
    }
}
