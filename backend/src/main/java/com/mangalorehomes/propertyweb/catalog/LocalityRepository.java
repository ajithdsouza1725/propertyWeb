package com.mangalorehomes.propertyweb.catalog;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocalityRepository extends JpaRepository<LocalityEntity, Long> {
  Optional<LocalityEntity> findBySlug(String slug);
}

