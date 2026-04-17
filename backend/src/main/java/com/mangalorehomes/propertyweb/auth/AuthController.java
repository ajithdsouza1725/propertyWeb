package com.mangalorehomes.propertyweb.auth;

import com.mangalorehomes.propertyweb.auth.dto.AuthLoginRequest;
import com.mangalorehomes.propertyweb.auth.dto.AuthResponse;
import com.mangalorehomes.propertyweb.auth.dto.AuthSignupRequest;
import com.mangalorehomes.propertyweb.auth.dto.ForgotPasswordRequest;
import com.mangalorehomes.propertyweb.auth.dto.MeResponse;
import com.mangalorehomes.propertyweb.auth.dto.ResetPasswordRequest;
import com.mangalorehomes.propertyweb.security.SecurityUser;
import com.mangalorehomes.propertyweb.users.UserRepository;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthService auth;
  private final UserRepository users;
  private final PasswordResetService passwordReset;

  public AuthController(AuthService auth, UserRepository users, PasswordResetService passwordReset) {
    this.auth = auth;
    this.users = users;
    this.passwordReset = passwordReset;
  }

  @PostMapping("/signup")
  public AuthResponse signup(@Valid @RequestBody AuthSignupRequest req) {
    return auth.signup(req);
  }

  @PostMapping("/login")
  public AuthResponse login(@Valid @RequestBody AuthLoginRequest req) {
    return auth.login(req);
  }

  @GetMapping("/me")
  public MeResponse me(@AuthenticationPrincipal SecurityUser principal) {
    if (principal == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
    }
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

  @PostMapping("/forgot-password")
  public Map<String, Object> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
    passwordReset.requestReset(req.identifier());
    return Map.of("ok", true);
  }

  @PostMapping("/reset-password")
  public Map<String, Object> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
    passwordReset.resetWithToken(req.token(), req.newPassword());
    return Map.of("ok", true);
  }
}

