package com.mangalorehomes.propertyweb.users;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
  Optional<UserEntity> findByEmailIgnoreCase(String email);

  Optional<UserEntity> findByPhone(String phone);

  boolean existsByEmailIgnoreCase(String email);

  boolean existsByPhone(String phone);
}

