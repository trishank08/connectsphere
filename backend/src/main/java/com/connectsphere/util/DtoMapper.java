package com.connectsphere.util;

import com.connectsphere.dto.response.UserSummaryResponse;
import com.connectsphere.entity.Role;
import com.connectsphere.entity.User;

import java.util.stream.Collectors;

/**
 * Hand-written mapper utilities between entities and DTOs. Kept explicit
 * (rather than fully generated) so mapping logic stays easy to audit.
 */
public final class DtoMapper {

    private DtoMapper() {}

    public static UserSummaryResponse toUserSummary(User user) {
        if (user == null) return null;
        return new UserSummaryResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getProfilePictureUrl(),
                user.isOnline(),
                user.getRoles().stream().map(Role::getName).map(Enum::name).collect(Collectors.toSet())
        );
    }
}
