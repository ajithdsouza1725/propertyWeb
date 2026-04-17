package com.mangalorehomes.propertyweb.auth.dto;

public record MeResponse(
    Long id,
    String fullName,
    String email,
    String phone,
    String businessName,
    String role,
    String status) {}

