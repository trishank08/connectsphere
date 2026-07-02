package com.connectsphere.service;

import com.connectsphere.dto.response.MessageResponse;
import com.connectsphere.dto.response.PageResponse;

public interface MessageService {
    MessageResponse sendMessage(Long senderId, Long receiverId, String content);
    PageResponse<MessageResponse> getConversation(Long userId, Long otherUserId, int page, int size);
    void markAsRead(Long userId, Long otherUserId);
    long getUnreadCount(Long userId);
}
