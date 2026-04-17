package com.mangalorehomes.propertyweb.users;

import com.mangalorehomes.propertyweb.security.UserRole;
import com.mangalorehomes.propertyweb.security.UserStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "users")
public class UserEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @Column(name = "full_name", nullable = false)
  public String fullName;

  @Column(unique = true)
  public String email;

  @Column(unique = true)
  public String phone;

  @Column(name = "password_hash", nullable = false)
  public String passwordHash;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  public UserRole role;

  @Column(name = "profile_image")
  public String profileImage;

  @Column(name = "business_name")
  public String businessName;

  @Column(name = "is_verified", nullable = false)
  public boolean isVerified = false;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  public UserStatus status = UserStatus.active;

  @Column(name = "created_at", nullable = false)
  public Instant createdAt = Instant.now();

  @Column(name = "updated_at", nullable = false)
  public Instant updatedAt = Instant.now();
}

