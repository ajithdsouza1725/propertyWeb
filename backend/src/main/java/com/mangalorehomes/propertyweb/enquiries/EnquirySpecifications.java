package com.mangalorehomes.propertyweb.enquiries;

import jakarta.persistence.criteria.JoinType;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.data.jpa.domain.Specification;

public final class EnquirySpecifications {
  private EnquirySpecifications() {}

  /**
   * Builds a specification for the admin enquiries list. Supports:
   *   - status (NEW/ASSIGNED/CLOSED)
   *   - free-text search (buyer name, email, phone, property title, enquiry ID)
   *   - date range (from/to as ISO date strings e.g. "2026-04-01")
   *   - seller filter (assigned seller ID)
   */
  public static Specification<EnquiryEntity> adminListFilter(
      String status, String q, String dateFrom, String dateTo, Long sellerId) {
    return (root, query, cb) -> {
      List<jakarta.persistence.criteria.Predicate> preds = new ArrayList<>();

      // Status filter
      if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status.trim())) {
        try {
          var st = EnquiryStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
          preds.add(cb.equal(root.get("status"), st));
        } catch (IllegalArgumentException ignored) {
        }
      }

      // Free-text search
      if (q != null && !q.isBlank()) {
        var term = "%" + q.trim().toLowerCase(Locale.ROOT) + "%";
        var prop = root.join("property", JoinType.INNER);
        var ors = new ArrayList<jakarta.persistence.criteria.Predicate>();
        ors.add(cb.like(cb.lower(prop.get("title")), term));
        ors.add(cb.and(cb.isNotNull(root.get("name")), cb.like(cb.lower(root.get("name")), term)));
        ors.add(cb.and(cb.isNotNull(root.get("email")), cb.like(cb.lower(root.get("email")), term)));
        ors.add(cb.and(cb.isNotNull(root.get("phone")), cb.like(cb.lower(root.get("phone")), term)));
        try {
          var id = Long.parseLong(q.trim());
          ors.add(cb.equal(root.get("id"), id));
        } catch (NumberFormatException ignored) {
        }
        preds.add(cb.or(ors.toArray(jakarta.persistence.criteria.Predicate[]::new)));
      }

      // Date range filter
      if (dateFrom != null && !dateFrom.isBlank()) {
        try {
          Instant from = LocalDate.parse(dateFrom.trim()).atStartOfDay(ZoneOffset.UTC).toInstant();
          preds.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
        } catch (Exception ignored) {
        }
      }
      if (dateTo != null && !dateTo.isBlank()) {
        try {
          // End of day — include the whole "to" date
          Instant to = LocalDate.parse(dateTo.trim()).plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
          preds.add(cb.lessThan(root.get("createdAt"), to));
        } catch (Exception ignored) {
        }
      }

      // Seller filter (assigned seller)
      if (sellerId != null) {
        preds.add(cb.equal(root.get("assignedSeller").get("id"), sellerId));
      }

      return preds.isEmpty()
          ? cb.conjunction()
          : cb.and(preds.toArray(jakarta.persistence.criteria.Predicate[]::new));
    };
  }
}
