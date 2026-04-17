package com.mangalorehomes.propertyweb.admin;

import com.mangalorehomes.propertyweb.catalog.AmenityEntity;
import com.mangalorehomes.propertyweb.catalog.AmenityRepository;
import com.mangalorehomes.propertyweb.catalog.LocalityEntity;
import com.mangalorehomes.propertyweb.catalog.LocalityRepository;
import com.mangalorehomes.propertyweb.catalog.PropertyTypeEntity;
import com.mangalorehomes.propertyweb.catalog.PropertyTypeRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.Locale;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCatalogController {
  private final LocalityRepository localities;
  private final PropertyTypeRepository types;
  private final AmenityRepository amenities;

  public AdminCatalogController(
      LocalityRepository localities, PropertyTypeRepository types, AmenityRepository amenities) {
    this.localities = localities;
    this.types = types;
    this.amenities = amenities;
  }

  // ---------------- Locations (/locations) ----------------

  public record UpsertLocationRequest(
      @NotBlank String city,
      @NotBlank String name,
      String slug,
      String description,
      String imageUrl,
      Boolean isFeatured,
      Boolean isActive) {}

  @GetMapping("/locations")
  public Object locations(@RequestParam(required = false) String q, @RequestParam(required = false) String active) {
    final String qq = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);
    final String activeQ = active == null ? "any" : active.trim().toLowerCase(Locale.ROOT);

    return localities.findAll().stream()
        .filter(
            l -> {
              if (qq.isBlank()) return true;
              return contains(l.name, qq) || contains(l.slug, qq) || contains(l.city, qq);
            })
        .filter(
            l -> {
              if ("any".equals(activeQ) || activeQ.isBlank()) return true;
              return "true".equals(activeQ) ? l.isActive : !l.isActive;
            })
        .map(
            l ->
                new java.util.LinkedHashMap<String, Object>() {
                  {
                    put("id", l.id);
                    put("city", l.city);
                    put("name", l.name);
                    put("slug", l.slug);
                    put("description", l.description);
                    put("imageUrl", l.imageUrl);
                    put("isFeatured", l.isFeatured);
                    put("isActive", l.isActive);
                    put("createdAt", l.createdAt);
                    put("updatedAt", l.updatedAt);
                  }
                })
        .toList();
  }

  @PostMapping("/locations")
  @ResponseStatus(HttpStatus.CREATED)
  public Object createLocation(@Valid @RequestBody UpsertLocationRequest req) {
    var l = new LocalityEntity();
    l.city = req.city().trim();
    l.name = req.name().trim();
    l.slug = uniqueSlug(req.slug(), l.name, slug -> localities.findBySlug(slug).isPresent());
    l.description = normalizeNullable(req.description());
    l.imageUrl = normalizeNullable(req.imageUrl());
    l.isFeatured = req.isFeatured() != null && req.isFeatured();
    l.isActive = req.isActive() == null || req.isActive();
    l.createdAt = Instant.now();
    l.updatedAt = Instant.now();
    l = localities.save(l);
    return java.util.Map.of("id", l.id, "slug", l.slug);
  }

  @PutMapping("/locations/{id}")
  public Object updateLocation(@PathVariable Long id, @Valid @RequestBody UpsertLocationRequest req) {
    var l = localities.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
    l.city = req.city().trim();
    l.name = req.name().trim();

    var nextSlug = uniqueSlug(req.slug(), l.name, slug -> localities.findBySlug(slug).map(x -> !Objects.equals(x.id, l.id)).orElse(false));
    l.slug = nextSlug;

    l.description = normalizeNullable(req.description());
    l.imageUrl = normalizeNullable(req.imageUrl());
    l.isFeatured = req.isFeatured() != null && req.isFeatured();
    if (req.isActive() != null) l.isActive = req.isActive();
    l.updatedAt = Instant.now();
    localities.save(l);
    return java.util.Map.of("id", l.id, "slug", l.slug, "updatedAt", l.updatedAt);
  }

  @DeleteMapping("/locations/{id}")
  public Object disableLocation(@PathVariable Long id) {
    var l = localities.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
    l.isActive = false;
    l.updatedAt = Instant.now();
    localities.save(l);
    return java.util.Map.of("id", l.id, "isActive", l.isActive);
  }

  // ---------------- Property Types (/property-types) ----------------

  public record UpsertPropertyTypeRequest(@NotBlank String name, String slug, Boolean isActive) {}

  @GetMapping("/property-types")
  public Object propertyTypes(@RequestParam(required = false) String q, @RequestParam(required = false) String active) {
    final String qq = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);
    final String activeQ = active == null ? "any" : active.trim().toLowerCase(Locale.ROOT);
    return types.findAll().stream()
        .filter(
            t -> {
              if (qq.isBlank()) return true;
              return contains(t.name, qq) || contains(t.slug, qq);
            })
        .filter(
            t -> {
              if ("any".equals(activeQ) || activeQ.isBlank()) return true;
              return "true".equals(activeQ) ? t.isActive : !t.isActive;
            })
        .map(
            t ->
                new java.util.LinkedHashMap<String, Object>() {
                  {
                    put("id", t.id);
                    put("name", t.name);
                    put("slug", t.slug);
                    put("isActive", t.isActive);
                    put("createdAt", t.createdAt);
                    put("updatedAt", t.updatedAt);
                  }
                })
        .toList();
  }

  @PostMapping("/property-types")
  @ResponseStatus(HttpStatus.CREATED)
  public Object createPropertyType(@Valid @RequestBody UpsertPropertyTypeRequest req) {
    var t = new PropertyTypeEntity();
    t.name = req.name().trim();
    t.slug = uniqueSlug(req.slug(), t.name, slug -> types.findBySlug(slug).isPresent());
    t.isActive = req.isActive() == null || req.isActive();
    t.createdAt = Instant.now();
    t.updatedAt = Instant.now();
    t = types.save(t);
    return java.util.Map.of("id", t.id, "slug", t.slug);
  }

  @PutMapping("/property-types/{id}")
  public Object updatePropertyType(@PathVariable Long id, @Valid @RequestBody UpsertPropertyTypeRequest req) {
    var t = types.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
    t.name = req.name().trim();
    t.slug = uniqueSlug(req.slug(), t.name, slug -> types.findBySlug(slug).map(x -> !Objects.equals(x.id, t.id)).orElse(false));
    if (req.isActive() != null) t.isActive = req.isActive();
    t.updatedAt = Instant.now();
    types.save(t);
    return java.util.Map.of("id", t.id, "slug", t.slug, "updatedAt", t.updatedAt);
  }

  @DeleteMapping("/property-types/{id}")
  public Object disablePropertyType(@PathVariable Long id) {
    var t = types.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
    t.isActive = false;
    t.updatedAt = Instant.now();
    types.save(t);
    return java.util.Map.of("id", t.id, "isActive", t.isActive);
  }

  // ---------------- Amenities (/amenities) ----------------

  public record UpsertAmenityRequest(@NotBlank String name, String icon, Boolean isActive) {}

  @GetMapping("/amenities")
  public Object listAmenities(@RequestParam(required = false) String q, @RequestParam(required = false) String active) {
    final String qq = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);
    final String activeQ = active == null ? "any" : active.trim().toLowerCase(Locale.ROOT);

    return amenities.findAll().stream()
        .filter(
            a -> {
              if (qq.isBlank()) return true;
              return contains(a.name, qq) || contains(a.icon, qq);
            })
        .filter(
            a -> {
              if ("any".equals(activeQ) || activeQ.isBlank()) return true;
              return "true".equals(activeQ) ? a.isActive : !a.isActive;
            })
        .map(
            a ->
                new java.util.LinkedHashMap<String, Object>() {
                  {
                    put("id", a.id);
                    put("name", a.name);
                    put("icon", a.icon);
                    put("isActive", a.isActive);
                    put("createdAt", a.createdAt);
                    put("updatedAt", a.updatedAt);
                  }
                })
        .toList();
  }

  @PostMapping("/amenities")
  @ResponseStatus(HttpStatus.CREATED)
  public Object createAmenity(@Valid @RequestBody UpsertAmenityRequest req) {
    var name = req.name().trim();
    if (amenities.findByNameIgnoreCase(name).isPresent()) {
      throw new IllegalArgumentException("Amenity already exists.");
    }
    var a = new AmenityEntity();
    a.name = name;
    a.icon = normalizeNullable(req.icon());
    a.isActive = req.isActive() == null || req.isActive();
    a.createdAt = Instant.now();
    a.updatedAt = Instant.now();
    a = amenities.save(a);
    return java.util.Map.of("id", a.id);
  }

  @PutMapping("/amenities/{id}")
  public Object updateAmenity(@PathVariable Long id, @Valid @RequestBody UpsertAmenityRequest req) {
    var a = amenities.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
    var nextName = req.name().trim();
    var existing = amenities.findByNameIgnoreCase(nextName).orElse(null);
    if (existing != null && !Objects.equals(existing.id, a.id)) {
      throw new IllegalArgumentException("Amenity already exists.");
    }
    a.name = nextName;
    a.icon = normalizeNullable(req.icon());
    if (req.isActive() != null) a.isActive = req.isActive();
    a.updatedAt = Instant.now();
    amenities.save(a);
    return java.util.Map.of("id", a.id, "updatedAt", a.updatedAt);
  }

  @DeleteMapping("/amenities/{id}")
  public Object disableAmenity(@PathVariable Long id) {
    var a = amenities.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
    a.isActive = false;
    a.updatedAt = Instant.now();
    amenities.save(a);
    return java.util.Map.of("id", a.id, "isActive", a.isActive);
  }

  private static boolean contains(String v, String q) {
    if (v == null) return false;
    return v.toLowerCase(Locale.ROOT).contains(q);
  }

  private static String normalizeNullable(String v) {
    if (v == null) return null;
    var t = v.trim();
    return t.isBlank() ? null : t;
  }

  private static String uniqueSlug(String requested, String name, java.util.function.Predicate<String> exists) {
    String base =
        (requested == null || requested.trim().isBlank())
            ? slugify(name)
            : slugify(requested.trim());
    if (base.isBlank()) base = "item";
    String slug = base;
    int i = 2;
    while (exists.test(slug)) {
      slug = base + "-" + i;
      i += 1;
    }
    return slug;
  }

  private static String slugify(String v) {
    var s = v.toLowerCase(Locale.ROOT).trim();
    s = s.replaceAll("[^a-z0-9]+", "-");
    s = s.replaceAll("(^-+|-+$)", "");
    return s;
  }
}

