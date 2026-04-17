package com.mangalorehomes.propertyweb.content;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestimonialRepository extends JpaRepository<TestimonialEntity, Long> {

  List<TestimonialEntity> findByActiveIsTrueOrderBySortOrderAscIdAsc();
}
