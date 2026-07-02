package com.connectsphere.service.impl;

import com.connectsphere.dto.response.MessageResponse;
import com.connectsphere.dto.response.PageResponse;
import com.connectsphere.entity.Message;
import com.connectsphere.entity.Notification.NotificationType;
import com.connectsphere.entity.User;
import com.connectsphere.exception.ResourceNotFoundException;
import com.connectsphere.repository.MessageRepository;
import com.connectsphere.repository.UserRepository;
import com.connectsphere.service.MessageService;
import com.connectsphere.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public MessageResponse sendMessage(Long senderId, Long receiverId, String content) {
        User sender = getUser(senderId);
        User receiver = getUser(receiverId);

        Message message = Message.builder()
                .sender(sender).receiver(receiver).content(content)
                .status(Message.MessageStatus.SENT)
                .build();
        message = messageRepository.save(message);

        MessageResponse response = toResponse(message);

        // Push the message in real time to the receiver's private queue
        messagingTemplate.convertAndSendToUser(receiver.getEmail(), "/queue/messages", response);

        notificationService.createNotification(receiverId, senderId, NotificationType.NEW_MESSAGE,
                sender.getFullName() + " sent you a message", message.getId());

        return response;
    }

    @Override
    public PageResponse<MessageResponse> getConversation(Long userId, Long otherUserId, int page, int size) {
        User u1 = getUser(userId);
        User u2 = getUser(otherUserId);
        Pageable pageable = PageRequest.of(page, size);
        Page<Message> conversation = messageRepository.findConversation(u1, u2, pageable);
        return PageResponse.from(conversation.map(this::toResponse));
    }

    @Override
    @Transactional
    public void markAsRead(Long userId, Long otherUserId) {
        User u1 = getUser(userId);
        User u2 = getUser(otherUserId);
        Pageable pageable = PageRequest.of(0, 200);
        messageRepository.findConversation(u1, u2, pageable).getContent().stream()
                .filter(m -> m.getReceiver().getId().equals(userId) && m.getStatus() != Message.MessageStatus.READ)
                .forEach(m -> {
                    m.setStatus(Message.MessageStatus.READ);
                    messageRepository.save(m);
                });
    }

    @Override
    public long getUnreadCount(Long userId) {
        User user = getUser(userId);
        return messageRepository.countByReceiverAndStatusNot(user, Message.MessageStatus.READ);
    }

    private User getUser(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private MessageResponse toResponse(Message m) {
        return new MessageResponse(m.getId(), m.getSender().getId(), m.getReceiver().getId(),
                m.getContent(), m.getStatus().name(), m.getCreatedAt());
    }
}
