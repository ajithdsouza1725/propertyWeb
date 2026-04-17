package com.mangalorehomes.propertyweb.catalog;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AmenityRepository extends JpaRepository<AmenityEntity, Long> {
  Optional<AmenityEntity> findByNameIgnoreCase(String name);
}

