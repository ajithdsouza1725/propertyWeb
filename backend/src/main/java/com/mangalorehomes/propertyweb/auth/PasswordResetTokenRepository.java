package com.mangalorehomes.propertyweb.auth;

import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetTokenEntity, Long> {

  Optional<PasswordResetTokenEntity> findFirstByTokenHashAndUsedIsFalseAndExpiresAtAfter(
      String tokenHash, Instant now);
}
