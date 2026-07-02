package com.connectsphere.repository;

import com.connectsphere.entity.FriendRequest;
import com.connectsphere.entity.FriendRequest.FriendRequestStatus;
import com.connectsphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {

    Optional<FriendRequest> findBySenderAndReceiverAndStatus(User sender, User receiver, FriendRequestStatus status);

    List<FriendRequest> findByReceiverAndStatus(User receiver, FriendRequestStatus status);

    List<FriendRequest> findBySenderAndStatus(User sender, FriendRequestStatus status);

    @Query("SELECT fr FROM FriendRequest fr WHERE fr.status = 'PENDING' AND " +
           "((fr.sender = :u1 AND fr.receiver = :u2) OR (fr.sender = :u2 AND fr.receiver = :u1))")
    Optional<FriendRequest> findPendingBetween(@Param("u1") User u1, @Param("u2") User u2);
}
