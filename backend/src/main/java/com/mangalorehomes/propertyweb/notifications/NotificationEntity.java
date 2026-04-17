package com.mangalorehomes.propertyweb.notifications;

import com.mangalorehomes.propertyweb.users.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "notifications")
public class NotificationEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id")
  public UserEntity user;

  @Column(nullable = false)
  public String title;

  @Column(nullable = false)
  public String message;

  @Column(name = "is_read", nullable = false)
  public boolean isRead = false;

  @Column(name = "created_at", nullable = false)
  public Instant createdAt = Instant.now();
}
