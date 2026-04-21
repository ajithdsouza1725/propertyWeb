package com.mangalorehomes.propertyweb.support.dto;

import java.time.Instant;

public record ContactMessageResponse(
    long id, String name, String email, String phone, String message, boolean isRead, Instant createdAt) {}
