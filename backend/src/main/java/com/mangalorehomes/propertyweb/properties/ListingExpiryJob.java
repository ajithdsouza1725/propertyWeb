package com.mangalorehomes.propertyweb.properties;

import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Daily job that marks approved listings as "expired" once their expires_at
 * date passes. Runs at midnight every day.
 */
@Component
public class ListingExpiryJob {
  private static final Logger log = LoggerFactory.getLogger(ListingExpiryJob.class);
  private final PropertyRepository properties;

  public ListingExpiryJob(PropertyRepository properties) {
    this.properties = properties;
  }

  @Scheduled(cron = "0 0 0 * * *") // midnight daily
  @Transactional
  public void expireListings() {
    var now = Instant.now();
    var expired = properties.findAll().stream()
        .filter(p -> p.approvalStatus == ApprovalStatus.approved)
        .filter(p -> p.expiresAt != null && p.expiresAt.isBefore(now))
        .toList();

    for (var p : expired) {
      p.listingStatus = ListingStatus.expired;
      p.updatedAt = now;
      properties.save(p);
    }

    if (!expired.isEmpty()) {
      log.info("[expiry] Marked {} listings as expired.", expired.size());
    }
  }
}
