package com.mangalorehomes.propertyweb.enquiries.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateEnquiryRequest(
    Long propertyId,
    String propertySlug,
    @NotBlank String name,
    String email,
    @NotBlank String phone,
    String message,
    String source) {}

