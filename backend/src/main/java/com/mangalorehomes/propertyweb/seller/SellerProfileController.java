package com.mangalorehomes.propertyweb.seller;

import com.mangalorehomes.propertyweb.auth.dto.MeResponse;
import com.mangalorehomes.propertyweb.seller.dto.SellerChangePasswordRequest;
import com.mangalorehomes.propertyweb.seller.dto.SellerProfileUpdateRequest;
import com.mangalorehomes.propertyweb.security.SecurityUser;
import com.mangalorehomes.propertyweb.users.UserRepository;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.Locale;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/seller/profile")
@PreAuthorize("hasAnyRole('OWNER','AGENT')")
@Transactional
public class SellerProfileController {
  private final UserRepository users;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;

  public SellerProfileController(
      UserRepository users,
      PasswordEncoder passwordEncoder,
      AuthenticationManager authenticationManager) {
    this.users = users;
    this.passwordEncoder = passwordEncoder;
    this.authenticationManager = authenticationManager;
  }

  @GetMapping
  public MeResponse get(@AuthenticationPrincipal SecurityUser principal) {
    var u = users.findById(principal.id()).orElseThrow();
    return new MeResponse(
        u.id,
        u.fullName,
        u.email,
        u.phone,
        u.businessName,
        u.role.name(),
        u.status.name());
  }

  @PutMapping
  public MeResponse update(
      @AuthenticationPrincipal SecurityUser principal, @Valid @RequestBody SellerProfileUpdateRequest req) {
    var u = users.findById(principal.id()).orElseThrow();
    u.fullName = req.fullName().trim();
    if (req.email() != null && !req.email().isBlank()) {
      var em = req.email().trim().toLowerCase(Locale.ROOT);
      var taken = users.findByEmailIgnoreCase(em).filter(other -> !other.id.equals(u.id));
      if (taken.isPresent()) {
        throw new IllegalArgumentException("Email already in use.");
      }
      u.email = em;
    }
    if (req.phone() != null && !req.phone().isBlank()) {
      var ph = req.phone().trim();
      var takenPhone = users.findByPhone(ph).filter(other -> !other.id.equals(u.id));
      if (takenPhone.isPresent()) {
        throw new IllegalArgumentException("Phone already in use.");
      }
      u.phone = ph;
    }
    u.businessName =
        req.businessName() == null || req.businessName().isBlank() ? null : req.businessName().trim();
    u.updatedAt = Instant.now();
    users.save(u);
    return new MeResponse(
        u.id, u.fullName, u.email, u.phone, u.businessName, u.role.name(), u.status.name());
  }

  @PostMapping("/password")
  public java.util.Map<String, Boolean> changePassword(
      @AuthenticationPrincipal SecurityUser principal, @Valid @RequestBody SellerChangePasswordRequest req) {
    var u = users.findById(principal.id()).orElseThrow();
    var identifier =
        u.email != null && !u.email.isBlank()
            ? u.email
            : (u.phone != null && !u.phone.isBlank() ? u.phone : null);
    if (identifier == null) {
      throw new IllegalArgumentException("Account has no email or phone for verification.");
    }
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(identifier, req.currentPassword()));
    u.passwordHash = passwordEncoder.encode(req.newPassword());
    u.updatedAt = Instant.now();
    users.save(u);
    return java.util.Map.of("ok", true);
  }
}
