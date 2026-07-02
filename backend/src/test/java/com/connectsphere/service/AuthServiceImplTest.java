package com.connectsphere.service;

import com.connectsphere.dto.request.LoginRequest;
import com.connectsphere.dto.request.RegisterRequest;
import com.connectsphere.dto.response.AuthResponse;
import com.connectsphere.entity.RefreshToken;
import com.connectsphere.entity.Role;
import com.connectsphere.entity.RoleName;
import com.connectsphere.entity.User;
import com.connectsphere.exception.DuplicateResourceException;
import com.connectsphere.repository.RefreshTokenRepository;
import com.connectsphere.repository.RoleRepository;
import com.connectsphere.repository.UserRepository;
import com.connectsphere.security.JwtUtil;
import com.connectsphere.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthServiceImpl using Mockito to isolate the service layer
 * from the database and Spring context.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthServiceImpl authService;

    private Role userRole;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "refreshTokenExpirationMs", 604800000L);
        userRole = new Role();
        userRole.setName(RoleName.ROLE_USER);
    }

    @Test
    void register_shouldCreateUser_whenEmailAndUsernameAreUnique() {
        RegisterRequest request = new RegisterRequest("johndoe", "John Doe", "john@example.com", "Password1");

        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(userRepository.existsByUsername(request.username())).thenReturn(false);
        when(roleRepository.findByName(RoleName.ROLE_USER)).thenReturn(Optional.of(userRole));
        when(passwordEncoder.encode(request.password())).thenReturn("encoded-password");

        User savedUser = User.builder()
                .username("johndoe").fullName("John Doe").email("john@example.com")
                .password("encoded-password").roles(Set.of(userRole)).enabled(true).build();
        savedUser.setId(1L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtUtil.generateAccessToken(any(), any())).thenReturn("access-token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> {
            RefreshToken rt = invocation.getArgument(0);
            rt.setId(1L);
            return rt;
        });

        AuthResponse response = authService.register(request);

        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.user().email()).isEqualTo("john@example.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_shouldThrow_whenEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest("johndoe", "John Doe", "john@example.com", "Password1");
        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already exists");

        verify(userRepository, never()).save(any());
    }

    @Test
    void login_shouldReturnTokens_whenCredentialsAreValid() {
        LoginRequest request = new LoginRequest("john@example.com", "Password1");
        User user = User.builder()
                .username("johndoe").fullName("John Doe").email("john@example.com")
                .password("encoded").roles(Set.of(userRole)).enabled(true).build();
        user.setId(1L);

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(jwtUtil.generateAccessToken(any(), any())).thenReturn("access-token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> {
            RefreshToken rt = invocation.getArgument(0);
            rt.setId(1L);
            return rt;
        });

        AuthResponse response = authService.login(request);

        assertThat(response.accessToken()).isEqualTo("access-token");
        verify(authenticationManager).authenticate(any());
    }
}
