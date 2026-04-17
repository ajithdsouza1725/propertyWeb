package com.mangalorehomes.propertyweb.catalog;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PropertyTypeRepository extends JpaRepository<PropertyTypeEntity, Long> {
  Optional<PropertyTypeEntity> findBySlug(String slug);
}

