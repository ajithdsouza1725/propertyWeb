package com.mangalorehomes.propertyweb.saved;

import com.mangalorehomes.propertyweb.properties.PropertyEntity;
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
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

@Entity
@Table(
    name = "saved_properties",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "property_id"}))
public class SavedPropertyEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id")
  public UserEntity user;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "property_id")
  public PropertyEntity property;

  @Column(name = "created_at", nullable = false)
  public Instant createdAt = Instant.now();
}
