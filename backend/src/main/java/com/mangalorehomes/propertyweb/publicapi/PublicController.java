package com.mangalorehomes.propertyweb.publicapi;

import com.mangalorehomes.propertyweb.api.PageResponse;
import com.mangalorehomes.propertyweb.catalog.LocalityRepository;
import com.mangalorehomes.propertyweb.catalog.PropertyAmenityLookup;
import com.mangalorehomes.propertyweb.catalog.PropertyTypeRepository;
import com.mangalorehomes.propertyweb.content.BannerRepository;
import com.mangalorehomes.propertyweb.content.SeoPageRepository;
import com.mangalorehomes.propertyweb.content.TestimonialRepository;
import com.mangalorehomes.propertyweb.properties.ApprovalStatus;
import com.mangalorehomes.propertyweb.properties.ListingStatus;
import com.mangalorehomes.propertyweb.properties.PropertyEntity;
import com.mangalorehomes.propertyweb.properties.PropertyImageRepository;
import com.mangalorehomes.propertyweb.properties.PropertyPurpose;
import com.mangalorehomes.propertyweb.properties.PropertyRepository;
import com.mangalorehomes.propertyweb.publicapi.dto.PropertyDetails;
import com.mangalorehomes.propertyweb.publicapi.dto.PropertySummary;
import com.mangalorehomes.propertyweb.saved.SavedPropertyRepository;
import com.mangalorehomes.propertyweb.security.SecurityUser;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
@Transactional(readOnly = true)
public class PublicController {
  private final PropertyRepository properties;
  private final LocalityRepository localities;
  private final PropertyTypeRepository types;
  private final PropertyImageRepository images;
  private final PropertyAmenityLookup amenityLookup;
  private final SavedPropertyRepository saved;
  private final BannerRepository banners;
  private final TestimonialRepository testimonials;
  private final SeoPageRepository seoPages;

  public PublicController(
      PropertyRepository properties,
      LocalityRepository localities,
      PropertyTypeRepository types,
      PropertyImageRepository images,
      PropertyAmenityLookup amenityLookup,
      SavedPropertyRepository saved,
      BannerRepository banners,
      TestimonialRepository testimonials,
      SeoPageRepository seoPages) {
    this.properties = properties;
    this.localities = localities;
    this.types = types;
    this.images = images;
    this.amenityLookup = amenityLookup;
    this.saved = saved;
    this.banners = banners;
    this.testimonials = testimonials;
    this.seoPages = seoPages;
  }

  @GetMapping("/property-types")
  public List<?> propertyTypes() {
    return types.findAll().stream()
        .filter(t -> t.isActive)
        .map(t -> new java.util.LinkedHashMap<>(java.util.Map.of("id", t.id, "name", t.name, "slug", t.slug)))
        .toList();
  }

  @GetMapping("/localities")
  public List<?> localities() {
    return localities.findAll().stream()
        .filter(l -> l.isActive)
        .map(
            l ->
                new java.util.LinkedHashMap<>(
                    java.util.Map.of(
                        "id",
                        l.id,
                        "city",
                        l.city,
                        "name",
                        l.name,
                        "slug",
                        l.slug,
                        "isFeatured",
                        l.isFeatured)))
        .toList();
  }

  @GetMapping("/properties")
  public PageResponse<PropertySummary> properties(
      @RequestParam(required = false) String purpose,
      @RequestParam(required = false) String locality,
      @RequestParam(required = false) String type,
      @RequestParam(required = false) String q,
      @RequestParam(required = false) Long minPrice,
      @RequestParam(required = false) Long maxPrice,
      @RequestParam(required = false) Integer minBedrooms,
      @RequestParam(required = false) Integer maxBedrooms,
      @RequestParam(required = false) Integer minAreaSqft,
      @RequestParam(required = false) Integer maxAreaSqft,
      @RequestParam(required = false) String sort,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "12") int size) {
    var qResolution = resolveSearchQuery(q);
    PropertyPurpose purposeFilter = resolvePurposeFilter(purpose, qResolution.inferredPurpose());

    var pageable =
        PageRequest.of(
            Math.max(0, page),
            Math.min(50, Math.max(1, size)),
            mapPublicSort(sort == null ? "" : sort.trim()));

    var rows =
        properties.publicSearchPage(
            purposeFilter,
            blankToNull(locality),
            blankToNull(type),
            qResolution.titleToken(),
            minPrice,
            maxPrice,
            minBedrooms,
            maxBedrooms,
            minAreaSqft,
            maxAreaSqft,
            pageable);

    var content = rows.getContent().stream().map(this::toSummary).toList();

    return new PageResponse<>(
        content,
        rows.getTotalElements(),
        rows.getTotalPages(),
        rows.getNumber(),
        rows.getSize());
  }

  @GetMapping("/properties/{slug}")
  @Transactional
  public PropertyDetails propertyBySlug(
      @PathVariable String slug, @AuthenticationPrincipal SecurityUser principal) {
    var p = properties.findBySlug(slug).orElseThrow(() -> new IllegalArgumentException("Not found"));
    if (p.approvalStatus == ApprovalStatus.approved && p.listingStatus == ListingStatus.active) {
      properties.incrementViewsCountById(p.id);
      p.viewsCount = (p.viewsCount == null ? 0L : p.viewsCount) + 1;
    }
    var imageUrls =
        images.findAllByPropertyIdOrderBySortOrderAscIdAsc(p.id).stream()
            .map(i -> i.imageUrl)
            .toList();
    var amenityNames = amenityLookup.amenityNamesForProperty(p.id);
    boolean isSaved =
        principal != null && saved.existsByUserIdAndPropertyId(principal.id(), p.id);
    return new PropertyDetails(
        p.id,
        p.title,
        p.slug,
        p.purpose.name(),
        p.description,
        p.price,
        p.securityDeposit,
        p.propertyType.name,
        p.propertyType.slug,
        p.city,
        p.addressLine,
        p.locality == null ? null : p.locality.name,
        p.locality == null ? null : p.locality.slug,
        p.pincode,
        p.latitude,
        p.longitude,
        p.bedrooms,
        p.bathrooms,
        p.balconies,
        p.areaSqft,
        p.carpetAreaSqft,
        p.furnishingStatus,
        p.parkingCount,
        p.floorNumber,
        p.totalFloors,
        p.possessionStatus,
        p.isFeatured,
        p.isVerified,
        imageUrls,
        amenityNames,
        p.viewsCount == null ? 0L : p.viewsCount,
        isSaved);
  }

  @GetMapping("/properties/featured")
  public List<PropertySummary> featured(@RequestParam String ids) {
    if (ids == null || ids.isBlank()) {
      return List.of();
    }
    var idOrder = new ArrayList<Long>();
    for (var part : ids.split("[,;\\s]+")) {
      if (part == null || part.isBlank()) {
        continue;
      }
      try {
        var p = part.trim();
        if (p.regionMatches(true, 0, "p_", 0, 2)) {
          p = p.substring(2);
        }
        idOrder.add(Long.parseLong(p));
      } catch (NumberFormatException ignored) {
      }
    }
    if (idOrder.isEmpty()) {
      return List.of();
    }
    var found = properties.findPublicActiveByIdIn(idOrder);
    var byId = new HashMap<Long, PropertyEntity>();
    for (var p : found) {
      byId.put(p.id, p);
    }
    var out = new ArrayList<PropertySummary>();
    for (var id : idOrder) {
      var p = byId.get(id);
      if (p != null) {
        out.add(toSummary(p));
      }
    }
    return out;
  }

  @GetMapping("/banners")
  public List<?> banners(@RequestParam(defaultValue = "homepage") String pageType) {
    var pt = pageType == null || pageType.isBlank() ? "homepage" : pageType.trim();
    return banners.findByPageTypeAndActiveIsTrueOrderByIdAsc(pt).stream()
        .map(
            b ->
                new java.util.LinkedHashMap<String, Object>() {
                  {
                    put("id", b.id);
                    put("title", b.title);
                    put("subtitle", b.subtitle);
                    put("imageUrl", b.imageUrl);
                    put("buttonText", b.buttonText);
                    put("buttonLink", b.buttonLink);
                    put("pageType", b.pageType);
                  }
                })
        .toList();
  }

  @GetMapping("/testimonials")
  public List<?> testimonials() {
    return testimonials.findByActiveIsTrueOrderBySortOrderAscIdAsc().stream()
        .map(
            t ->
                new java.util.LinkedHashMap<String, Object>() {
                  {
                    put("id", t.id);
                    put("name", t.name);
                    put("designation", t.designation);
                    put("comment", t.comment);
                    put("imageUrl", t.imageUrl);
                    put("sortOrder", t.sortOrder);
                  }
                })
        .toList();
  }

  @GetMapping("/seo-pages/{pageKey}")
  public java.util.Map<String, Object> seoPage(@PathVariable String pageKey) {
    var key = pageKey == null ? "" : pageKey.trim().toLowerCase(Locale.ROOT);
    return seoPages
        .findById(key)
        .map(
            s -> {
              var m = new java.util.LinkedHashMap<String, Object>();
              m.put("pageKey", s.pageKey);
              m.put("pageTitle", s.pageTitle);
              m.put("metaTitle", s.metaTitle);
              m.put("metaDescription", s.metaDescription);
              m.put("ogImage", s.ogImage);
              m.put("schemaJson", s.schemaJson);
              m.put("updatedAt", s.updatedAt);
              return m;
            })
        .orElseGet(java.util.LinkedHashMap::new);
  }

  private PropertySummary toSummary(PropertyEntity r) {
    var imgs = images.findAllByPropertyIdOrderBySortOrderAscIdAsc(r.id);
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

  private record QueryResolution(String titleToken, PropertyPurpose inferredPurpose) {}

  private static QueryResolution resolveSearchQuery(String qRaw) {
    if (qRaw == null || qRaw.isBlank()) {
      return new QueryResolution("", null);
    }
    var t = qRaw.trim().toLowerCase(Locale.ROOT);
    if ("buy".equals(t) || "purchase".equals(t) || "to-buy".equals(t)) {
      return new QueryResolution("", PropertyPurpose.sell);
    }
    if ("rent".equals(t) || "lease".equals(t) || "to-rent".equals(t)) {
      return new QueryResolution("", PropertyPurpose.rent);
    }
    return new QueryResolution(t, null);
  }

  private static PropertyPurpose resolvePurposeFilter(String purposeParam, PropertyPurpose inferredFromQuery) {
    if (purposeParam != null && !purposeParam.isBlank()) {
      return parsePurposeForSearch(purposeParam.trim());
    }
    return inferredFromQuery;
  }

  private static PropertyPurpose parsePurposeForSearch(String purpose) {
    var s = purpose.trim().toLowerCase(Locale.ROOT);
    if ("buy".equals(s)) return PropertyPurpose.sell;
    if ("sell".equals(s)) return PropertyPurpose.sell;
    if ("rent".equals(s)) return PropertyPurpose.rent;
    throw new IllegalArgumentException("Invalid purpose. Use buy/sell/rent.");
  }

  private static Sort mapPublicSort(String sortKey) {
    return switch (sortKey.toLowerCase(Locale.ROOT)) {
      case "price_low" -> Sort.by(Sort.Direction.ASC, "price").and(Sort.by(Sort.Direction.DESC, "id"));
      case "price_high" -> Sort.by(Sort.Direction.DESC, "price").and(Sort.by(Sort.Direction.DESC, "id"));
      default -> Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id"));
    };
  }

  private static String blankToNull(String s) {
    return (s == null || s.isBlank()) ? null : s.trim();
  }
}
