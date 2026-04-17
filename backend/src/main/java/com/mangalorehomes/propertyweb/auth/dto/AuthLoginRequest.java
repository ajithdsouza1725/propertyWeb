package com.mangalorehomes.propertyweb.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record AuthLoginRequest(@NotBlank String identifier, @NotBlank String password) {}

