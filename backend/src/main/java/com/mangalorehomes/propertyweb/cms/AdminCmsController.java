package com.mangalorehomes.propertyweb.cms;

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
@RequestMapping("/api/admin/cms")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCmsController {
  private static final java.util.Set<String> ALLOWED =
      java.util.Set.of("homepage", "seo", "settings", "privacy", "terms");

  private final CmsSectionRepository cms;

  public AdminCmsController(CmsSectionRepository cms) {
    this.cms = cms;
  }

  @GetMapping("/{section}")
  public Map<String, Object> get(@PathVariable String section) {
    validate(section);
    return cms.findById(section.trim().toLowerCase()).map(e -> e.payload).orElse(new HashMap<>());
  }

  @PutMapping("/{section}")
  public Map<String, Object> put(@PathVariable String section, @RequestBody(required = false) Map<String, Object> body) {
    var key = validate(section);
    var e =
        cms.findById(key)
            .orElseGet(
                () -> {
                  var x = new CmsSectionEntity();
                  x.section = key;
                  x.payload = new HashMap<>();
                  x.updatedAt = Instant.now();
                  return x;
                });
    e.payload = body == null ? new HashMap<>() : new HashMap<>(body);
    e.updatedAt = Instant.now();
    cms.save(e);
    return e.payload;
  }

  private static String validate(String section) {
    if (section == null || section.isBlank()) {
      throw new IllegalArgumentException("Section required.");
    }
    var key = section.trim().toLowerCase();
    if (!ALLOWED.contains(key)) {
      throw new IllegalArgumentException("Invalid section.");
    }
    return key;
  }
}
