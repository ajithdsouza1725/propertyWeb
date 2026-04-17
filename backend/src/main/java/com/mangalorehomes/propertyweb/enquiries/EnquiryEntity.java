package com.mangalorehomes.propertyweb.enquiries;

import com.mangalorehomes.propertyweb.properties.PropertyEntity;
import com.mangalorehomes.propertyweb.users.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "enquiries")
public class EnquiryEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "property_id")
  public PropertyEntity property;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  public UserEntity user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "assigned_seller_id")
  public UserEntity assignedSeller;

  @Column(nullable = false)
  public String name;

  public String email;

  @Column(nullable = false)
  public String phone;

  public String message;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  public EnquiryStatus status = EnquiryStatus.NEW;

  @Column(nullable = false)
  public String source = "website";

  @Column(name = "created_at", nullable = false)
  public Instant createdAt = Instant.now();

  @Column(name = "assigned_at")
  public Instant assignedAt;

  @Column(name = "updated_at", nullable = false)
  public Instant updatedAt = Instant.now();
}

