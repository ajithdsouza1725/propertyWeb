package com.mangalorehomes.propertyweb.auth;

import com.mangalorehomes.propertyweb.auth.dto.AuthLoginRequest;
import com.mangalorehomes.propertyweb.auth.dto.AuthResponse;
import com.mangalorehomes.propertyweb.auth.dto.AuthSignupRequest;
import com.mangalorehomes.propertyweb.security.JwtService;
import com.mangalorehomes.propertyweb.security.UserRole;
import com.mangalorehomes.propertyweb.security.UserStatus;
import com.mangalorehomes.propertyweb.users.UserEntity;
import com.mangalorehomes.propertyweb.users.UserRepository;
import java.util.Locale;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
  private final UserRepository users;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authManager;
  private final JwtService jwt;

  public AuthService(
      UserRepository users,
      PasswordEncoder passwordEncoder,
      AuthenticationManager authManager,
      JwtService jwt) {
    this.users = users;
    this.passwordEncoder = passwordEncoder;
    this.authManager = authManager;
    this.jwt = jwt;
  }

  @Transactional
  public AuthResponse signup(AuthSignupRequest req) {
    if ((req.email() == null || req.email().isBlank()) && (req.phone() == null || req.phone().isBlank())) {
      throw new IllegalArgumentException("Either email or phone is required.");
    }
    if (req.email() != null && !req.email().isBlank() && users.existsByEmailIgnoreCase(req.email())) {
      throw new IllegalArgumentException("Email already in use.");
    }
    if (req.phone() != null && !req.phone().isBlank() && users.existsByPhone(req.phone())) {
      throw new IllegalArgumentException("Phone already in use.");
    }

    UserRole role;
    try {
      role = UserRole.valueOf(req.role().toLowerCase(Locale.ROOT));
    } catch (Exception e) {
      throw new IllegalArgumentException("Invalid role. Use buyer/owner/agent.");
    }
    if (role == UserRole.admin) {
      throw new IllegalArgumentException("Admin signup is disabled.");
    }

    var u = new UserEntity();
    u.fullName = req.fullName();
    u.email = req.email() == null ? null : req.email().trim().toLowerCase(Locale.ROOT);
    u.phone = req.phone() == null ? null : req.phone().trim();
    u.passwordHash = passwordEncoder.encode(req.password());
    u.role = role;
    u.status = UserStatus.active;
    u.isVerified = false;

    u = users.save(u);
    return new AuthResponse(jwt.createAccessToken(u.id, u.role));
  }

  public AuthResponse login(AuthLoginRequest req) {
    // authentication uses identifier as username (email or phone)
    authManager.authenticate(
        new UsernamePasswordAuthenticationToken(req.identifier().trim(), req.password()));

    // Load user for token
    var identifier = req.identifier().trim();
    var user =
        identifier.contains("@")
            ? users.findByEmailIgnoreCase(identifier).orElseThrow()
            : users.findByPhone(identifier).orElseThrow();

    return new AuthResponse(jwt.createAccessToken(user.id, user.role));
  }
}

