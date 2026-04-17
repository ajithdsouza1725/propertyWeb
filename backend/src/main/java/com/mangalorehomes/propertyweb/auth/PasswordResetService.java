package com.mangalorehomes.propertyweb.auth;

import com.mangalorehomes.propertyweb.notifications.MailNotificationService;
import com.mangalorehomes.propertyweb.users.UserRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PasswordResetService {
  private final UserRepository users;
  private final PasswordResetTokenRepository tokens;
  private final PasswordEncoder passwordEncoder;
  private final MailNotificationService mail;

  @Value("${app.mail.frontend-base-url:http://localhost:3000}")
  private String frontendBaseUrl;

  public PasswordResetService(
      UserRepository users,
      PasswordResetTokenRepository tokens,
      PasswordEncoder passwordEncoder,
      MailNotificationService mail) {
    this.users = users;
    this.tokens = tokens;
    this.passwordEncoder = passwordEncoder;
    this.mail = mail;
  }

  /** Always succeeds from caller’s perspective (no email enumeration). */
  @Transactional
  public void requestReset(String identifierRaw) {
    if (identifierRaw == null || identifierRaw.isBlank()) return;
    var id = identifierRaw.trim();
    var userOpt =
        id.contains("@")
            ? users.findByEmailIgnoreCase(id)
            : users.findByPhone(id);
    if (userOpt.isEmpty()) return;

    var user = userOpt.get();
    var rawToken = UUID.randomUUID().toString();
    var hash = sha256Hex(rawToken);

    var row = new PasswordResetTokenEntity();
    row.user = user;
    row.tokenHash = hash;
    row.expiresAt = Instant.now().plus(1, ChronoUnit.HOURS);
    row.used = false;
    row.createdAt = Instant.now();
    tokens.save(row);

    var base = frontendBaseUrl == null ? "http://localhost:3000" : frontendBaseUrl.trim();
    if (base.endsWith("/")) base = base.substring(0, base.length() - 1);
    var link = base + "/reset-password?token=" + rawToken;
    mail.sendPasswordReset(user.email, link, user.fullName);
  }

  @Transactional
  public void resetWithToken(String rawToken, String newPassword) {
    if (rawToken == null || rawToken.isBlank()) {
      throw new IllegalArgumentException("Reset token is required.");
    }
    if (newPassword == null || newPassword.length() < 8) {
      throw new IllegalArgumentException("Password must be at least 8 characters.");
    }
    var hash = sha256Hex(rawToken.trim());
    var row =
        tokens
            .findFirstByTokenHashAndUsedIsFalseAndExpiresAtAfter(hash, Instant.now())
            .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset link."));

    // row.user is a FetchType.LAZY proxy — writing fields on the uninitialized proxy
    // without bytecode enhancement is unreliable. Load the managed entity explicitly.
    var u =
        users
            .findById(row.user.id)
            .orElseThrow(() -> new IllegalStateException("User not found for reset token."));
    u.passwordHash = passwordEncoder.encode(newPassword);
    u.updatedAt = Instant.now();
    users.save(u);

    row.used = true;
    tokens.save(row);
  }

  private static String sha256Hex(String s) {
    try {
      var md = MessageDigest.getInstance("SHA-256");
      var digest = md.digest(s.getBytes(StandardCharsets.UTF_8));
      return HexFormat.of().formatHex(digest);
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException(e);
    }
  }
}
