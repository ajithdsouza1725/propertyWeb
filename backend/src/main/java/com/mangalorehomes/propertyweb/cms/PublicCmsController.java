package com.mangalorehomes.propertyweb.cms;

import java.util.Map;
import java.util.Set;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/cms")
public class PublicCmsController {
  private static final Set<String> PUBLIC = Set.of("homepage", "settings", "seo", "privacy", "terms");

  private final CmsSectionRepository cms;

  public PublicCmsController(CmsSectionRepository cms) {
    this.cms = cms;
  }

  @GetMapping("/{section}")
  public Map<String, Object> get(@PathVariable String section) {
    var key = section == null ? "" : section.trim().toLowerCase();
    if (!PUBLIC.contains(key)) {
      throw new IllegalArgumentException("Unknown section.");
    }
    return cms.findById(key).map(e -> e.payload).orElse(Map.of());
  }
}
