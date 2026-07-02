package com.connectsphere.service.impl;

import com.connectsphere.dto.request.CreatePostRequest;
import com.connectsphere.dto.request.UpdatePostRequest;
import com.connectsphere.dto.response.PageResponse;
import com.connectsphere.dto.response.PostResponse;
import com.connectsphere.entity.Notification.NotificationType;
import com.connectsphere.entity.Post;
import com.connectsphere.entity.PostLike;
import com.connectsphere.entity.User;
import com.connectsphere.exception.ResourceNotFoundException;
import com.connectsphere.exception.UnauthorizedActionException;
import com.connectsphere.repository.CommentRepository;
import com.connectsphere.repository.FriendshipRepository;
import com.connectsphere.repository.PostLikeRepository;
import com.connectsphere.repository.PostRepository;
import com.connectsphere.repository.UserRepository;
import com.connectsphere.service.FileStorageService;
import com.connectsphere.service.NotificationService;
import com.connectsphere.service.PostService;
import com.connectsphere.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public PostResponse createPost(Long userId, CreatePostRequest request) {
        User author = getUser(userId);
        Post.PostBuilder builder = Post.builder().author(author).content(request.content()).imageUrl(request.imageUrl());

        if (request.sharedPostId() != null) {
            Post shared = postRepository.findById(request.sharedPostId())
                    .orElseThrow(() -> new ResourceNotFoundException("Post", "id", request.sharedPostId()));
            builder.sharedPost(shared);
        }
        Post saved = postRepository.save(builder.build());
        return toResponse(saved, userId);
    }

    @Override
    @Transactional
    public PostResponse updatePost(Long userId, Long postId, UpdatePostRequest request) {
        Post post = getPost(postId);
        assertOwner(post, userId);
        post.setContent(request.content());
        if (request.imageUrl() != null) post.setImageUrl(request.imageUrl());
        return toResponse(postRepository.save(post), userId);
    }

    @Override
    @Transactional
    public void deletePost(Long userId, Long postId) {
        Post post = getPost(postId);
        assertOwner(post, userId);
        postRepository.delete(post);
    }

    @Override
    @Transactional(readOnly = true)
    public PostResponse getPost(Long postId, Long currentUserId) {
        return toResponse(getPost(postId), currentUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PostResponse> getFeed(Long userId, int page, int size) {
        List<Long> friendIds = friendshipRepository.findAllForUser(userId).stream()
                .map(f -> f.getUserOne().getId().equals(userId) ? f.getUserTwo().getId() : f.getUserOne().getId())
                .collect(Collectors.toList());
        friendIds.add(userId);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Post> posts = postRepository.findFeedForUsers(friendIds, pageable);
        return PageResponse.from(posts.map(p -> toResponse(p, userId)));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PostResponse> getUserTimeline(Long targetUserId, Long currentUserId, int page, int size) {
        User target = getUser(targetUserId);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Post> posts = postRepository.findByAuthorOrderByCreatedAtDesc(target, pageable);
        return PageResponse.from(posts.map(p -> toResponse(p, currentUserId)));
    }

    @Override
    @Transactional
    public PostResponse likePost(Long userId, Long postId) {
        Post post = getPost(postId);
        User user = getUser(userId);

        if (!postLikeRepository.existsByPostAndUser(post, user)) {
            postLikeRepository.save(PostLike.builder().post(post).user(user).build());
            if (!post.getAuthor().getId().equals(userId)) {
                notificationService.createNotification(post.getAuthor().getId(), userId, NotificationType.POST_LIKE,
                        user.getFullName() + " liked your post", post.getId());
            }
        }
        return toResponse(post, userId);
    }

    @Override
    @Transactional
    public void unlikePost(Long userId, Long postId) {
        Post post = getPost(postId);
        User user = getUser(userId);
        postLikeRepository.deleteByPostAndUser(post, user);
    }

    @Override
    @Transactional
    public PostResponse sharePost(Long userId, Long postId, String commentText) {
        Post original = getPost(postId);
        User user = getUser(userId);
        Post shared = Post.builder().author(user).content(commentText).sharedPost(original).build();
        return toResponse(postRepository.save(shared), userId);
    }

    @Override
    public String uploadPostImage(Long userId, MultipartFile file) {
        return fileStorageService.store(file, "posts");
    }

    private Post getPost(Long id) {
        return postRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Post", "id", id));
    }

    private User getUser(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private void assertOwner(Post post, Long userId) {
        if (!post.getAuthor().getId().equals(userId)) {
            throw new UnauthorizedActionException("You can only modify your own posts");
        }
    }

    private PostResponse toResponse(Post post, Long currentUserId) {
        long likeCount = postLikeRepository.countByPost(post);
        long commentCount = commentRepository.countByPost(post);
        boolean liked = currentUserId != null && postLikeRepository.existsByPostAndUser(post, getUser(currentUserId));

        PostResponse sharedResponse = null;
        if (post.getSharedPost() != null) {
            Post shared = post.getSharedPost();
            sharedResponse = new PostResponse(
                    shared.getId(), DtoMapper.toUserSummary(shared.getAuthor()), shared.getContent(), shared.getImageUrl(),
                    null, postLikeRepository.countByPost(shared),
                    commentRepository.countByPost(shared),
                    false, shared.getCreatedAt(), shared.getUpdatedAt());
        }

        return new PostResponse(
                post.getId(), DtoMapper.toUserSummary(post.getAuthor()), post.getContent(), post.getImageUrl(),
                sharedResponse, likeCount, commentCount, liked, post.getCreatedAt(), post.getUpdatedAt());
    }
}
