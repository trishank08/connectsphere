package com.connectsphere.service.impl;

import com.connectsphere.dto.response.NotificationResponse;
import com.connectsphere.dto.response.PageResponse;
import com.connectsphere.entity.Notification;
import com.connectsphere.entity.User;
import com.connectsphere.exception.ResourceNotFoundException;
import com.connectsphere.repository.NotificationRepository;
import com.connectsphere.repository.UserRepository;
import com.connectsphere.service.NotificationService;
import com.connectsphere.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public void createNotification(Long recipientId, Long actorId, Notification.NotificationType type, String message, Long referenceId) {
        User recipient = getUser(recipientId);
        User actor = actorId != null ? getUser(actorId) : null;

        Notification notification = Notification.builder()
                .recipient(recipient).actor(actor).type(type).message(message)
                .referenceId(referenceId).read(false)
                .build();
        notification = notificationRepository.save(notification);

        NotificationResponse response = toResponse(notification);
        // Real-time push over WebSocket to the recipient's private notification queue
        messagingTemplate.convertAndSendToUser(recipient.getEmail(), "/queue/notifications", response);
    }

    @Override
    public PageResponse<NotificationResponse> getNotifications(Long userId, int page, int size) {
        User user = getUser(userId);
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(user, pageable);
        return PageResponse.from(notifications.map(this::toResponse));
    }

    @Override
    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        if (!notification.getRecipient().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification", "id", notificationId);
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        User user = getUser(userId);
        Pageable pageable = PageRequest.of(0, 500);
        notificationRepository.findByRecipientOrderByCreatedAtDesc(user, pageable).getContent()
                .forEach(n -> { n.setRead(true); notificationRepository.save(n); });
    }

    @Override
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientAndReadFalse(getUser(userId));
    }

    private User getUser(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getType().name(), n.getActor() != null ? DtoMapper.toUserSummary(n.getActor()) : null,
                n.getMessage(), n.getReferenceId(), n.isRead(), n.getCreatedAt());
    }
}
