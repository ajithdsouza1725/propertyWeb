package com.mangalorehomes.propertyweb.seller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SellerCreatePropertyRequest(
    @NotBlank String title,
    String slug,
    @NotBlank String purpose,
    @NotNull Long propertyTypeId,
    Long localityId,
    Long price,
    Long securityDeposit,
    String description,
    String addressLine,
    String city,
    String pincode,
    Integer bedrooms,
    Integer bathrooms,
    Integer areaSqft,
    Integer parkingCount,
    String furnishingStatus,
    String possessionStatus,
    Object extraFields) {}

