package com.connectsphere.repository;

import com.connectsphere.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<User> searchUsers(@Param("query") String query, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.id <> :userId AND u.id NOT IN " +
           "(SELECT f.userTwo.id FROM Friendship f WHERE f.userOne.id = :userId) AND u.id NOT IN " +
           "(SELECT f.userOne.id FROM Friendship f WHERE f.userTwo.id = :userId)")
    List<User> findSuggestedUsers(@Param("userId") Long userId);

    long countByEnabledTrue();

    Optional<User> findByPasswordResetToken(String token);
}
