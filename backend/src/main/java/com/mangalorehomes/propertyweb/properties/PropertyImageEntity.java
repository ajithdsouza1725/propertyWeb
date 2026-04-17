package com.mangalorehomes.propertyweb.properties;

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
@Table(name = "property_images")
public class PropertyImageEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "property_id")
  public PropertyEntity property;

  @Column(name = "image_url", nullable = false)
  public String imageUrl;

  @Column(name = "alt_text")
  public String altText;

  @Column(name = "sort_order", nullable = false)
  public Integer sortOrder = 0;

  @Column(name = "created_at", nullable = false)
  public Instant createdAt = Instant.now();
}

