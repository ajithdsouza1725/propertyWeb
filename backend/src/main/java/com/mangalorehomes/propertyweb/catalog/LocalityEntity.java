package com.mangalorehomes.propertyweb.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "localities")
public class LocalityEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @Column(nullable = false)
  public String city;

  @Column(nullable = false)
  public String name;

  @Column(nullable = false, unique = true)
  public String slug;

  public String description;

  @Column(name = "image_url")
  public String imageUrl;

  @Column(name = "is_featured", nullable = false)
  public boolean isFeatured = false;

  @Column(name = "is_active", nullable = false)
  public boolean isActive = true;

  @Column(name = "created_at", nullable = false)
  public Instant createdAt = Instant.now();

  @Column(name = "updated_at", nullable = false)
  public Instant updatedAt = Instant.now();
}

