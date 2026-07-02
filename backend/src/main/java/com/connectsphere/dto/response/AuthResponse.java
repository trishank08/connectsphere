package com.connectsphere.dto.response;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        UserSummaryResponse user
) {
    public AuthResponse(String accessToken, String refreshToken, UserSummaryResponse user) {
        this(accessToken, refreshToken, "Bearer", user);
    }
}
