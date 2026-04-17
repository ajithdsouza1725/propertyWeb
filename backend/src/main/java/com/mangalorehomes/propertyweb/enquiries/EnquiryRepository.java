package com.mangalorehomes.propertyweb.enquiries;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EnquiryRepository
    extends JpaRepository<EnquiryEntity, Long>, JpaSpecificationExecutor<EnquiryEntity> {

  /** Returns the property_id for a given enquiry — avoids LAZY-proxy issues on public fields. */
  @Query("select e.property.id from EnquiryEntity e where e.id = :enquiryId")
  Long findPropertyIdByEnquiryId(@Param("enquiryId") Long enquiryId);

  /** Returns the property title for notification messages — scalar projection, no proxy. */
  @Query("select p.title from PropertyEntity p where p.id = :propertyId")
  String findPropertyTitleById(@Param("propertyId") Long propertyId);

  // NOTE: we intentionally do NOT override findById with @EntityGraph here.
  // The assign endpoint mutates assignedSeller, and an entity-graph that
  // pre-fetches it causes Hibernate session-cache conflicts on the role field
  // of the freshly-set seller. Instead, we read property title via a separate
  // query after save (see EnquiryController.assign).

  long countByStatus(EnquiryStatus status);

  long countByUserId(Long userId);

  void deleteAllByPropertyId(Long propertyId);

  // Seller-assigned leads: also pre-fetch property so list renders show title/slug.
  @EntityGraph(attributePaths = {"property"})
  @Query(
      """
      select e from EnquiryEntity e join e.property p
      where e.assignedSeller.id = :sellerId
        and (:q = '' or lower(p.title) like lower(concat('%', :q, '%'))
             or lower(e.name) like lower(concat('%', :q, '%')))
      """)
  Page<EnquiryEntity> pageAssignedToSeller(
      @Param("sellerId") Long sellerId, @Param("q") String q, Pageable pageable);

  @EntityGraph(attributePaths = {"property"})
  List<EnquiryEntity> findAllByPropertyIdOrderByCreatedAtDesc(Long propertyId);

  // Buyer's own enquiries: AccountController.myEnquiries reads property.id/title/slug
  // via public-field access → must pre-fetch or the response comes back with null fields.
  @EntityGraph(attributePaths = {"property"})
  Page<EnquiryEntity> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);

  // Admin enquiries list (spec-based). Override so we can attach an @EntityGraph
  // — otherwise EnquiryController reads e.property.id/title on a LAZY proxy and loses them.
  @Override
  @EntityGraph(attributePaths = {"property", "assignedSeller"})
  Page<EnquiryEntity> findAll(Specification<EnquiryEntity> spec, Pageable pageable);
}
