package com.mangalorehomes.propertyweb.seller.dto;

import jakarta.validation.constraints.NotBlank;

public record SellerProfileUpdateRequest(
    @NotBlank String fullName, String email, String phone, String businessName) {}
