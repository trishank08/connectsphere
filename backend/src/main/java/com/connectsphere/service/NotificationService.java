package com.connectsphere.service;

import com.connectsphere.entity.Notification;
import com.connectsphere.dto.response.NotificationResponse;
import com.connectsphere.dto.response.PageResponse;

public interface NotificationService {
    void createNotification(Long recipientId, Long actorId, Notification.NotificationType type, String message, Long referenceId);
    PageResponse<NotificationResponse> getNotifications(Long userId, int page, int size);
    void markAsRead(Long userId, Long notificationId);
    void markAllAsRead(Long userId);
    long getUnreadCount(Long userId);
}
