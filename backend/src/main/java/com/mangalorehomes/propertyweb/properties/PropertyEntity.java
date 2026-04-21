package com.mangalorehomes.propertyweb.properties;

import com.mangalorehomes.propertyweb.catalog.LocalityEntity;
import com.mangalorehomes.propertyweb.catalog.PropertyTypeEntity;
import com.mangalorehomes.propertyweb.users.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "properties")
public class PropertyEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id")
  public UserEntity user;

  @Column(nullable = false)
  public String title;

  @Column(nullable = false, unique = true)
  public String slug;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  public PropertyPurpose purpose;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "property_type_id")
  public PropertyTypeEntity propertyType;

  public String description;

  @Column(nullable = false)
  public Long price;

  @Column(name = "security_deposit")
  public Long securityDeposit;

  @Column(name = "address_line")
  public String addressLine;

  public String city;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "locality_id")
  public LocalityEntity locality;

  public String pincode;

  public Double latitude;
  public Double longitude;

  public Integer bedrooms;
  public Integer bathrooms;
  public Integer balconies;

  @Column(name = "area_sqft")
  public Integer areaSqft;

  @Column(name = "carpet_area_sqft")
  public Integer carpetAreaSqft;

  @Column(name = "furnishing_status")
  public String furnishingStatus;

  @Column(name = "parking_count")
  public Integer parkingCount;

  @Column(name = "property_age")
  public Integer propertyAge;

  @Column(name = "floor_number")
  public Integer floorNumber;

  @Column(name = "total_floors")
  public Integer totalFloors;

  public String facing;

  @Column(name = "possession_status")
  public String possessionStatus;

  @Column(name = "ownership_type")
  public String ownershipType;

  // Field type is Map (not Object) so Hibernate picks the Jackson-backed JSON
  // JavaType rather than falling through to AbstractJsonFormatMapper's String-cast
  // branch (which crashes with LinkedHashMap-to-String ClassCastException on save).
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "extra_fields", nullable = false)
  public Map<String, Object> extraFields = new LinkedHashMap<>();

  @Column(name = "is_featured", nullable = false)
  public boolean isFeatured = false;

  @Column(name = "is_verified", nullable = false)
  public boolean isVerified = false;

  @Enumerated(EnumType.STRING)
  @Column(name = "approval_status", nullable = false)
  public ApprovalStatus approvalStatus = ApprovalStatus.pending;

  @Column(name = "rejection_reason")
  public String rejectionReason;

  @Enumerated(EnumType.STRING)
  @Column(name = "listing_status", nullable = false)
  public ListingStatus listingStatus = ListingStatus.active;

  @Column(name = "views_count", nullable = false)
  public Long viewsCount = 0L;

  @Column(name = "expires_at")
  public Instant expiresAt;

  @Column(name = "created_at", nullable = false)
  public Instant createdAt = Instant.now();

  @Column(name = "updated_at", nullable = false)
  public Instant updatedAt = Instant.now();
}

