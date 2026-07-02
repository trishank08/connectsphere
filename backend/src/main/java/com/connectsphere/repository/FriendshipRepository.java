package com.connectsphere.repository;

import com.connectsphere.entity.Friendship;
import com.connectsphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    @Query("SELECT f FROM Friendship f WHERE f.userOne = :u1 AND f.userTwo = :u2")
    Optional<Friendship> findByPair(@Param("u1") User u1, @Param("u2") User u2);

    @Query("SELECT f FROM Friendship f WHERE f.userOne.id = :userId OR f.userTwo.id = :userId")
    List<Friendship> findAllForUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(f) FROM Friendship f WHERE f.userOne.id = :userId OR f.userTwo.id = :userId")
    long countFriends(@Param("userId") Long userId);

    void deleteByUserOneAndUserTwo(User userOne, User userTwo);
}
