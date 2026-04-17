package com.mangalorehomes.propertyweb.seller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SellerChangePasswordRequest(
    @NotBlank String currentPassword, @NotBlank @Size(min = 8, max = 200) String newPassword) {}
