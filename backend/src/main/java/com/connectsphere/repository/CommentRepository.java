package com.connectsphere.repository;

import com.connectsphere.entity.Comment;
import com.connectsphere.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostAndParentCommentIsNullOrderByCreatedAtAsc(Post post);
    List<Comment> findByParentCommentOrderByCreatedAtAsc(Comment parentComment);
    long countByPost(Post post);
}
