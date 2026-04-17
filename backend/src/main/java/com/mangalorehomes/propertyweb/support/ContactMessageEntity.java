package com.mangalorehomes.propertyweb.support;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "contact_messages")
public class ContactMessageEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @Column(nullable = false)
  public String name;

  public String email;

  public String phone;

  @Column(nullable = false)
  public String message;

  @Column(name = "created_at", nullable = false)
  public Instant createdAt = Instant.now();
}
