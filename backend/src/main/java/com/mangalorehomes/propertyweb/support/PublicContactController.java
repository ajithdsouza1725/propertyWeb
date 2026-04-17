package com.mangalorehomes.propertyweb.support;

import com.mangalorehomes.propertyweb.support.dto.PublicContactRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
public class PublicContactController {

  private final ContactMessageRepository messages;

  // ── Simple IP-based rate limiter ────────────────────────────────────
  // Max 5 contact submissions per IP per 10-minute window. In-memory — resets
  // on app restart. Not meant as a production WAF; just blocks casual spam.
  private static final int MAX_PER_WINDOW = 5;
  private static final long WINDOW_MS = 10 * 60 * 1000; // 10 minutes
  private final ConcurrentHashMap<String, long[]> ipHits = new ConcurrentHashMap<>();

  public PublicContactController(ContactMessageRepository messages) {
    this.messages = messages;
  }

  @PostMapping("/contact")
  public Map<String, Object> contact(
      @Valid @RequestBody PublicContactRequest req, HttpServletRequest httpReq) {
    // Rate-limit check
    String ip = clientIp(httpReq);
    if (!allowRequest(ip)) {
      throw new IllegalArgumentException(
          "Too many messages from your network. Please wait a few minutes and try again.");
    }

    var m = new ContactMessageEntity();
    m.name = req.name().trim();
    m.email = req.email() == null || req.email().isBlank() ? null : req.email().trim();
    m.phone = req.phone() == null || req.phone().isBlank() ? null : req.phone().trim();
    m.message = req.message().trim();
    m.createdAt = Instant.now();
    m = messages.save(m);
    return Map.of("id", m.id, "ok", true);
  }

  // ── Rate-limiter helpers ───────────────────────────────────────────

  private boolean allowRequest(String ip) {
    long now = System.currentTimeMillis();
    long[] record = ipHits.compute(
        ip,
        (k, old) -> {
          if (old == null || now - old[1] > WINDOW_MS) {
            // New window: count=1, windowStart=now
            return new long[] {1, now};
          }
          old[0]++;
          return old;
        });
    return record[0] <= MAX_PER_WINDOW;
  }

  private static String clientIp(HttpServletRequest req) {
    // Respect X-Forwarded-For for reverse-proxy setups (nginx, Cloudflare, etc).
    String xff = req.getHeader("X-Forwarded-For");
    if (xff != null && !xff.isBlank()) {
      return xff.split(",")[0].trim();
    }
    return req.getRemoteAddr();
  }
}
