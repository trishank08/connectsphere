package com.connectsphere.service.impl;

import com.connectsphere.dto.response.FriendRequestResponse;
import com.connectsphere.dto.response.UserSummaryResponse;
import com.connectsphere.entity.FriendRequest;
import com.connectsphere.entity.FriendRequest.FriendRequestStatus;
import com.connectsphere.entity.Friendship;
import com.connectsphere.entity.Notification.NotificationType;
import com.connectsphere.entity.User;
import com.connectsphere.exception.DuplicateResourceException;
import com.connectsphere.exception.InvalidRequestException;
import com.connectsphere.exception.ResourceNotFoundException;
import com.connectsphere.exception.UnauthorizedActionException;
import com.connectsphere.repository.FriendRequestRepository;
import com.connectsphere.repository.FriendshipRepository;
import com.connectsphere.repository.UserRepository;
import com.connectsphere.service.FriendService;
import com.connectsphere.service.NotificationService;
import com.connectsphere.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendServiceImpl implements FriendService {

    private final FriendRequestRepository friendRequestRepository;
    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public FriendRequestResponse sendRequest(Long senderId, Long receiverId) {
        if (senderId.equals(receiverId)) {
            throw new InvalidRequestException("You cannot send a friend request to yourself");
        }
        User sender = getUser(senderId);
        User receiver = getUser(receiverId);

        if (areFriends(sender, receiver)) {
            throw new DuplicateResourceException("You are already friends with this user");
        }
        if (friendRequestRepository.findPendingBetween(sender, receiver).isPresent()) {
            throw new DuplicateResourceException("A pending friend request already exists between these users");
        }

        FriendRequest request = friendRequestRepository.save(
                FriendRequest.builder().sender(sender).receiver(receiver).status(FriendRequestStatus.PENDING).build());

        notificationService.createNotification(receiverId, senderId, NotificationType.FRIEND_REQUEST,
                sender.getFullName() + " sent you a friend request", request.getId());

        return toResponse(request);
    }

    @Override
    @Transactional
    public FriendRequestResponse acceptRequest(Long userId, Long requestId) {
        FriendRequest request = getRequest(requestId);
        if (!request.getReceiver().getId().equals(userId)) {
            throw new UnauthorizedActionException("You are not authorized to respond to this request");
        }
        request.setStatus(FriendRequestStatus.ACCEPTED);
        friendRequestRepository.save(request);

        User a = request.getSender();
        User b = request.getReceiver();
        Friendship friendship = Friendship.builder()
                .userOne(a.getId() < b.getId() ? a : b)
                .userTwo(a.getId() < b.getId() ? b : a)
                .build();
        friendshipRepository.save(friendship);

        notificationService.createNotification(a.getId(), b.getId(), NotificationType.FRIEND_REQUEST_ACCEPTED,
                b.getFullName() + " accepted your friend request", request.getId());

        return toResponse(request);
    }

    @Override
    @Transactional
    public void rejectRequest(Long userId, Long requestId) {
        FriendRequest request = getRequest(requestId);
        if (!request.getReceiver().getId().equals(userId)) {
            throw new UnauthorizedActionException("You are not authorized to respond to this request");
        }
        request.setStatus(FriendRequestStatus.REJECTED);
        friendRequestRepository.save(request);
    }

    @Override
    @Transactional
    public void cancelRequest(Long userId, Long requestId) {
        FriendRequest request = getRequest(requestId);
        if (!request.getSender().getId().equals(userId)) {
            throw new UnauthorizedActionException("You are not authorized to cancel this request");
        }
        friendRequestRepository.delete(request);
    }

    @Override
    @Transactional
    public void removeFriend(Long userId, Long friendId) {
        User u1 = getUser(userId);
        User u2 = getUser(friendId);
        User min = u1.getId() < u2.getId() ? u1 : u2;
        User max = u1.getId() < u2.getId() ? u2 : u1;
        friendshipRepository.findByPair(min, max)
                .orElseThrow(() -> new ResourceNotFoundException("Friendship not found between these users"));
        friendshipRepository.deleteByUserOneAndUserTwo(min, max);
    }

    @Override
    public List<FriendRequestResponse> getPendingRequests(Long userId) {
        User user = getUser(userId);
        return friendRequestRepository.findByReceiverAndStatus(user, FriendRequestStatus.PENDING)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<FriendRequestResponse> getSentRequests(Long userId) {
        User user = getUser(userId);
        return friendRequestRepository.findBySenderAndStatus(user, FriendRequestStatus.PENDING)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<UserSummaryResponse> getFriends(Long userId) {
        return friendshipRepository.findAllForUser(userId).stream()
                .map(f -> f.getUserOne().getId().equals(userId) ? f.getUserTwo() : f.getUserOne())
                .map(DtoMapper::toUserSummary)
                .collect(Collectors.toList());
    }

    @Override
    public int getMutualFriendCount(Long userIdA, Long userIdB) {
        Set<Long> friendsA = friendshipRepository.findAllForUser(userIdA).stream()
                .map(f -> f.getUserOne().getId().equals(userIdA) ? f.getUserTwo().getId() : f.getUserOne().getId())
                .collect(Collectors.toCollection(HashSet::new));
        Set<Long> friendsB = friendshipRepository.findAllForUser(userIdB).stream()
                .map(f -> f.getUserOne().getId().equals(userIdB) ? f.getUserTwo().getId() : f.getUserOne().getId())
                .collect(Collectors.toSet());
        friendsA.retainAll(friendsB);
        return friendsA.size();
    }

    private boolean areFriends(User a, User b) {
        User min = a.getId() < b.getId() ? a : b;
        User max = a.getId() < b.getId() ? b : a;
        return friendshipRepository.findByPair(min, max).isPresent();
    }

    private User getUser(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private FriendRequest getRequest(Long id) {
        return friendRequestRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Friend request", "id", id));
    }

    private FriendRequestResponse toResponse(FriendRequest request) {
        int mutual = getMutualFriendCount(request.getSender().getId(), request.getReceiver().getId());
        return new FriendRequestResponse(
                request.getId(),
                DtoMapper.toUserSummary(request.getSender()),
                DtoMapper.toUserSummary(request.getReceiver()),
                request.getStatus().name(),
                mutual,
                request.getCreatedAt());
    }
}
