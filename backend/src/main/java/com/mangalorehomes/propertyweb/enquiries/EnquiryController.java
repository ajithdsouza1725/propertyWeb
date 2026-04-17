package com.mangalorehomes.propertyweb.enquiries;

import com.mangalorehomes.propertyweb.api.PageResponse;
import com.mangalorehomes.propertyweb.enquiries.dto.CreateEnquiryRequest;
import com.mangalorehomes.propertyweb.notifications.InAppNotificationService;
import com.mangalorehomes.propertyweb.notifications.MailNotificationService;
import com.mangalorehomes.propertyweb.properties.PropertyRepository;
import com.mangalorehomes.propertyweb.security.SecurityUser;
import com.mangalorehomes.propertyweb.security.UserRole;
import com.mangalorehomes.propertyweb.users.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.io.IOException;
import java.time.Instant;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Transactional
public class EnquiryController {
  private final EnquiryRepository enquiries;
  private final PropertyRepository properties;
  private final UserRepository users;
  private final MailNotificationService mail;
  private final InAppNotificationService inApp;

  public EnquiryController(
      EnquiryRepository enquiries,
      PropertyRepository properties,
      UserRepository users,
      MailNotificationService mail,
      InAppNotificationService inApp) {
    this.enquiries = enquiries;
    this.properties = properties;
    this.users = users;
    this.mail = mail;
    this.inApp = inApp;
  }

  // ── IP-based rate limiter (max 10 enquiries per IP per 10 min) ──
  private static final int ENQ_MAX = 10;
  private static final long ENQ_WINDOW_MS = 10 * 60 * 1000;
  private final ConcurrentHashMap<String, long[]> enquiryIpHits = new ConcurrentHashMap<>();

  @PostMapping("/api/public/enquiries")
  public Object create(
      @Valid @RequestBody CreateEnquiryRequest req,
      Authentication authentication,
      HttpServletRequest httpReq) {
    // Rate-limit
    String ip = clientIp(httpReq);
    long now = System.currentTimeMillis();
    long[] rec = enquiryIpHits.compute(ip, (k, old) -> {
      if (old == null || now - old[1] > ENQ_WINDOW_MS) return new long[]{1, now};
      old[0]++;
      return old;
    });
    if (rec[0] > ENQ_MAX) {
      throw new IllegalArgumentException("Too many enquiries. Please wait a few minutes.");
    }
    var property =
        req.propertyId() != null
            ? properties.findById(req.propertyId()).orElseThrow(() -> new IllegalArgumentException("Not found"))
            : (req.propertySlug() != null && !req.propertySlug().isBlank())
                ? properties
                    .findBySlug(req.propertySlug().trim())
                    .orElseThrow(() -> new IllegalArgumentException("Not found"))
                : null;
    if (property == null) throw new IllegalArgumentException("propertyId or propertySlug required");

    // Only allow enquiries on live, admin-approved listings. Prevents leads on
    // pending/rejected properties from leaking into the seller's inbox.
    if (property.approvalStatus != com.mangalorehomes.propertyweb.properties.ApprovalStatus.approved
        || property.listingStatus != com.mangalorehomes.propertyweb.properties.ListingStatus.active) {
      throw new IllegalArgumentException("This property is not currently accepting enquiries.");
    }

    var e = new EnquiryEntity();
    e.property = property;
    e.user = null;
    if (authentication != null
        && authentication.isAuthenticated()
        && authentication.getPrincipal() instanceof SecurityUser su
        && su.role() == UserRole.buyer) {
      e.user = users.findById(su.id()).orElse(null);
    }
    e.assignedSeller = null;
    e.assignedAt = null;
    e.name = req.name();
    e.email = req.email();
    e.phone = req.phone();
    e.message = req.message();
    e.status = EnquiryStatus.NEW;
    e.source = normalizeSource(req.source());
    e.createdAt = Instant.now();
    e.updatedAt = Instant.now();
    e = enquiries.save(e);
    mail.notifyAdminNewEnquiry(e.id, property.title, e.name);
    return java.util.Map.of("id", e.id, "status", e.status.name());
  }

  @PreAuthorize("hasAnyRole('OWNER','AGENT','ADMIN')")
  @GetMapping("/api/seller/enquiries")
  public PageResponse<?> sellerEnquiries(
      @AuthenticationPrincipal SecurityUser principal,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "12") int size,
      @RequestParam(required = false) String q) {
    var qq = q == null ? "" : q.trim();
    var pageable =
        PageRequest.of(
            Math.max(0, page),
            Math.min(50, Math.max(1, size)),
            Sort.by(Sort.Direction.DESC, "createdAt"));
    var res = enquiries.pageAssignedToSeller(principal.id(), qq, pageable);
    var content =
        res.getContent().stream()
            .map(
                e ->
                    new java.util.LinkedHashMap<String, Object>() {
                      {
                        put("id", e.id);
                        put("status", e.status == null ? null : e.status.name());
                        put("source", e.source);
                        put("createdAt", e.createdAt);
                        put("updatedAt", e.updatedAt);
                        put("assignedSellerId", e.assignedSeller == null ? null : e.assignedSeller.id);
                        put("propertyId", e.property.id);
                        put("propertyTitle", e.property.title);
                        put("buyerName", e.name);
                        put("buyerPhone", e.phone);
                        put("buyerEmail", e.email);
                        put("message", e.message);
                      }
                    })
            .toList();
    return new PageResponse<>(
        content, res.getTotalElements(), res.getTotalPages(), res.getNumber(), res.getSize());
  }

  public record AssignEnquiryRequest(Long sellerId) {}

  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping("/api/admin/enquiries/{id}/assign")
  public Object assign(@PathVariable Long id, @Valid @RequestBody AssignEnquiryRequest req) {
    var e = enquiries.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
    // Capture the property_id NOW via Hibernate's PersistenceUnitUtil — the
    // LAZY proxy's public `id` field returns null, but the identifier is available.
    var propIdRef = enquiries.findPropertyIdByEnquiryId(id);
    if (req.sellerId() == null) {
      e.assignedSeller = null;
      e.assignedAt = null;
      e.status = EnquiryStatus.NEW;
    } else {
      var seller =
          users.findById(req.sellerId()).orElseThrow(() -> new IllegalArgumentException("Seller not found"));
      if (seller.role == null || seller.role == UserRole.buyer || seller.role == UserRole.admin) {
        throw new IllegalArgumentException("Invalid seller");
      }
      e.assignedSeller = seller;
      e.assignedAt = Instant.now();
      e.status = EnquiryStatus.ASSIGNED;
    }
    e.updatedAt = Instant.now();
    // Capture seller details BEFORE save — seller was loaded fresh from
    // users.findById so its public fields (email, id) are populated.
    Long notifySellerId = e.assignedSeller != null ? e.assignedSeller.id : null;
    String notifyEmail = e.assignedSeller != null ? e.assignedSeller.email : null;
    enquiries.save(e);

    // Scalar JPQL projection — bypasses Hibernate entity proxies entirely.
    var propTitle = propIdRef != null
        ? enquiries.findPropertyTitleById(propIdRef)
        : null;
    if (propTitle == null || propTitle.isBlank()) propTitle = "(unknown property)";

    if (notifySellerId != null) {
      mail.notifySellerLeadAssigned(e.id, notifyEmail, propTitle);
      inApp.notifyUser(
          notifySellerId,
          "New lead assigned",
          "Enquiry #" + e.id + " for “" + propTitle + "”. Open Seller → Enquiries.");
    }
    return java.util.Map.of("id", e.id, "assignedSellerId", notifySellerId != null ? notifySellerId : "");
  }

  @PreAuthorize("hasRole('ADMIN')")
  @GetMapping("/api/admin/enquiries")
  public PageResponse<?> adminEnquiries(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "12") int size,
      @RequestParam(required = false) String status,
      @RequestParam(required = false) String q,
      @RequestParam(required = false) String dateFrom,
      @RequestParam(required = false) String dateTo,
      @RequestParam(required = false) Long sellerId) {
    var pageable =
        PageRequest.of(
            Math.max(0, page),
            Math.min(50, Math.max(1, size)),
            Sort.by(Sort.Direction.DESC, "createdAt"));
    var spec = EnquirySpecifications.adminListFilter(status, q, dateFrom, dateTo, sellerId);
    var res = enquiries.findAll(spec, pageable);
    var content =
        res.getContent().stream()
            .map(
                e ->
                    new java.util.LinkedHashMap<String, Object>() {
                      {
                        put("id", e.id);
                        put("status", e.status == null ? null : e.status.name());
                        put("source", e.source);
                        put("createdAt", e.createdAt);
                        put("updatedAt", e.updatedAt);
                        put("propertyId", e.property.id);
                        put("propertyTitle", e.property.title);
                        put("buyerName", e.name);
                        put("buyerPhone", e.phone);
                        put("buyerEmail", e.email);
                        put("message", e.message);
                        put("assignedSellerId", e.assignedSeller == null ? null : e.assignedSeller.id);
                        put("assignedAt", e.assignedAt);
                      }
                    })
            .toList();
    return new PageResponse<>(
        content, res.getTotalElements(), res.getTotalPages(), res.getNumber(), res.getSize());
  }

  /**
   * CSV export that respects the same filters as the list endpoint.
   * When no filters are set, exports everything (backwards compatible).
   */
  @PreAuthorize("hasRole('ADMIN')")
  @GetMapping(value = "/api/admin/enquiries/export", produces = "text/csv;charset=UTF-8")
  public void exportEnquiriesCsv(
      @RequestParam(required = false) String status,
      @RequestParam(required = false) String q,
      @RequestParam(required = false) String dateFrom,
      @RequestParam(required = false) String dateTo,
      @RequestParam(required = false) Long sellerId,
      HttpServletResponse response) throws IOException {
    response.setCharacterEncoding("UTF-8");
    response.setHeader("Content-Disposition", "attachment; filename=\"enquiries.csv\"");
    var spec = EnquirySpecifications.adminListFilter(status, q, dateFrom, dateTo, sellerId);
    var sorted = Sort.by(Sort.Direction.DESC, "createdAt");
    var writer = response.getWriter();
    writer.println(
        "id,status,source,propertyId,propertyTitle,buyerName,buyerEmail,buyerPhone,message,assignedSellerId,assignedAt,createdAt");
    for (var e : enquiries.findAll(spec, sorted)) {
      writer.println(
          String.join(
              ",",
              csvField(e.id),
              csvField(e.status == null ? "" : e.status.name()),
              csvField(e.source),
              csvField(e.property == null ? "" : e.property.id),
              csvField(e.property == null ? "" : e.property.title),
              csvField(e.name),
              csvField(e.email),
              csvField(e.phone),
              csvField(e.message),
              csvField(e.assignedSeller == null ? "" : e.assignedSeller.id),
              csvField(e.assignedAt == null ? "" : e.assignedAt.toString()),
              csvField(e.createdAt == null ? "" : e.createdAt.toString())));
    }
    writer.flush();
  }

  private static String csvField(Object v) {
    if (v == null) return "";
    var s = String.valueOf(v);
    if (s.contains(",") || s.contains("\"") || s.contains("\r") || s.contains("\n")) {
      return "\"" + s.replace("\"", "\"\"") + "\"";
    }
    return s;
  }

  public record UpdateStatusRequest(@NotBlank String status) {}

  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping("/api/admin/enquiries/{id}/status")
  public Object updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateStatusRequest req) {
    var e = enquiries.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
    var raw = req.status() == null ? "" : req.status().trim().toUpperCase(Locale.ROOT);
    EnquiryStatus next;
    try {
      next = EnquiryStatus.valueOf(raw);
    } catch (Exception ex) {
      throw new IllegalArgumentException("Invalid status. Use NEW/ASSIGNED/CLOSED.");
    }

    if (next == EnquiryStatus.NEW) {
      e.assignedSeller = null;
      e.assignedAt = null;
    }
    if (next == EnquiryStatus.ASSIGNED && e.assignedSeller == null) {
      throw new IllegalArgumentException("Assign a seller before setting status to ASSIGNED.");
    }

    e.status = next;
    e.updatedAt = Instant.now();
    enquiries.save(e);
    var result = new java.util.LinkedHashMap<String, Object>();
    result.put("id", e.id);
    result.put("status", e.status.name());
    result.put("assignedSellerId", e.assignedSeller == null ? null : e.assignedSeller.id);
    return result;
  }

  private static final Set<String> ALLOWED_SOURCES = Set.of("website", "whatsapp", "call");

  private static String normalizeSource(String source) {
    if (source == null || source.isBlank()) return "website";
    var s = source.trim().toLowerCase();
    return ALLOWED_SOURCES.contains(s) ? s : "website";
  }

  private static String clientIp(HttpServletRequest req) {
    String xff = req.getHeader("X-Forwarded-For");
    if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
    return req.getRemoteAddr();
  }
}
