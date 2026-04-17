package com.mangalorehomes.propertyweb.seller;

import com.mangalorehomes.propertyweb.api.PageResponse;
import com.mangalorehomes.propertyweb.catalog.LocalityEntity;
import com.mangalorehomes.propertyweb.catalog.LocalityRepository;
import com.mangalorehomes.propertyweb.catalog.PropertyTypeEntity;
import com.mangalorehomes.propertyweb.catalog.PropertyTypeRepository;
import com.mangalorehomes.propertyweb.properties.ApprovalStatus;
import com.mangalorehomes.propertyweb.properties.PropertyEntity;
import com.mangalorehomes.propertyweb.properties.PropertyImageEntity;
import com.mangalorehomes.propertyweb.properties.PropertyImageRepository;
import com.mangalorehomes.propertyweb.properties.PropertyPurpose;
import com.mangalorehomes.propertyweb.properties.PropertyRepository;
import com.mangalorehomes.propertyweb.security.SecurityUser;
import com.mangalorehomes.propertyweb.security.UserRole;
import com.mangalorehomes.propertyweb.seller.dto.SellerCreatePropertyRequest;
import com.mangalorehomes.propertyweb.users.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
@RequestMapping("/api/seller")
@Transactional
public class SellerController {
  private final PropertyRepository properties;
  private final UserRepository users;
  private final PropertyTypeRepository types;
  private final LocalityRepository localities;
  private final PropertyImageRepository images;

  public SellerController(
      PropertyRepository properties,
      UserRepository users,
      PropertyTypeRepository types,
      LocalityRepository localities,
      PropertyImageRepository images) {
    this.properties = properties;
    this.users = users;
    this.types = types;
    this.localities = localities;
    this.images = images;
  }

  @PreAuthorize("hasAnyRole('OWNER','AGENT','ADMIN')")
  @GetMapping("/properties")
  public PageResponse<?> myProperties(
      @AuthenticationPrincipal SecurityUser principal,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "12") int size,
      @RequestParam(required = false) String q) {
    var pageable =
        PageRequest.of(
            Math.max(0, page),
            Math.min(50, Math.max(1, size)),
            Sort.by(Sort.Direction.DESC, "createdAt"));
    var rowPage =
        (q == null || q.isBlank())
            ? properties.findByUserIdOrderByCreatedAtDesc(principal.id(), pageable)
            : properties.findByUserIdAndTitleContainingIgnoreCase(principal.id(), q.trim(), pageable);
    var content =
        rowPage.getContent().stream()
            .map(
                p ->
                    new java.util.LinkedHashMap<String, Object>() {
                      {
                        put("id", p.id);
                        put("title", p.title);
                        put("slug", p.slug);
                        put("purpose", p.purpose == null ? null : p.purpose.name());
                        put("price", p.price);
                        put("locality", p.locality == null ? null : p.locality.name);
                        put("localitySlug", p.locality == null ? null : p.locality.slug);
                        put("approvalStatus", p.approvalStatus == null ? null : p.approvalStatus.name());
                        put("listingStatus", p.listingStatus == null ? null : p.listingStatus.name());
                        put("rejectionReason", p.rejectionReason);
                        put("isFeatured", p.isFeatured);
                      }
                    })
            .toList();
    return new PageResponse<>(
        content,
        rowPage.getTotalElements(),
        rowPage.getTotalPages(),
        rowPage.getNumber(),
        rowPage.getSize());
  }

  @PreAuthorize("hasAnyRole('OWNER','AGENT','ADMIN')")
  @GetMapping("/properties/{id}")
  public Object myProperty(@AuthenticationPrincipal SecurityUser principal, @PathVariable Long id) {
    var p = loadEditableProperty(principal, id);
    var imgs = images.findAllByPropertyIdOrderBySortOrderAscIdAsc(p.id).stream().map(i -> i.imageUrl).toList();
    return new java.util.LinkedHashMap<String, Object>() {
      {
        put("id", p.id);
        put("title", p.title);
        put("slug", p.slug);
        put("purpose", p.purpose == null ? null : p.purpose.name());
        put("propertyTypeId", p.propertyType == null ? null : p.propertyType.id);
        put("propertyTypeSlug", p.propertyType == null ? null : p.propertyType.slug);
        put("localityId", p.locality == null ? null : p.locality.id);
        put("localitySlug", p.locality == null ? null : p.locality.slug);
        put("price", p.price);
        put("securityDeposit", p.securityDeposit);
        put("description", p.description);
        put("addressLine", p.addressLine);
        put("city", p.city);
        put("pincode", p.pincode);
        put("bedrooms", p.bedrooms);
        put("bathrooms", p.bathrooms);
        put("areaSqft", p.areaSqft);
        put("parkingCount", p.parkingCount);
        put("furnishingStatus", p.furnishingStatus);
        put("possessionStatus", p.possessionStatus);
        put("extraFields", p.extraFields);
        put("approvalStatus", p.approvalStatus == null ? null : p.approvalStatus.name());
        put("listingStatus", p.listingStatus == null ? null : p.listingStatus.name());
        put("rejectionReason", p.rejectionReason);
        put("imageUrls", imgs);
        put("createdAt", p.createdAt);
        put("updatedAt", p.updatedAt);
      }
    };
  }

  @PreAuthorize("hasAnyRole('OWNER','AGENT','ADMIN')")
  @PostMapping("/properties")
  public Object createProperty(
      @AuthenticationPrincipal SecurityUser principal, @Valid @RequestBody SellerCreatePropertyRequest req) {
    if (principal.role() == UserRole.buyer) throw new IllegalArgumentException("Not allowed");

    var user = users.findById(principal.id()).orElseThrow();
    var type = types.findById(req.propertyTypeId()).orElseThrow(() -> new IllegalArgumentException("Invalid property type."));
    var locality = req.localityId() == null ? null : localities.findById(req.localityId()).orElseThrow();

    var purpose = parsePurposeForPosting(req.purpose());
    var typeSlug = type.slug == null ? "" : type.slug.trim().toLowerCase(Locale.ROOT);
    validateTypeSpecific(purpose, typeSlug, req);

    var p = new PropertyEntity();
    p.user = user;
    p.title = req.title().trim();
    p.slug = uniqueSlug(req.slug(), p.title, null);
    p.purpose = purpose;
    p.propertyType = type;
    p.locality = locality;
    p.price = req.price() == null ? 0L : req.price();
    p.securityDeposit = req.securityDeposit();
    p.description = req.description();
    p.addressLine = req.addressLine();
    p.city = req.city();
    p.pincode = req.pincode();
    p.bedrooms = req.bedrooms();
    p.bathrooms = req.bathrooms();
    p.areaSqft = req.areaSqft();
    p.parkingCount = req.parkingCount();
    p.furnishingStatus = req.furnishingStatus();
    p.possessionStatus = req.possessionStatus();
    p.extraFields = new java.util.LinkedHashMap<>(toMap(req.extraFields()));
    p.approvalStatus = ApprovalStatus.pending;
    p.isVerified = false;
    p.createdAt = Instant.now();
    p.updatedAt = Instant.now();

    p = properties.save(p);
    return java.util.Map.of("id", p.id, "status", p.approvalStatus.name());
  }

  @PreAuthorize("hasAnyRole('OWNER','AGENT','ADMIN')")
  @PutMapping("/properties/{id}")
  public Object updateProperty(
      @AuthenticationPrincipal SecurityUser principal,
      @PathVariable Long id,
      @Valid @RequestBody SellerCreatePropertyRequest req) {
    if (principal.role() == UserRole.buyer) throw new IllegalArgumentException("Not allowed");

    var p = loadEditableProperty(principal, id);

    var type = types.findById(req.propertyTypeId()).orElseThrow(() -> new IllegalArgumentException("Invalid property type."));
    var locality = req.localityId() == null ? null : localities.findById(req.localityId()).orElseThrow();
    var purpose = parsePurposeForPosting(req.purpose());
    var typeSlug = type.slug == null ? "" : type.slug.trim().toLowerCase(Locale.ROOT);

    if (principal.role() != UserRole.admin && p.approvalStatus == ApprovalStatus.approved) {
      if (isMajorListingChange(p, req, type, locality, purpose)) {
        throw new IllegalArgumentException(
            "That change affects price, location, size, or layout and needs admin review. You can still edit description, title, furnishing, and possession for live listings.");
      }
      validateTypeSpecific(purpose, typeSlug, req);
      p.title = req.title().trim();
      p.description = req.description();
      p.furnishingStatus = req.furnishingStatus();
      p.possessionStatus = req.possessionStatus();
      p.updatedAt = Instant.now();
      properties.save(p);
      return java.util.Map.of("id", p.id, "approvalStatus", p.approvalStatus.name());
    }

    validateTypeSpecific(purpose, typeSlug, req);

    p.title = req.title().trim();
    p.slug = uniqueSlug(req.slug(), p.title, p.id);
    p.purpose = purpose;
    p.propertyType = type;
    p.locality = locality;
    p.price = req.price() == null ? 0L : req.price();
    p.securityDeposit = req.securityDeposit();
    p.description = req.description();
    p.addressLine = req.addressLine();
    p.city = req.city();
    p.pincode = req.pincode();
    p.bedrooms = req.bedrooms();
    p.bathrooms = req.bathrooms();
    p.areaSqft = req.areaSqft();
    p.parkingCount = req.parkingCount();
    p.furnishingStatus = req.furnishingStatus();
    p.possessionStatus = req.possessionStatus();
    p.extraFields = new java.util.LinkedHashMap<>(toMap(req.extraFields()));

    if (principal.role() != UserRole.admin) {
      p.approvalStatus = ApprovalStatus.pending;
      p.rejectionReason = null;
      p.isVerified = false;
    }
    p.updatedAt = Instant.now();
    properties.save(p);

    return java.util.Map.of("id", p.id, "approvalStatus", p.approvalStatus.name());
  }

  @PreAuthorize("hasAnyRole('OWNER','AGENT','ADMIN')")
  @DeleteMapping("/properties/{id}")
  public Object deleteProperty(@AuthenticationPrincipal SecurityUser principal, @PathVariable Long id) {
    var p = loadEditableProperty(principal, id);
    properties.delete(p);
    return java.util.Map.of("id", id, "deleted", true);
  }

  @PreAuthorize("hasAnyRole('OWNER','AGENT','ADMIN')")
  @PostMapping("/properties/{id}/resubmit")
  public Object resubmit(@AuthenticationPrincipal SecurityUser principal, @PathVariable Long id) {
    var p = loadEditableProperty(principal, id);
    if (p.approvalStatus != ApprovalStatus.rejected) {
      throw new IllegalArgumentException("Only rejected listings can be resubmitted.");
    }
    p.approvalStatus = ApprovalStatus.pending;
    p.rejectionReason = null;
    p.isVerified = false;
    p.updatedAt = Instant.now();
    properties.save(p);
    return java.util.Map.of("id", p.id, "approvalStatus", p.approvalStatus.name());
  }

  public record AddImagesRequest(List<@NotBlank String> urls) {}

  @PreAuthorize("hasAnyRole('OWNER','AGENT','ADMIN')")
  @PostMapping("/properties/{id}/images")
  public Object addImages(
      @AuthenticationPrincipal SecurityUser principal,
      @PathVariable Long id,
      @Valid @RequestBody AddImagesRequest req) {
    var p = loadEditableProperty(principal, id);
    if (req.urls() == null || req.urls().isEmpty()) throw new IllegalArgumentException("No urls provided.");

    int baseSort = (int) images.countByPropertyId(p.id);
    int i = 0;
    for (var raw : req.urls()) {
      var url = raw == null ? "" : raw.trim();
      if (url.isBlank()) continue;
      var img = new PropertyImageEntity();
      img.property = p;
      img.imageUrl = url;
      img.altText = null;
      img.sortOrder = baseSort + i;
      img.createdAt = Instant.now();
      images.save(img);
      i += 1;
    }
    var imgs = images.findAllByPropertyIdOrderBySortOrderAscIdAsc(p.id).stream().map(x -> x.imageUrl).toList();
    return java.util.Map.of("id", p.id, "imageUrls", imgs);
  }

  private PropertyEntity loadEditableProperty(SecurityUser principal, Long id) {
    if (principal.role() == UserRole.admin) {
      return properties.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
    }
    return properties
        .findByIdAndUserId(id, principal.id())
        .orElseThrow(() -> new IllegalArgumentException("Not found"));
  }

  private static PropertyPurpose parsePurposeForPosting(String raw) {
    var reqPurposeRaw = raw == null ? "" : raw.trim().toLowerCase(Locale.ROOT);
    PropertyPurpose purpose;
    try {
      purpose = PropertyPurpose.valueOf(reqPurposeRaw);
    } catch (Exception e) {
      throw new IllegalArgumentException("Invalid purpose. Use sell/rent.");
    }
    if (purpose == PropertyPurpose.buy) {
      throw new IllegalArgumentException("Invalid purpose for posting. Use sell/rent.");
    }
    return purpose;
  }

  private static void validateTypeSpecific(
      PropertyPurpose purpose, String typeSlug, SellerCreatePropertyRequest req) {
    if (purpose == PropertyPurpose.rent
        && ("land".equals(typeSlug) || "agricultural-land".equals(typeSlug))) {
      throw new IllegalArgumentException("Rent is only allowed for Residential or Commercial.");
    }

    if (req.price() == null || req.price() <= 0) throw new IllegalArgumentException("Price is required.");

    Map<String, Object> extras = toMap(req.extraFields());

    if ("residential".equals(typeSlug)) {
      if (req.bedrooms() == null || req.bedrooms() <= 0) throw new IllegalArgumentException("Bedrooms required.");
      if (req.bathrooms() == null || req.bathrooms() <= 0) throw new IllegalArgumentException("Bathrooms required.");
      if (req.areaSqft() == null || req.areaSqft() <= 0) throw new IllegalArgumentException("Built-up area (sqft) required for residential.");
    } else if ("commercial".equals(typeSlug)) {
      if (req.areaSqft() == null || req.areaSqft() <= 0) throw new IllegalArgumentException("Built-up area (sqft) required.");
      if (req.parkingCount() == null || req.parkingCount() <= 0) throw new IllegalArgumentException("Parking required.");
    } else if ("land".equals(typeSlug)) {
      if (req.areaSqft() == null || req.areaSqft() <= 0) throw new IllegalArgumentException("Plot size (sqft) required.");
      requireExtra(extras, "roadAccess", "Road access is required.");
      requireExtra(extras, "surveyNo", "Survey no. is required.");
    } else if ("agricultural-land".equals(typeSlug)) {
      if (req.areaSqft() == null || req.areaSqft() <= 0) throw new IllegalArgumentException("Land size (sqft) required.");
      requireExtra(extras, "waterSource", "Water source is required.");
      requireExtra(extras, "soilType", "Soil type is required.");
    }
  }

  private static void requireExtra(Map<String, Object> extras, String key, String message) {
    var v = extras.get(key);
    if (v == null) throw new IllegalArgumentException(message);
    if (v instanceof String s) {
      if (s.trim().isBlank()) throw new IllegalArgumentException(message);
      return;
    }
    // Accept non-string types as long as they're non-null
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> toMap(Object extraFields) {
    if (extraFields instanceof Map<?, ?> m) {
      return (Map<String, Object>) m;
    }
    return java.util.Map.of();
  }

  private String uniqueSlug(String requested, String title, Long currentId) {
    String base =
        (requested == null || requested.trim().isBlank())
            ? slugify(title)
            : slugify(requested.trim());
    if (base.isBlank()) base = "property";
    String slug = base;
    int i = 2;
    while (true) {
      var existing = properties.findBySlug(slug).orElse(null);
      if (existing == null) return slug;
      if (currentId != null && Objects.equals(existing.id, currentId)) return slug;
      slug = base + "-" + i;
      i += 1;
    }
  }

  private static String slugify(String v) {
    var s = v == null ? "" : v.toLowerCase(Locale.ROOT).trim();
    s = s.replaceAll("[^a-z0-9]+", "-");
    s = s.replaceAll("(^-+|-+$)", "");
    return s;
  }

  private static boolean isMajorListingChange(
      PropertyEntity p,
      SellerCreatePropertyRequest req,
      PropertyTypeEntity type,
      LocalityEntity locality,
      PropertyPurpose purpose) {
    if (!Objects.equals(p.propertyType.id, type.id)) return true;
    Long locId = p.locality == null ? null : p.locality.id;
    Long reqLoc = locality == null ? null : locality.id;
    if (!Objects.equals(locId, reqLoc)) return true;
    if (p.purpose != purpose) return true;
    long reqPrice = req.price() == null ? 0L : req.price();
    if (!Objects.equals(p.price, reqPrice)) return true;
    if (!Objects.equals(p.securityDeposit, req.securityDeposit())) return true;
    if (!Objects.equals(p.bedrooms, req.bedrooms())) return true;
    if (!Objects.equals(p.bathrooms, req.bathrooms())) return true;
    if (!Objects.equals(p.areaSqft, req.areaSqft())) return true;
    if (!Objects.equals(p.parkingCount, req.parkingCount())) return true;
    if (!Objects.equals(trimOrNull(p.addressLine), trimOrNull(req.addressLine()))) return true;
    if (!Objects.equals(trimOrNull(p.city), trimOrNull(req.city()))) return true;
    if (!Objects.equals(trimOrNull(p.pincode), trimOrNull(req.pincode()))) return true;
    return !extraFieldsDeepEquals(p.extraFields, req.extraFields());
  }

  private static String trimOrNull(String s) {
    if (s == null) return null;
    var t = s.trim();
    return t.isEmpty() ? null : t;
  }

  @SuppressWarnings("unchecked")
  private static boolean extraFieldsDeepEquals(Object a, Object b) {
    Map<String, Object> ma = toMap(a);
    Map<String, Object> mb = toMap(b);
    return ma.equals(mb);
  }
}

