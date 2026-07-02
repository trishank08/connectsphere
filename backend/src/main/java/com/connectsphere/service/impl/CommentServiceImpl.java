package com.connectsphere.service.impl;

import com.connectsphere.dto.request.CreateCommentRequest;
import com.connectsphere.dto.response.CommentResponse;
import com.connectsphere.entity.Comment;
import com.connectsphere.entity.Notification.NotificationType;
import com.connectsphere.entity.Post;
import com.connectsphere.entity.User;
import com.connectsphere.exception.ResourceNotFoundException;
import com.connectsphere.exception.UnauthorizedActionException;
import com.connectsphere.repository.CommentRepository;
import com.connectsphere.repository.PostRepository;
import com.connectsphere.repository.UserRepository;
import com.connectsphere.service.CommentService;
import com.connectsphere.service.NotificationService;
import com.connectsphere.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public CommentResponse addComment(Long userId, Long postId, CreateCommentRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Comment.CommentBuilder builder = Comment.builder().post(post).author(author).content(request.content());

        Comment parent = null;
        if (request.parentCommentId() != null) {
            parent = commentRepository.findById(request.parentCommentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", request.parentCommentId()));
            builder.parentComment(parent);
        }

        Comment saved = commentRepository.save(builder.build());

        if (parent != null) {
            if (!parent.getAuthor().getId().equals(userId)) {
                notificationService.createNotification(parent.getAuthor().getId(), userId, NotificationType.COMMENT_REPLY,
                        author.getFullName() + " replied to your comment", post.getId());
            }
        } else if (!post.getAuthor().getId().equals(userId)) {
            notificationService.createNotification(post.getAuthor().getId(), userId, NotificationType.POST_COMMENT,
                    author.getFullName() + " commented on your post", post.getId());
        }

        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteComment(Long userId, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        boolean isAuthor = comment.getAuthor().getId().equals(userId);
        boolean isPostOwner = comment.getPost().getAuthor().getId().equals(userId);
        if (!isAuthor && !isPostOwner) {
            throw new UnauthorizedActionException("You are not authorized to delete this comment");
        }
        commentRepository.delete(comment);
    }

    @Override
    public List<CommentResponse> getCommentsForPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        return commentRepository.findByPostAndParentCommentIsNullOrderByCreatedAtAsc(post)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private CommentResponse toResponse(Comment comment) {
        List<CommentResponse> replies = commentRepository.findByParentCommentOrderByCreatedAtAsc(comment)
                .stream().map(this::toResponse).collect(Collectors.toList());

        return new CommentResponse(
                comment.getId(), comment.getPost().getId(), DtoMapper.toUserSummary(comment.getAuthor()),
                comment.getContent(),
                comment.getParentComment() != null ? comment.getParentComment().getId() : null,
                replies, comment.getCreatedAt());
    }
}
