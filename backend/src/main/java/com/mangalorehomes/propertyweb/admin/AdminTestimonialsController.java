package com.mangalorehomes.propertyweb.admin;

import com.mangalorehomes.propertyweb.content.TestimonialEntity;
import com.mangalorehomes.propertyweb.content.TestimonialRepository;
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
@RequestMapping("/api/admin/testimonials")
@PreAuthorize("hasRole('ADMIN')")
public class AdminTestimonialsController {
  private final TestimonialRepository testimonials;

  public AdminTestimonialsController(TestimonialRepository testimonials) {
    this.testimonials = testimonials;
  }

  public record TestimonialUpsertRequest(
      @NotBlank String name,
      String designation,
      @NotBlank String comment,
      String imageUrl,
      Integer sortOrder,
      Boolean active) {}

  @GetMapping
  public Object list() {
    return testimonials.findAll().stream()
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
                    put("active", t.active);
                    put("createdAt", t.createdAt);
                  }
                })
        .toList();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Object create(@Valid @RequestBody TestimonialUpsertRequest req) {
    var t = new TestimonialEntity();
    apply(t, req);
    t.createdAt = Instant.now();
    t = testimonials.save(t);
    return java.util.Map.of("id", t.id);
  }

  @PutMapping("/{id}")
  public Object update(@PathVariable Long id, @Valid @RequestBody TestimonialUpsertRequest req) {
    var t = testimonials.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
    apply(t, req);
    testimonials.save(t);
    return java.util.Map.of("id", t.id);
  }

  @DeleteMapping("/{id}")
  public Object delete(@PathVariable Long id) {
    testimonials.deleteById(id);
    return java.util.Map.of("deleted", true, "id", id);
  }

  private static void apply(TestimonialEntity t, TestimonialUpsertRequest req) {
    t.name = req.name().trim();
    t.designation = req.designation();
    t.comment = req.comment().trim();
    t.imageUrl = req.imageUrl();
    if (req.sortOrder() != null) t.sortOrder = req.sortOrder();
    if (req.active() != null) t.active = req.active();
  }
}
