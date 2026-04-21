package com.mangalorehomes.propertyweb.account;

import com.mangalorehomes.propertyweb.api.PageResponse;
import com.mangalorehomes.propertyweb.enquiries.EnquiryRepository;
import com.mangalorehomes.propertyweb.notifications.NotificationRepository;
import com.mangalorehomes.propertyweb.properties.ApprovalStatus;
import com.mangalorehomes.propertyweb.properties.ListingStatus;
import com.mangalorehomes.propertyweb.properties.PropertyImageRepository;
import com.mangalorehomes.propertyweb.properties.PropertyRepository;
import com.mangalorehomes.propertyweb.publicapi.dto.PropertySummary;
import com.mangalorehomes.propertyweb.saved.SavedPropertyEntity;
import com.mangalorehomes.propertyweb.saved.SavedPropertyRepository;
import com.mangalorehomes.propertyweb.security.SecurityUser;
import com.mangalorehomes.propertyweb.users.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/account")
@PreAuthorize("isAuthenticated()")
@Transactional
public class AccountController {
  private final SavedPropertyRepository saved;
  private final PropertyRepository properties;
  private final PropertyImageRepository propertyImages;
  private final EnquiryRepository enquiries;
  private final NotificationRepository notifications;
  private final UserRepository users;
  private final PasswordEncoder passwordEncoder;

  public AccountController(
      SavedPropertyRepository saved,
      PropertyRepository properties,
      PropertyImageRepository propertyImages,
      EnquiryRepository enquiries,
      NotificationRepository notifications,
      UserRepository users,
      PasswordEncoder passwordEncoder) {
    this.saved = saved;
    this.properties = properties;
    this.propertyImages = propertyImages;
    this.enquiries = enquiries;
    this.notifications = notifications;
    this.users = users;
    this.passwordEncoder = passwordEncoder;
  }

  // ── Profile ─────────────────────────────────────────────────────────

  @GetMapping("/profile")
  @Transactional(readOnly = true)
  public Map<String, Object> getProfile(@AuthenticationPrincipal SecurityUser principal) {
    var u = users.findById(principal.id()).orElseThrow();
    var m = new LinkedHashMap<String, Object>();
    m.put("id", u.id);
    m.put("fullName", u.fullName);
    m.put("email", u.email);
    m.put("phone", u.phone);
    m.put("businessName", u.businessName);
    m.put("role", u.role != null ? u.role.name() : null);
    m.put("isVerified", u.isVerified);
    m.put("createdAt", u.createdAt);
    return m;
  }

  public record UpdateProfileRequest(
      @NotBlank(message = "Name is required.")
      @Size(min = 2, message = "Name must be at least 2 characters.")
      String fullName,

      @Pattern(regexp = "^$|^\\d{10,15}$", message = "Phone must be 10–15 digits.")
      String phone
  ) {}

  @PutMapping("/profile")
  public Map<String, Object> updateProfile(
      @AuthenticationPrincipal SecurityUser principal,
      @Valid @RequestBody UpdateProfileRequest req) {
    var u = users.findById(principal.id()).orElseThrow();
    u.fullName = req.fullName().trim();
    u.phone = (req.phone() == null || req.phone().isBlank()) ? u.phone : req.phone().trim();
    u.updatedAt = Instant.now();
    users.save(u);
    return getProfile(principal);
  }

  public record ChangePasswordRequest(
      @NotBlank(message = "Current password is required.")
      String currentPassword,

      @NotBlank(message = "New password is required.")
      @Size(min = 8, message = "New password must be at least 8 characters.")
      String newPassword
  ) {}

  @PostMapping("/profile/change-password")
  public Map<String, Object> changePassword(
      @AuthenticationPrincipal SecurityUser principal,
      @Valid @RequestBody ChangePasswordRequest req) {
    var u = users.findById(principal.id()).orElseThrow();
    if (!passwordEncoder.matches(req.currentPassword(), u.passwordHash)) {
      throw new IllegalArgumentException("Current password is incorrect.");
    }
    u.passwordHash = passwordEncoder.encode(req.newPassword());
    u.updatedAt = Instant.now();
    users.save(u);
    return Map.of("message", "Password updated");
  }

  @GetMapping("/saved")
  @Transactional(readOnly = true)
  public PageResponse<PropertySummary> savedList(
      @AuthenticationPrincipal SecurityUser principal,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "12") int size) {
    var pageable =
        PageRequest.of(
            Math.max(0, page),
            Math.min(50, Math.max(1, size)),
            Sort.by(Sort.Direction.DESC, "createdAt"));
    var rows = saved.findByUserIdOrderByCreatedAtDesc(principal.id(), pageable);
    var content =
        rows.getContent().stream()
            .map(s -> s.property)
            .filter(
                p ->
                    p.approvalStatus == ApprovalStatus.approved
                        && p.listingStatus == ListingStatus.active)
            .map(this::toSummary)
            .toList();
    return new PageResponse<>(
        content, rows.getTotalElements(), rows.getTotalPages(), rows.getNumber(), rows.getSize());
  }

  @GetMapping("/saved/check")
  @Transactional(readOnly = true)
  public java.util.Map<String, Object> savedCheck(
      @AuthenticationPrincipal SecurityUser principal, @RequestParam Long propertyId) {
    return java.util.Map.of(
        "saved", saved.existsByUserIdAndPropertyId(principal.id(), propertyId));
  }

  @PostMapping("/saved/{propertyId}")
  public Object addSaved(
      @AuthenticationPrincipal SecurityUser principal, @PathVariable Long propertyId) {
    var p =
        properties
            .findById(propertyId)
            .orElseThrow(() -> new IllegalArgumentException("Property not found."));
    if (p.approvalStatus != ApprovalStatus.approved || p.listingStatus != ListingStatus.active) {
      throw new IllegalArgumentException("Only live listings can be saved.");
    }
    if (saved.existsByUserIdAndPropertyId(principal.id(), propertyId)) {
      return java.util.Map.of("saved", true, "propertyId", propertyId);
    }
    var row = new SavedPropertyEntity();
    row.user = users.getReferenceById(principal.id());
    row.property = p;
    row.createdAt = Instant.now();
    saved.save(row);
    return java.util.Map.of("saved", true, "propertyId", propertyId);
  }

  @DeleteMapping("/saved/{propertyId}")
  public Object removeSaved(
      @AuthenticationPrincipal SecurityUser principal, @PathVariable Long propertyId) {
    saved.findByUserIdAndPropertyId(principal.id(), propertyId).ifPresent(saved::delete);
    return java.util.Map.of("saved", false, "propertyId", propertyId);
  }

  @GetMapping("/enquiries")
  @Transactional(readOnly = true)
  public PageResponse<?> myEnquiries(
      @AuthenticationPrincipal SecurityUser principal,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "12") int size) {
    var pageable =
        PageRequest.of(
            Math.max(0, page),
            Math.min(50, Math.max(1, size)),
            Sort.by(Sort.Direction.DESC, "createdAt"));
    var rows = enquiries.findByUser_IdOrderByCreatedAtDesc(principal.id(), pageable);
    var content =
        rows.getContent().stream()
            .map(
                e ->
                    new LinkedHashMap<String, Object>() {
                      {
                        put("id", e.id);
                        put("status", e.status == null ? null : e.status.name());
                        put("createdAt", e.createdAt);
                        put("propertyId", e.property.id);
                        put("propertyTitle", e.property.title);
                        put("propertySlug", e.property.slug);
                        put("message", e.message);
                      }
                    })
            .toList();
    return new PageResponse<>(
        content, rows.getTotalElements(), rows.getTotalPages(), rows.getNumber(), rows.getSize());
  }

  @GetMapping("/notifications")
  @Transactional(readOnly = true)
  public PageResponse<?> notificationList(
      @AuthenticationPrincipal SecurityUser principal,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    var pageable =
        PageRequest.of(Math.max(0, page), Math.min(50, Math.max(1, size)), Sort.by(Sort.Direction.DESC, "createdAt"));
    var rows = notifications.findByUserIdOrderByCreatedAtDesc(principal.id(), pageable);
    var content =
        rows.getContent().stream()
            .map(
                n ->
                    new LinkedHashMap<String, Object>() {
                      {
                        put("id", n.id);
                        put("title", n.title);
                        put("message", n.message);
                        put("read", n.isRead);
                        put("createdAt", n.createdAt);
                      }
                    })
            .toList();
    return new PageResponse<>(
        content, rows.getTotalElements(), rows.getTotalPages(), rows.getNumber(), rows.getSize());
  }

  @GetMapping("/notifications/unread-count")
  @Transactional(readOnly = true)
  public java.util.Map<String, Long> unreadCount(@AuthenticationPrincipal SecurityUser principal) {
    return java.util.Map.of("count", notifications.countByUserIdAndIsReadIsFalse(principal.id()));
  }

  @PostMapping("/notifications/{id}/read")
  public Object markRead(
      @AuthenticationPrincipal SecurityUser principal, @PathVariable Long id) {
    int n = notifications.markRead(id, principal.id());
    if (n == 0) throw new IllegalArgumentException("Not found.");
    return java.util.Map.of("id", id, "read", true);
  }

  @PostMapping("/notifications/read-all")
  public Object markAllRead(@AuthenticationPrincipal SecurityUser principal) {
    int n = notifications.markAllRead(principal.id());
    return java.util.Map.of("updated", n);
  }

  private PropertySummary toSummary(com.mangalorehomes.propertyweb.properties.PropertyEntity r) {
    var imgs = propertyImages.findAllByPropertyIdOrderBySortOrderAscIdAsc(r.id);
    String thumbUrl = imgs.isEmpty() ? null : imgs.get(0).imageUrl;
    return new PropertySummary(
        r.id,
        r.title,
        r.slug,
        r.purpose.name(),
        r.propertyType.name,
        r.propertyType.slug,
        r.locality == null ? null : r.locality.name,
        r.locality == null ? null : r.locality.slug,
        r.price,
        r.bedrooms,
        r.bathrooms,
        r.areaSqft,
        r.isFeatured,
        r.isVerified,
        r.locality != null && r.locality.isFeatured,
        thumbUrl);
  }
}
