package com.mangalorehomes.propertyweb.auth;

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
@Table(name = "password_reset_tokens")
public class PasswordResetTokenEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  // EAGER: entities in this project use public fields (no getters), so Hibernate's
  // LAZY proxy returns null for direct field access. Token rows are fetched rarely
  // (forgot/reset flows only), so the cost is negligible.
  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  @JoinColumn(name = "user_id")
  public UserEntity user;

  @Column(name = "token_hash", nullable = false)
  public String tokenHash;

  @Column(name = "expires_at", nullable = false)
  public Instant expiresAt;

  @Column(nullable = false)
  public boolean used = false;

  @Column(name = "created_at", nullable = false)
  public Instant createdAt = Instant.now();
}
