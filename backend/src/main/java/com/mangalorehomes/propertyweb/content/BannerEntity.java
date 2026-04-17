package com.mangalorehomes.propertyweb.content;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "banners")
public class BannerEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  public String title;
  public String subtitle;

  @Column(name = "image_url")
  public String imageUrl;

  @Column(name = "button_text")
  public String buttonText;

  @Column(name = "button_link")
  public String buttonLink;

  @Column(name = "page_type", nullable = false)
  public String pageType = "homepage";

  @Column(name = "is_active", nullable = false)
  public boolean active = true;

  @Column(name = "created_at", nullable = false)
  public Instant createdAt = Instant.now();

  @Column(name = "updated_at", nullable = false)
  public Instant updatedAt = Instant.now();
}
