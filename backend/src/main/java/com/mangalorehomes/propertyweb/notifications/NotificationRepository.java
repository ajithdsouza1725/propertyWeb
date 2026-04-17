package com.mangalorehomes.propertyweb.notifications;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

  Page<NotificationEntity> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

  long countByUserIdAndIsReadIsFalse(Long userId);

  @Modifying
  @Query("update NotificationEntity n set n.isRead = true where n.id = :id and n.user.id = :userId")
  int markRead(@Param("id") Long id, @Param("userId") Long userId);

  @Modifying
  @Query("update NotificationEntity n set n.isRead = true where n.user.id = :userId and n.isRead = false")
  int markAllRead(@Param("userId") Long userId);
}
