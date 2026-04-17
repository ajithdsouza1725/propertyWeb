package com.mangalorehomes.propertyweb.support.dto;

import jakarta.validation.constraints.NotBlank;

public record PublicContactRequest(
    @NotBlank String name, String email, String phone, @NotBlank String message) {}
