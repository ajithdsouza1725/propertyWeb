package com.mangalorehomes.propertyweb.admin;

import com.mangalorehomes.propertyweb.security.UserRole;
import com.mangalorehomes.propertyweb.security.UserStatus;
import com.mangalorehomes.propertyweb.enquiries.EnquiryRepository;
import com.mangalorehomes.propertyweb.properties.PropertyRepository;
import com.mangalorehomes.propertyweb.users.UserEntity;
import com.mangalorehomes.propertyweb.users.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
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
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUsersController {
  private final UserRepository users;
  private final PasswordEncoder passwordEncoder;
  private final PropertyRepository propertyRepo;
  private final EnquiryRepository enquiryRepo;

  public AdminUsersController(
      UserRepository users,
      PasswordEncoder passwordEncoder,
      PropertyRepository propertyRepo,
      EnquiryRepository enquiryRepo) {
    this.users = users;
    this.passwordEncoder = passwordEncoder;
    this.propertyRepo = propertyRepo;
    this.enquiryRepo = enquiryRepo;
  }

  public record AdminUserRow(
      Long id,
      String fullName,
      String email,
      String phone,
      String businessName,
      String profileImage,
      UserRole role,
      UserStatus status,
      boolean isVerified,
      Instant createdAt,
      Instant updatedAt,
      long propertyCount,
      long enquiryCount) {}

  public record CreateUserRequest(
      @NotBlank String fullName,
      String email,
      String phone,
      String businessName,
      String profileImage,
      UserRole role,
      UserStatus status,
      Boolean isVerified,
      @NotBlank String password) {}

  public record UpdateUserRequest(
      String fullName,
      String email,
      String phone,
      String businessName,
      String profileImage,
      UserRole role,
      UserStatus status,
      Boolean isVerified,
      String password) {}

  @GetMapping
  public Object list(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) String role,
      @RequestParam(required = false) String status) {
    final String qq = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);
    final String roleQ = role == null ? "" : role.trim().toLowerCase(Locale.ROOT);
    final String statusQ = status == null ? "" : status.trim().toLowerCase(Locale.ROOT);

    return users.findAll().stream()
        .filter(
            u -> {
              if (qq.isBlank()) return true;
              return contains(u.fullName, qq)
                  || contains(u.email, qq)
                  || contains(u.phone, qq)
                  || contains(u.businessName, qq);
            })
        .filter(
            u -> {
              if (roleQ.isBlank() || "any".equals(roleQ)) return true;
              return u.role != null && u.role.name().toLowerCase(Locale.ROOT).equals(roleQ);
            })
        .filter(
            u -> {
              if (statusQ.isBlank() || "any".equals(statusQ)) return true;
              return u.status != null && u.status.name().toLowerCase(Locale.ROOT).equals(statusQ);
            })
        .map(
            u -> {
              long propCount = propertyRepo.countByUserId(u.id);
              long enqCount = enquiryRepo.countByUserId(u.id);
              return new AdminUserRow(
                  u.id, u.fullName, u.email, u.phone, u.businessName, u.profileImage,
                  u.role, u.status, u.isVerified, u.createdAt, u.updatedAt,
                  propCount, enqCount);
            })
        .toList();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Object create(@Valid @RequestBody CreateUserRequest req) {
    var fullName = req.fullName().trim();
    var email = normalizeNullable(req.email());
    var phone = normalizeNullable(req.phone());

    if ((email == null || email.isBlank()) && (phone == null || phone.isBlank())) {
      throw new IllegalArgumentException("Either email or phone is required.");
    }

    if (email != null && !email.isBlank() && users.existsByEmailIgnoreCase(email)) {
      throw new IllegalArgumentException("Email already exists.");
    }
    if (phone != null && !phone.isBlank() && users.existsByPhone(phone)) {
      throw new IllegalArgumentException("Phone already exists.");
    }

    var u = new UserEntity();
    u.fullName = fullName;
    u.email = email;
    u.phone = phone;
    u.businessName = normalizeNullable(req.businessName());
    u.profileImage = normalizeNullable(req.profileImage());
    u.role = req.role() == null ? UserRole.buyer : req.role();
    u.status = req.status() == null ? UserStatus.active : req.status();
    u.isVerified = req.isVerified() != null && req.isVerified();
    u.passwordHash = passwordEncoder.encode(req.password());
    u.createdAt = Instant.now();
    u.updatedAt = Instant.now();
    u = users.save(u);

    return new LinkedHashMap<>(
        java.util.Map.of(
            "id", u.id,
            "createdAt", u.createdAt,
            "updatedAt", u.updatedAt));
  }

  @PutMapping("/{id}")
  public Object update(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest req) {
    var u = users.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));

    var nextEmail = normalizeNullable(req.email());
    var nextPhone = normalizeNullable(req.phone());

    if (nextEmail != null && !nextEmail.isBlank()) {
      var existing = users.findByEmailIgnoreCase(nextEmail).orElse(null);
      if (existing != null && !Objects.equals(existing.id, u.id)) {
        throw new IllegalArgumentException("Email already exists.");
      }
    }
    if (nextPhone != null && !nextPhone.isBlank()) {
      var existing = users.findByPhone(nextPhone).orElse(null);
      if (existing != null && !Objects.equals(existing.id, u.id)) {
        throw new IllegalArgumentException("Phone already exists.");
      }
    }

    if (req.fullName() != null && !req.fullName().trim().isBlank()) u.fullName = req.fullName().trim();
    u.email = nextEmail;
    u.phone = nextPhone;
    if (req.businessName() != null) u.businessName = normalizeNullable(req.businessName());
    if (req.profileImage() != null) u.profileImage = normalizeNullable(req.profileImage());
    if (req.role() != null) u.role = req.role();
    if (req.status() != null) u.status = req.status();
    if (req.isVerified() != null) u.isVerified = req.isVerified();
    if (req.password() != null && !req.password().isBlank()) {
      u.passwordHash = passwordEncoder.encode(req.password());
    }
    u.updatedAt = Instant.now();
    users.save(u);

    return java.util.Map.of("id", u.id, "updatedAt", u.updatedAt);
  }

  @DeleteMapping("/{id}")
  public Object disable(@PathVariable Long id) {
    var u = users.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
    u.status = UserStatus.blocked;
    u.updatedAt = Instant.now();
    users.save(u);
    return java.util.Map.of("id", u.id, "status", u.status.name());
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
}

