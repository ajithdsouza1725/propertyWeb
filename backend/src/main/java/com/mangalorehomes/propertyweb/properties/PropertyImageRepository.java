package com.mangalorehomes.propertyweb.properties;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PropertyImageRepository extends JpaRepository<PropertyImageEntity, Long> {
  List<PropertyImageEntity> findAllByPropertyIdOrderBySortOrderAscIdAsc(Long propertyId);

  long countByPropertyId(Long propertyId);

  void deleteAllByPropertyId(Long propertyId);
}

