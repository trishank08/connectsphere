package com.connectsphere.repository;

import com.connectsphere.entity.Message;
import com.connectsphere.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE (m.sender = :u1 AND m.receiver = :u2) OR " +
           "(m.sender = :u2 AND m.receiver = :u1) ORDER BY m.createdAt DESC")
    Page<Message> findConversation(@Param("u1") User u1, @Param("u2") User u2, Pageable pageable);

    long countByReceiverAndStatusNot(User receiver, Message.MessageStatus status);
}
