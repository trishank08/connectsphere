package com.connectsphere.dto.request;

import java.util.Set;

public record UpdateProfileRequest(
        String fullName,
        String bio,
        String location,
        Set<String> skills,
        Set<String> interests
) {}
