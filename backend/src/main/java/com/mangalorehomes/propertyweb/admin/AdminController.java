package com.mangalorehomes.propertyweb.admin;

import com.mangalorehomes.propertyweb.catalog.PropertyAmenityLookup;
import com.mangalorehomes.propertyweb.notifications.InAppNotificationService;
import com.mangalorehomes.propertyweb.notifications.MailNotificationService;
import com.mangalorehomes.propertyweb.properties.ApprovalStatus;
import com.mangalorehomes.propertyweb.properties.PropertyImageRepository;
import com.mangalorehomes.propertyweb.properties.PropertyRepository;
import com.mangalorehomes.propertyweb.security.UserRole;
import com.mangalorehomes.propertyweb.users.UserRepository;
import com.mangalorehomes.propertyweb.enquiries.EnquiryRepository;
import com.mangalorehomes.propertyweb.catalog.LocalityRepository;
import com.mangalorehomes.propertyweb.catalog.PropertyTypeRepository;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
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
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
  private final PropertyRepository properties;
  private final UserRepository users;
  private final EnquiryRepository enquiries;
  private final PropertyImageRepository propertyImages;
  private final PropertyAmenityLookup amenityLookup;
  private final InAppNotificationService inApp;
  private final MailNotificationService mail;
  private final PropertyTypeRepository propertyTypes;
  private final LocalityRepository localities;

  public AdminController(
      PropertyRepository properties,
      UserRepository users,
      EnquiryRepository enquiries,
      PropertyImageRepository propertyImages,
      PropertyAmenityLookup amenityLookup,
      InAppNotificationService inApp,
      MailNotificationService mail,
      PropertyTypeRepository propertyTypes,
      LocalityRepository localities) {
    this.properties = properties;
    this.users = users;
    this.enquiries = enquiries;
    this.propertyImages = propertyImages;
    this.amenityLookup = amenityLookup;
    this.inApp = inApp;
    this.mail = mail;
    this.propertyTypes = propertyTypes;
    this.localities = localities;
  }

  @GetMapping("/properties")
  @Transactional(readOnly = true)
  public List<?> properties(@RequestParam(required = false) String status) {
    var all = properties.findAll();
    var filtered =
        (status == null || status.isBlank())
            ? all
            : all.stream()
                .filter(p -> p.approvalStatus.name().equalsIgnoreCase(status.trim()))
                .toList();

    return filtered.stream()
        .map(
            p -> {
              var m = new LinkedHashMap<String, Object>();
              m.put("id", p.id);
              m.put("title", p.title);
              m.put("slug", p.slug);
              m.put("purpose", p.purpose == null ? null : p.purpose.name());
              m.put("price", p.price);
              m.put("locality", p.locality == null ? null : p.locality.name);
              m.put("localitySlug", p.locality == null ? null : p.locality.slug);
              m.put("propertyType", p.propertyType == null ? null : p.propertyType.name);
              m.put("propertyTypeSlug", p.propertyType == null ? null : p.propertyType.slug);
              m.put("bedrooms", p.bedrooms);
              m.put("bathrooms", p.bathrooms);
              m.put("areaSqft", p.areaSqft);
              m.put("approvalStatus", p.approvalStatus == null ? null : p.approvalStatus.name());
              m.put("listingStatus", p.listingStatus == null ? null : p.listingStatus.name());
              m.put("isFeatured", p.isFeatured);
              m.put("rejectionReason", p.rejectionReason);
              m.put("createdAt", p.createdAt);
              // Seller info
              m.put("sellerId", p.user == null ? null : p.user.id);
              m.put("sellerName", p.user == null ? null : p.user.fullName);
              m.put("sellerEmail", p.user == null ? null : p.user.email);
              m.put("sellerPhone", p.user == null ? null : p.user.phone);
              m.put("sellerRole", p.user == null || p.user.role == null ? null : p.user.role.name());
              // First image thumbnail
              var imgs = propertyImages.findAllByPropertyIdOrderBySortOrderAscIdAsc(p.id);
              m.put("thumbUrl", imgs.isEmpty() ? null : imgs.get(0).imageUrl);
              m.put("imageCount", imgs.size());
              return m;
            })
        .toList();
  }

  @GetMapping("/properties/{id}")
  @Transactional(readOnly = true)
  public Object property(@PathVariable Long id) {
    var p = properties.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
    var imgs = propertyImages.findAllByPropertyIdOrderBySortOrderAscIdAsc(p.id);
    var amenityNames = amenityLookup.amenityNamesForProperty(p.id);

    var m = new LinkedHashMap<String, Object>();
    m.put("id", p.id);
    m.put("title", p.title);
    m.put("slug", p.slug);
    m.put("purpose", p.purpose == null ? null : p.purpose.name());
    m.put("price", p.price);
    m.put("securityDeposit", p.securityDeposit);
    m.put("description", p.description);
    m.put("city", p.city);
    m.put("addressLine", p.addressLine);
    m.put("pincode", p.pincode);
    m.put("propertyType", p.propertyType == null ? null : p.propertyType.name);
    m.put("propertyTypeSlug", p.propertyType == null ? null : p.propertyType.slug);
    m.put("locality", p.locality == null ? null : p.locality.name);
    m.put("localitySlug", p.locality == null ? null : p.locality.slug);
    m.put("bedrooms", p.bedrooms);
    m.put("bathrooms", p.bathrooms);
    m.put("balconies", p.balconies);
    m.put("areaSqft", p.areaSqft);
    m.put("carpetAreaSqft", p.carpetAreaSqft);
    m.put("furnishingStatus", p.furnishingStatus);
    m.put("parkingCount", p.parkingCount);
    m.put("propertyAge", p.propertyAge);
    m.put("floorNumber", p.floorNumber);
    m.put("totalFloors", p.totalFloors);
    m.put("facing", p.facing);
    m.put("possessionStatus", p.possessionStatus);
    m.put("ownershipType", p.ownershipType);
    m.put("approvalStatus", p.approvalStatus == null ? null : p.approvalStatus.name());
    m.put("listingStatus", p.listingStatus == null ? null : p.listingStatus.name());
    m.put("rejectionReason", p.rejectionReason);
    m.put("isFeatured", p.isFeatured);
    m.put("isVerified", p.isVerified);
    m.put("viewsCount", p.viewsCount);
    m.put("createdAt", p.createdAt);
    m.put("updatedAt", p.updatedAt);
    // Seller details
    m.put("sellerId", p.user == null ? null : p.user.id);
    m.put("sellerName", p.user == null ? null : p.user.fullName);
    m.put("sellerEmail", p.user == null ? null : p.user.email);
    m.put("sellerPhone", p.user == null ? null : p.user.phone);
    m.put("sellerBusinessName", p.user == null ? null : p.user.businessName);
    m.put("sellerRole", p.user == null || p.user.role == null ? null : p.user.role.name());
    // Images
    m.put("images", imgs.stream().map(img -> {
      var im = new LinkedHashMap<String, Object>();
      im.put("id", img.id);
      im.put("imageUrl", img.imageUrl);
      im.put("altText", img.altText);
      im.put("sortOrder", img.sortOrder);
      return im;
    }).toList());
    // Amenities
    m.put("amenities", amenityNames);
    return m;
  }

  @GetMapping("/properties/{id}/enquiries")
  @Transactional(readOnly = true)
  public List<?> propertyEnquiries(@PathVariable Long id) {
    properties.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
    return enquiries.findAllByPropertyIdOrderByCreatedAtDesc(id).stream()
        .map(
            e -> {
              var m = new LinkedHashMap<String, Object>();
              m.put("id", e.id);
              m.put("buyerName", e.name);
              m.put("buyerEmail", e.email);
              m.put("buyerPhone", e.phone);
              m.put("message", e.message);
              m.put("status", e.status == null ? null : e.status.name());
              m.put("source", e.source);
              m.put("createdAt", e.createdAt);
              m.put("updatedAt", e.updatedAt);
              m.put("assignedSellerId", e.assignedSeller == null ? null : e.assignedSeller.id);
              m.put("assignedSellerName", e.assignedSeller == null ? null : e.assignedSeller.fullName);
              m.put("assignedAt", e.assignedAt);
              return m;
            })
        .toList();
  }

  @PostMapping("/properties/{id}/approve")
  public Object approve(@PathVariable Long id) {
    var p = properties.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
    p.approvalStatus = ApprovalStatus.approved;
    p.rejectionReason = null;
    p.isVerified = true;
    p.expiresAt = Instant.now().plus(java.time.Duration.ofDays(90));
    p.updatedAt = Instant.now();
    properties.save(p);

    // Notify the seller that their listing is now live.
    if (p.user != null) {
      inApp.notifyUser(
          p.user.id,
          "Listing approved",
          "Your listing \"" + p.title + "\" has been approved and is now live on the site.");
      mail.notifySellerListingApproved(p.user.email, p.title, p.slug);
    }
    return Map.of("id", p.id, "approvalStatus", p.approvalStatus.name());
  }

  public record RejectRequest(@NotBlank String reason) {}

  @PostMapping("/properties/{id}/reject")
  public Object reject(@PathVariable Long id, @RequestBody RejectRequest req) {
    var p = properties.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
    p.approvalStatus = ApprovalStatus.rejected;
    p.rejectionReason = req.reason();
    p.isVerified = false;
    p.updatedAt = Instant.now();
    properties.save(p);

    // Notify the seller with the rejection reason so they can fix and resubmit.
    if (p.user != null) {
      inApp.notifyUser(
          p.user.id,
          "Listing rejected",
          "Your listing \"" + p.title + "\" was rejected. Reason: " + req.reason()
              + ". Edit and resubmit from Seller → My Properties.");
      mail.notifySellerListingRejected(p.user.email, p.title, req.reason());
    }
    return Map.of("id", p.id, "approvalStatus", p.approvalStatus.name());
  }

  // ── Admin edit property (full power — can change any field) ───────────

  @PutMapping("/properties/{id}")
  public Object editProperty(@PathVariable Long id, @RequestBody Map<String, Object> body) {
    var p = properties.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));

    if (body.containsKey("title")) p.title = str(body.get("title"));
    if (body.containsKey("description")) p.description = str(body.get("description"));
    if (body.containsKey("price")) p.price = longVal(body.get("price"));
    if (body.containsKey("bedrooms")) p.bedrooms = intVal(body.get("bedrooms"));
    if (body.containsKey("bathrooms")) p.bathrooms = intVal(body.get("bathrooms"));
    if (body.containsKey("areaSqft")) p.areaSqft = intVal(body.get("areaSqft"));
    if (body.containsKey("parkingCount")) p.parkingCount = intVal(body.get("parkingCount"));
    if (body.containsKey("addressLine")) p.addressLine = str(body.get("addressLine"));
    if (body.containsKey("city")) p.city = str(body.get("city"));
    if (body.containsKey("pincode")) p.pincode = str(body.get("pincode"));
    if (body.containsKey("furnishingStatus")) p.furnishingStatus = str(body.get("furnishingStatus"));
    if (body.containsKey("possessionStatus")) p.possessionStatus = str(body.get("possessionStatus"));
    if (body.containsKey("isFeatured")) p.isFeatured = Boolean.TRUE.equals(body.get("isFeatured"));
    if (body.containsKey("isVerified")) p.isVerified = Boolean.TRUE.equals(body.get("isVerified"));
    if (body.containsKey("propertyTypeId")) {
      var typeId = longVal(body.get("propertyTypeId"));
      if (typeId != null) p.propertyType = propertyTypes.findById(typeId).orElse(p.propertyType);
    }
    if (body.containsKey("localityId")) {
      var locId = longVal(body.get("localityId"));
      if (locId != null) p.locality = localities.findById(locId).orElse(p.locality);
    }

    p.updatedAt = Instant.now();
    properties.save(p);
    return Map.of("id", p.id, "updated", true);
  }

  // ── Admin toggle featured ─────────────────────────────────────────────

  @PostMapping("/properties/{id}/featured")
  public Object toggleFeatured(@PathVariable Long id) {
    var p = properties.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
    p.isFeatured = !p.isFeatured;
    p.updatedAt = Instant.now();
    properties.save(p);
    return Map.of("id", p.id, "isFeatured", p.isFeatured);
  }

  // ── Admin delete property (hard delete — use with caution) ────────────

  @DeleteMapping("/properties/{id}")
  public Object deleteProperty(@PathVariable Long id) {
    var p = properties.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
    // Delete images first (FK constraint)
    propertyImages.deleteAllByPropertyId(p.id);
    // Delete enquiries linked to this property
    enquiries.deleteAllByPropertyId(p.id);
    properties.delete(p);
    return Map.of("id", id, "deleted", true);
  }

  // ── Admin edit enquiry (name, phone, email, message) ───────────────

  @PutMapping("/enquiries/{id}")
  public Object editEnquiry(@PathVariable Long id, @RequestBody Map<String, Object> body) {
    var e = enquiries.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
    if (body.containsKey("name")) e.name = str(body.get("name"));
    if (body.containsKey("phone")) e.phone = str(body.get("phone"));
    if (body.containsKey("email")) e.email = str(body.get("email"));
    if (body.containsKey("message")) e.message = str(body.get("message"));
    e.updatedAt = Instant.now();
    enquiries.save(e);
    var result = new LinkedHashMap<String, Object>();
    result.put("id", e.id);
    result.put("updated", true);
    return result;
  }

  // ── Admin delete enquiry ──────────────────────────────────────────────

  @DeleteMapping("/enquiries/{id}")
  public Object deleteEnquiry(@PathVariable Long id) {
    var e = enquiries.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
    enquiries.delete(e);
    return Map.of("id", id, "deleted", true);
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  private static String str(Object v) {
    return v == null ? null : String.valueOf(v).trim();
  }

  private static Long longVal(Object v) {
    if (v == null) return null;
    if (v instanceof Number n) return n.longValue();
    try { return Long.parseLong(String.valueOf(v).trim()); } catch (NumberFormatException e) { return null; }
  }

  private static Integer intVal(Object v) {
    if (v == null) return null;
    if (v instanceof Number n) return n.intValue();
    try { return Integer.parseInt(String.valueOf(v).trim()); } catch (NumberFormatException e) { return null; }
  }

  // ── Duplicate / similar listing detection ───────────────────────────

  @GetMapping("/properties/{id}/similar")
  @Transactional(readOnly = true)
  public List<?> similarListings(@PathVariable Long id) {
    var p = properties.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
    var localityId = p.locality != null ? p.locality.id : null;
    var typeId = p.propertyType != null ? p.propertyType.id : null;
    if (localityId == null && typeId == null) return List.of();

    double priceLow = p.price * 0.85;
    double priceHigh = p.price * 1.15;
    Integer areaLow = p.areaSqft != null ? (int) (p.areaSqft * 0.9) : null;
    Integer areaHigh = p.areaSqft != null ? (int) (p.areaSqft * 1.1) : null;

    return properties.findAll().stream()
        .filter(x -> !x.id.equals(p.id))
        .filter(x -> x.approvalStatus == ApprovalStatus.approved || x.approvalStatus == ApprovalStatus.pending)
        .filter(x -> {
          boolean localityMatch = localityId != null && x.locality != null && x.locality.id.equals(localityId);
          boolean typeMatch = typeId != null && x.propertyType != null && x.propertyType.id.equals(typeId);
          return localityMatch && typeMatch;
        })
        .filter(x -> x.price >= priceLow && x.price <= priceHigh)
        .filter(x -> {
          if (areaLow == null || x.areaSqft == null) return true;
          return x.areaSqft >= areaLow && x.areaSqft <= areaHigh;
        })
        .limit(5)
        .map(x -> {
          var m = new LinkedHashMap<String, Object>();
          m.put("id", x.id);
          m.put("title", x.title);
          m.put("slug", x.slug);
          m.put("price", x.price);
          m.put("areaSqft", x.areaSqft);
          m.put("approvalStatus", x.approvalStatus != null ? x.approvalStatus.name() : null);
          m.put("locality", x.locality != null ? x.locality.name : null);
          return m;
        })
        .toList();
  }

  @GetMapping("/sellers")
  @Transactional(readOnly = true)
  public List<?> sellers() {
    return users.findAll().stream()
        .filter(u -> u.role == UserRole.owner || u.role == UserRole.agent)
        .map(
            u -> {
              var m = new LinkedHashMap<String, Object>();
              m.put("id", u.id);
              m.put("fullName", u.fullName);
              m.put("email", u.email);
              m.put("phone", u.phone);
              m.put("businessName", u.businessName);
              m.put("role", u.role.name());
              m.put("status", u.status == null ? null : u.status.name());
              return m;
            })
        .toList();
  }

  @GetMapping("/buyers")
  @Transactional(readOnly = true)
  public List<?> buyers() {
    return users.findAll().stream()
        .filter(u -> u.role == UserRole.buyer)
        .map(
            u -> {
              var m = new LinkedHashMap<String, Object>();
              m.put("id", u.id);
              m.put("fullName", u.fullName);
              m.put("email", u.email);
              m.put("phone", u.phone);
              m.put("role", u.role.name());
              m.put("status", u.status == null ? null : u.status.name());
              m.put("createdAt", u.createdAt);
              long enquiryCount = enquiries.countByUserId(u.id);
              m.put("enquiryCount", enquiryCount);
              return m;
            })
        .toList();
  }
}
