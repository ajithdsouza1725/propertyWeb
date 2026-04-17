package com.mangalorehomes.propertyweb.admin;

import com.mangalorehomes.propertyweb.content.BannerEntity;
import com.mangalorehomes.propertyweb.content.BannerRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/banners")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBannersController {
  private final BannerRepository banners;

  public AdminBannersController(BannerRepository banners) {
    this.banners = banners;
  }

  public record BannerUpsertRequest(
      String title,
      String subtitle,
      String imageUrl,
      String buttonText,
      String buttonLink,
      @NotBlank String pageType,
      Boolean active) {}

  @GetMapping
  public Object list() {
    return banners.findAll().stream()
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
                    put("active", b.active);
                    put("createdAt", b.createdAt);
                    put("updatedAt", b.updatedAt);
                  }
                })
        .toList();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Object create(@Valid @RequestBody BannerUpsertRequest req) {
    var b = new BannerEntity();
    apply(b, req);
    b.createdAt = Instant.now();
    b.updatedAt = Instant.now();
    b = banners.save(b);
    return java.util.Map.of("id", b.id);
  }

  @PutMapping("/{id}")
  public Object update(@PathVariable Long id, @Valid @RequestBody BannerUpsertRequest req) {
    var b = banners.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
    apply(b, req);
    b.updatedAt = Instant.now();
    banners.save(b);
    return java.util.Map.of("id", b.id);
  }

  @DeleteMapping("/{id}")
  public Object delete(@PathVariable Long id) {
    banners.deleteById(id);
    return java.util.Map.of("deleted", true, "id", id);
  }

  private static void apply(BannerEntity b, BannerUpsertRequest req) {
    b.title = req.title();
    b.subtitle = req.subtitle();
    b.imageUrl = req.imageUrl();
    b.buttonText = req.buttonText();
    b.buttonLink = req.buttonLink();
    b.pageType = req.pageType().trim();
    if (req.active() != null) b.active = req.active();
  }
}
