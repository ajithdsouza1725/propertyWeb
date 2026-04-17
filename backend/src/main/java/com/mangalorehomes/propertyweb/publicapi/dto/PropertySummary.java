package com.mangalorehomes.propertyweb.publicapi.dto;

public record PropertySummary(
    Long id,
    String title,
    String slug,
    String purpose,
    String propertyType,
    String propertyTypeSlug,
    String locality,
    String localitySlug,
    Long price,
    Integer bedrooms,
    Integer bathrooms,
    Integer areaSqft,
    boolean isFeatured,
    boolean isVerified,
    boolean localityFeatured,
    String thumbUrl) {}
