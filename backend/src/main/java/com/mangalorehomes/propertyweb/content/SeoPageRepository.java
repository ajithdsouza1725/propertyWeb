package com.mangalorehomes.propertyweb.content;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeoPageRepository extends JpaRepository<SeoPageEntity, String> {

  List<SeoPageEntity> findAllByOrderByPageKeyAsc();
}
