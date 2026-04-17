package com.mangalorehomes.propertyweb.saved;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SavedPropertyRepository extends JpaRepository<SavedPropertyEntity, Long> {

  boolean existsByUserIdAndPropertyId(Long userId, Long propertyId);

  Optional<SavedPropertyEntity> findByUserIdAndPropertyId(Long userId, Long propertyId);

  List<SavedPropertyEntity> findAllByUserIdOrderByCreatedAtDesc(Long userId);

  // Entity-graph includes nested assoc reads done by AccountController.toSummary
  // (propertyType.name, locality.name). Without this, public-field access on LAZY
  // proxies returns null and the list silently loses data.
  @EntityGraph(
      attributePaths = {
        "property",
        "property.propertyType",
        "property.locality"
      })
  Page<SavedPropertyEntity> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

  long countByUserId(Long userId);
}
