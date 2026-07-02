package com.connectsphere.service;

import com.connectsphere.dto.request.CreatePostRequest;
import com.connectsphere.dto.response.PostResponse;
import com.connectsphere.entity.Post;
import com.connectsphere.entity.User;
import com.connectsphere.exception.UnauthorizedActionException;
import com.connectsphere.repository.CommentRepository;
import com.connectsphere.repository.FriendshipRepository;
import com.connectsphere.repository.PostLikeRepository;
import com.connectsphere.repository.PostRepository;
import com.connectsphere.repository.UserRepository;
import com.connectsphere.service.impl.PostServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostServiceImplTest {

    @Mock private PostRepository postRepository;
    @Mock private PostLikeRepository postLikeRepository;
    @Mock private CommentRepository commentRepository;
    @Mock private UserRepository userRepository;
    @Mock private FriendshipRepository friendshipRepository;
    @Mock private NotificationService notificationService;
    @Mock private FileStorageService fileStorageService;

    @InjectMocks
    private PostServiceImpl postService;

    private User author;

    @BeforeEach
    void setUp() {
        author = User.builder().username("jane").fullName("Jane Doe").email("jane@example.com").build();
        author.setId(1L);
    }

    @Test
    void createPost_shouldPersistAndReturnResponse() {
        CreatePostRequest request = new CreatePostRequest("Hello ConnectSphere!", null, null);
        when(userRepository.findById(1L)).thenReturn(Optional.of(author));

        Post saved = Post.builder().author(author).content(request.content()).build();
        saved.setId(10L);
        when(postRepository.save(any(Post.class))).thenReturn(saved);
        when(postLikeRepository.countByPost(saved)).thenReturn(0L);
        when(postLikeRepository.existsByPostAndUser(any(), any())).thenReturn(false);

        PostResponse response = postService.createPost(1L, request);

        assertThat(response.content()).isEqualTo("Hello ConnectSphere!");
        assertThat(response.author().id()).isEqualTo(1L);
    }

    @Test
    void updatePost_shouldThrow_whenUserIsNotOwner() {
        User otherUser = User.builder().build();
        otherUser.setId(2L);
        Post post = Post.builder().author(author).content("original").build();
        post.setId(10L);
        when(postRepository.findById(10L)).thenReturn(Optional.of(post));

        var request = new com.connectsphere.dto.request.UpdatePostRequest("edited content", null);

        assertThatThrownBy(() -> postService.updatePost(2L, 10L, request))
                .isInstanceOf(UnauthorizedActionException.class);
    }
}
