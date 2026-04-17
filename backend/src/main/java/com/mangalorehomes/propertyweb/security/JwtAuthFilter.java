package com.mangalorehomes.propertyweb.security;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
  private final JwtService jwt;
  private final SecurityUserDetailsService users;

  public JwtAuthFilter(JwtService jwt, SecurityUserDetailsService users) {
    this.jwt = jwt;
    this.users = users;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String header = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (header == null || !header.startsWith("Bearer ")) {
      filterChain.doFilter(request, response);
      return;
    }

    if (SecurityContextHolder.getContext().getAuthentication() != null) {
      filterChain.doFilter(request, response);
      return;
    }

    String token = header.substring("Bearer ".length()).trim();
    try {
      var claims = jwt.parse(token);
      String subject = claims.getSubject();
      if (subject == null || subject.isBlank()) {
        filterChain.doFilter(request, response);
        return;
      }

      // We store subject as userId; load by id is custom, so we load by "id" string.
      // For simplicity, we use a pseudo-username = userId and handle that in loadUserByUsername.
      UserDetails userDetails = users.loadUserByUsername(subject);

      var auth =
          new UsernamePasswordAuthenticationToken(
              userDetails, null, userDetails.getAuthorities());
      auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
      SecurityContextHolder.getContext().setAuthentication(auth);
    } catch (JwtException | IllegalArgumentException ignored) {
      // Ignore invalid tokens; endpoints will behave as unauthenticated.
    }

    filterChain.doFilter(request, response);
  }
}

