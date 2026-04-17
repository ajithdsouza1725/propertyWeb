package com.mangalorehomes.propertyweb.admin;

import com.mangalorehomes.propertyweb.content.SeoPageEntity;
import com.mangalorehomes.propertyweb.content.SeoPageRepository;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/seo-pages")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSeoPagesController {
  private final SeoPageRepository seoPages;

  public AdminSeoPagesController(SeoPageRepository seoPages) {
    this.seoPages = seoPages;
  }

  @GetMapping
  public Object list() {
    return seoPages.findAllByOrderByPageKeyAsc().stream()
        .map(
            s ->
                new java.util.LinkedHashMap<String, Object>() {
                  {
                    put("pageKey", s.pageKey);
                    put("pageTitle", s.pageTitle);
                    put("metaTitle", s.metaTitle);
                    put("metaDescription", s.metaDescription);
                    put("ogImage", s.ogImage);
                    put("schemaJson", s.schemaJson);
                    put("updatedAt", s.updatedAt);
                  }
                })
        .toList();
  }

  @GetMapping("/{pageKey}")
  public Object one(@PathVariable String pageKey) {
    var key = pageKey == null ? "" : pageKey.trim().toLowerCase();
    var s =
        seoPages
            .findById(key)
            .orElseThrow(() -> new IllegalArgumentException("Not found. Create via PUT first."));
    // Use LinkedHashMap because fields can be null (Map.of rejects nulls on Java 17+).
    var m = new java.util.LinkedHashMap<String, Object>();
    m.put("pageKey", s.pageKey);
    m.put("pageTitle", s.pageTitle);
    m.put("metaTitle", s.metaTitle);
    m.put("metaDescription", s.metaDescription);
    m.put("ogImage", s.ogImage);
    m.put("schemaJson", s.schemaJson);
    m.put("updatedAt", s.updatedAt);
    return m;
  }

  @PutMapping("/{pageKey}")
  public Object upsert(@PathVariable String pageKey, @RequestBody(required = false) Map<String, Object> body) {
    var key = pageKey == null ? "" : pageKey.trim().toLowerCase();
    if (key.isBlank()) throw new IllegalArgumentException("pageKey required.");
    var b = body == null ? Map.<String, Object>of() : body;
    var e = seoPages.findById(key).orElseGet(SeoPageEntity::new);
    e.pageKey = key;
    e.pageTitle = str(b.get("pageTitle"));
    e.metaTitle = str(b.get("metaTitle"));
    e.metaDescription = str(b.get("metaDescription"));
    e.ogImage = str(b.get("ogImage"));
    var sj = b.get("schemaJson");
    if (sj instanceof Map<?, ?> m) {
      e.schemaJson = new HashMap<>();
      for (var en : m.entrySet()) {
        if (en.getKey() != null) e.schemaJson.put(en.getKey().toString(), en.getValue());
      }
    } else if (sj == null || (sj instanceof String s && s.isBlank())) {
      e.schemaJson = null;
    }
    e.updatedAt = Instant.now();
    seoPages.save(e);
    return java.util.Map.of("pageKey", e.pageKey, "updatedAt", e.updatedAt);
  }

  private static String str(Object v) {
    if (v == null) return null;
    var s = v.toString().trim();
    return s.isEmpty() ? null : s;
  }
}
