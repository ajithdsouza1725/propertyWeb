package com.mangalorehomes.propertyweb.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AuthSignupRequest(
    @NotBlank(message = "Full name is required.")
    String fullName,

    @Email(message = "Invalid email format.")
    String email,

    @Pattern(regexp = "^$|^\\d{10,15}$", message = "Phone must be 10–15 digits.")
    String phone,

    @NotBlank(message = "Password is required.")
    @Size(min = 8, message = "Password must be at least 8 characters.")
    String password,

    @NotNull(message = "Role is required.")
    String role) {}
