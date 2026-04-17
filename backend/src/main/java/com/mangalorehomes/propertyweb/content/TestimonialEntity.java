package com.mangalorehomes.propertyweb.content;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "testimonials")
public class TestimonialEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @Column(nullable = false)
  public String name;

  public String designation;

  @Column(nullable = false)
  public String comment;

  @Column(name = "image_url")
  public String imageUrl;

  @Column(name = "is_active", nullable = false)
  public boolean active = true;

  @Column(name = "sort_order", nullable = false)
  public Integer sortOrder = 0;

  @Column(name = "created_at", nullable = false)
  public Instant createdAt = Instant.now();
}
