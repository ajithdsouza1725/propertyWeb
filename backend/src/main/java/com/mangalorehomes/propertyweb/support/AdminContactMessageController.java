package com.mangalorehomes.propertyweb.support;

import com.mangalorehomes.propertyweb.api.PageResponse;
import com.mangalorehomes.propertyweb.support.dto.ContactMessageResponse;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/contact-messages")
@PreAuthorize("hasRole('ADMIN')")
public class AdminContactMessageController {
  private final ContactMessageRepository messages;

  public AdminContactMessageController(ContactMessageRepository messages) {
    this.messages = messages;
  }

  @GetMapping
  @Transactional(readOnly = true)
  public PageResponse<ContactMessageResponse> list(
      @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
    var pageable = PageRequest.of(Math.max(0, page), Math.min(100, Math.max(1, size)));
    var rows = messages.findAllByOrderByCreatedAtDesc(pageable);
    var content =
        rows.getContent().stream()
            .map(
                m ->
                    new ContactMessageResponse(
                        m.id, m.name, m.email, m.phone, m.message, m.isRead, m.createdAt))
            .toList();
    return new PageResponse<>(
        content, rows.getTotalElements(), rows.getTotalPages(), rows.getNumber(), rows.getSize());
  }

  @DeleteMapping("/{id}")
  @Transactional
  public Object delete(@PathVariable Long id) {
    var m = messages.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
    messages.delete(m);
    return Map.of("id", id, "deleted", true);
  }

  @PostMapping("/{id}/read")
  @Transactional
  public Object markRead(@PathVariable Long id) {
    var m = messages.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
    m.isRead = true;
    messages.save(m);
    return Map.of("id", id, "isRead", true);
  }

  @GetMapping("/unread-count")
  @Transactional(readOnly = true)
  public Map<String, Long> unreadCount() {
    return Map.of("count", messages.countByIsReadFalse());
  }
}
