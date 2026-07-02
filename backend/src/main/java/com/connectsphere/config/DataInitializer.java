package com.connectsphere.config;

import com.connectsphere.entity.Role;
import com.connectsphere.entity.RoleName;
import com.connectsphere.entity.User;
import com.connectsphere.repository.RoleRepository;
import com.connectsphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

/**
 * Seeds the two RBAC roles and a default admin account on first boot.
 * Safe to run every startup: all operations are idempotent.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(RoleName.ROLE_USER);
                    return roleRepository.save(role);
                });
        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(RoleName.ROLE_ADMIN);
                    return roleRepository.save(role);
                });

        if (!userRepository.existsByEmail("admin@connectsphere.com")) {
            Set<Role> roles = new HashSet<>();
            roles.add(userRole);
            roles.add(adminRole);

            User admin = User.builder()
                    .username("admin")
                    .fullName("ConnectSphere Admin")
                    .email("admin@connectsphere.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .roles(roles)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            log.info("Seeded default admin account -> admin@connectsphere.com / Admin@123 (change this in production!)");
        }
    }
}
