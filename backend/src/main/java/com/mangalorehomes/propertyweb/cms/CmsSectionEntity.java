package com.mangalorehomes.propertyweb.cms;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "cms_sections")
public class CmsSectionEntity {
  @Id
  @Column(length = 64)
  public String section;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "jsonb", nullable = false)
  public Map<String, Object> payload = new HashMap<>();

  @Column(name = "updated_at", nullable = false)
  public Instant updatedAt = Instant.now();
}
