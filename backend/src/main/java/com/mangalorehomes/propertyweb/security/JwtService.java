package com.mangalorehomes.propertyweb.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final SecretKey key;
  private final String issuer;
  private final long accessTtlMinutes;

  public JwtService(
      @Value("${app.security.jwt.secret}") String secret,
      @Value("${app.security.jwt.issuer}") String issuer,
      @Value("${app.security.jwt.accessTokenTtlMinutes}") long accessTtlMinutes) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.issuer = issuer;
    this.accessTtlMinutes = accessTtlMinutes;
  }

  public String createAccessToken(Long userId, UserRole role) {
    Instant now = Instant.now();
    Instant exp = now.plusSeconds(accessTtlMinutes * 60);
    return Jwts.builder()
        .issuer(issuer)
        .subject(String.valueOf(userId))
        .issuedAt(Date.from(now))
        .expiration(Date.from(exp))
        .claims(Map.of("role", role.name()))
        .signWith(key)
        .compact();
  }

  public Claims parse(String token) {
    return Jwts.parser()
        .verifyWith(key)
        .requireIssuer(issuer)
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }
}

