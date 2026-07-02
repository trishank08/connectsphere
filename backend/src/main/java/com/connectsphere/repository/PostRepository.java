package com.connectsphere.repository;

import com.connectsphere.entity.Post;
import com.connectsphere.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByAuthorOrderByCreatedAtDesc(User author, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.author.id IN :userIds ORDER BY p.createdAt DESC")
    Page<Post> findFeedForUsers(@Param("userIds") List<Long> userIds, Pageable pageable);

    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
