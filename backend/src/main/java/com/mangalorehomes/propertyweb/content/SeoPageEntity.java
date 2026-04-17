package com.mangalorehomes.propertyweb.content;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.Map;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "seo_pages")
public class SeoPageEntity {
  @Id
  @Column(name = "page_key", length = 128)
  public String pageKey;

  @Column(name = "page_title")
  public String pageTitle;

  @Column(name = "meta_title")
  public String metaTitle;

  @Column(name = "meta_description")
  public String metaDescription;

  @Column(name = "og_image")
  public String ogImage;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "schema_json")
  public Map<String, Object> schemaJson;

  @Column(name = "updated_at", nullable = false)
  public Instant updatedAt = Instant.now();
}
