package com.mangalorehomes.propertyweb.properties;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PropertyRepository extends JpaRepository<PropertyEntity, Long> {
  long countByApprovalStatus(ApprovalStatus approvalStatus);

  long countByUserId(Long userId);

  // Admin "all properties" list reads locality, propertyType, and seller (user) —
  // override findAll to pre-fetch these so public-field access doesn't return null.
  @EntityGraph(attributePaths = {"propertyType", "locality", "user"})
  @Override
  List<PropertyEntity> findAll();

  // Admin single-property detail reads all three associations too.
  @EntityGraph(attributePaths = {"propertyType", "locality", "user"})
  @Override
  Optional<PropertyEntity> findById(Long id);

  // findBySlug is used by the public property-detail endpoint (PublicController)
  // and for slug-uniqueness checks in seller create/update. Pre-fetching
  // propertyType + locality is required for the public detail JSON;
  // the small uniqueness-check overhead is acceptable.
  @EntityGraph(attributePaths = {"propertyType", "locality"})
  Optional<PropertyEntity> findBySlug(String slug);

  // Seller edit/detail reads propertyType.id/slug and locality.id/slug via
  // public-field access — pre-fetch to avoid LAZY-proxy nulls.
  @EntityGraph(attributePaths = {"propertyType", "locality"})
  Optional<PropertyEntity> findByIdAndUserId(Long id, Long userId);

  @Query(
      value =
          """
      select p from PropertyEntity p
      join fetch p.propertyType pt
      left join fetch p.locality l
      where (:purpose is null or p.purpose = :purpose)
        and (:localitySlug is null or l.slug = :localitySlug)
        and (:typeSlug is null or pt.slug = :typeSlug)
        and (:q = '' or lower(p.title) like concat('%', :q, '%'))
        and (:minPrice is null or p.price >= :minPrice)
        and (:maxPrice is null or p.price <= :maxPrice)
        and (:minBedrooms is null or p.bedrooms >= :minBedrooms)
        and (:maxBedrooms is null or p.bedrooms <= :maxBedrooms)
        and (:minAreaSqft is null or p.areaSqft >= :minAreaSqft)
        and (:maxAreaSqft is null or p.areaSqft <= :maxAreaSqft)
        and p.approvalStatus = com.mangalorehomes.propertyweb.properties.ApprovalStatus.approved
        and p.listingStatus = com.mangalorehomes.propertyweb.properties.ListingStatus.active
      """,
      countQuery =
          """
          select count(p) from PropertyEntity p
          join p.propertyType pt
          left join p.locality l
          where (:purpose is null or p.purpose = :purpose)
            and (:localitySlug is null or l.slug = :localitySlug)
            and (:typeSlug is null or pt.slug = :typeSlug)
            and (:q = '' or lower(p.title) like concat('%', :q, '%'))
            and (:minPrice is null or p.price >= :minPrice)
            and (:maxPrice is null or p.price <= :maxPrice)
            and (:minBedrooms is null or p.bedrooms >= :minBedrooms)
            and (:maxBedrooms is null or p.bedrooms <= :maxBedrooms)
            and (:minAreaSqft is null or p.areaSqft >= :minAreaSqft)
            and (:maxAreaSqft is null or p.areaSqft <= :maxAreaSqft)
            and p.approvalStatus = com.mangalorehomes.propertyweb.properties.ApprovalStatus.approved
            and p.listingStatus = com.mangalorehomes.propertyweb.properties.ListingStatus.active
          """)
  Page<PropertyEntity> publicSearchPage(
      @Param("purpose") PropertyPurpose purpose,
      @Param("localitySlug") String localitySlug,
      @Param("typeSlug") String typeSlug,
      @Param("q") String q,
      @Param("minPrice") Long minPrice,
      @Param("maxPrice") Long maxPrice,
      @Param("minBedrooms") Integer minBedrooms,
      @Param("maxBedrooms") Integer maxBedrooms,
      @Param("minAreaSqft") Integer minAreaSqft,
      @Param("maxAreaSqft") Integer maxAreaSqft,
      Pageable pageable);

  List<PropertyEntity> findByUserIdOrderByCreatedAtDesc(Long userId);

  // Seller "My listings": list/detail views read locality.name/slug and
  // propertyType.slug via public-field access; pre-fetch to avoid LAZY-proxy nulls.
  @EntityGraph(attributePaths = {"propertyType", "locality"})
  Page<PropertyEntity> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

  @EntityGraph(attributePaths = {"propertyType", "locality"})
  Page<PropertyEntity> findByUserIdAndTitleContainingIgnoreCase(Long userId, String title, Pageable pageable);

  @Query(
      """
      select distinct p from PropertyEntity p
      join fetch p.propertyType pt
      left join fetch p.locality l
      where p.id in :ids
        and p.approvalStatus = com.mangalorehomes.propertyweb.properties.ApprovalStatus.approved
        and p.listingStatus = com.mangalorehomes.propertyweb.properties.ListingStatus.active
      """)
  List<PropertyEntity> findPublicActiveByIdIn(@Param("ids") Collection<Long> ids);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("update PropertyEntity p set p.viewsCount = p.viewsCount + 1 where p.id = :id")
  int incrementViewsCountById(@Param("id") Long id);
}

