package com.connectsphere.security;

import com.connectsphere.entity.User;

/**
 * Wraps the currently authenticated User for easy access inside controllers
 * via @AuthenticationPrincipal.
 */
public record UserPrincipal(Long id, String email) {

    public static UserPrincipal from(User user) {
        return new UserPrincipal(user.getId(), user.getEmail());
    }
}
