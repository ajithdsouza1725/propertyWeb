package com.mangalorehomes.propertyweb.support;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactMessageRepository extends JpaRepository<ContactMessageEntity, Long> {
  Page<ContactMessageEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);

  long countByIsReadFalse();
}
