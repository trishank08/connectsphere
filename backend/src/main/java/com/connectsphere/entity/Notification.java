package com.connectsphere.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    // The user who receives/sees this notification
    @ManyToOne
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    // The user who triggered the notification (nullable for system notifications)
    @ManyToOne
    @JoinColumn(name = "actor_id")
    private User actor;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Column(columnDefinition = "TEXT")
    private String message;

    // Optional reference id, e.g. postId, friendRequestId
    private Long referenceId;

    @Column(name = "is_read")
    @Builder.Default
    private boolean read = false;

    public enum NotificationType {
        FRIEND_REQUEST, FRIEND_REQUEST_ACCEPTED, POST_LIKE, POST_COMMENT, COMMENT_REPLY, NEW_MESSAGE, SYSTEM
    }
}
