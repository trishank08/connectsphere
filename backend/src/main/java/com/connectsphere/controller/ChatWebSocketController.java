package com.connectsphere.controller;

import com.connectsphere.dto.response.MessageResponse;
import com.connectsphere.entity.User;
import com.connectsphere.repository.UserRepository;
import com.connectsphere.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

/**
 * STOMP message handlers for real-time chat.
 *
 * Client flow:
 *  - CONNECT to /ws (SockJS) with the JWT passed as a STOMP CONNECT header
 *    (validated by WebSocketAuthInterceptor, which sets the STOMP Principal
 *    to the user's email so convertAndSendToUser(email, ...) works)
 *  - SUBSCRIBE /user/queue/messages       -> incoming chat messages
 *  - SUBSCRIBE /user/queue/notifications  -> incoming notifications
 *  - SUBSCRIBE /user/queue/typing         -> typing indicator from a peer
 *  - SEND to /app/chat.send               -> deliver a message
 *  - SEND to /app/chat.typing             -> broadcast a typing indicator
 */
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    public record ChatSendPayload(Long receiverId, String content) {}

    @MessageMapping("/chat.send")
    public void send(ChatSendPayload payload, Principal principal) {
        User sender = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated WebSocket user not found"));

        MessageResponse response = messageService.sendMessage(sender.getId(), payload.receiverId(), payload.content());
        // Echo back to the sender's own queue too, so multi-device sessions stay in sync
        messagingTemplate.convertAndSendToUser(principal.getName(), "/queue/messages", response);
    }

    @MessageMapping("/chat.typing")
    public void typing(Map<String, Object> payload) {
        // payload: { "receiverEmail": "...", "senderEmail": "...", "typing": true|false }
        String receiverEmail = String.valueOf(payload.get("receiverEmail"));
        Map<String, Object> event = Map.of(
                "fromEmail", String.valueOf(payload.get("senderEmail")),
                "typing", payload.getOrDefault("typing", false));
        messagingTemplate.convertAndSendToUser(receiverEmail, "/queue/typing", event);
    }
}
