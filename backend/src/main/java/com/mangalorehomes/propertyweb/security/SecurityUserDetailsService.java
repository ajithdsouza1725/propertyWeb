package com.mangalorehomes.propertyweb.security;

import com.mangalorehomes.propertyweb.users.UserEntity;
import com.mangalorehomes.propertyweb.users.UserRepository;
import java.util.Optional;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class SecurityUserDetailsService implements UserDetailsService {
  private final UserRepository users;

  public SecurityUserDetailsService(UserRepository users) {
    this.users = users;
  }

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    Optional<UserEntity> u;
    if (username != null && username.matches("^\\d+$")) {
      u = users.findById(Long.parseLong(username));
    } else
    if (username.contains("@")) {
      u = users.findByEmailIgnoreCase(username);
    } else {
      u = users.findByPhone(username);
    }
    var user =
        u.orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

    String principal = user.email != null ? user.email : user.phone;
    if (principal == null) principal = String.valueOf(user.id);
    return new SecurityUser(user.id, principal, user.passwordHash, user.role, user.status);
  }
}

