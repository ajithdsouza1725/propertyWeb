package com.mangalorehomes.propertyweb.seller;

import com.mangalorehomes.propertyweb.security.UserRole;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.mangalorehomes.propertyweb.security.SecurityUser;

@RestController
@RequestMapping("/api/seller")
public class SellerUploadController {
  private final Path uploadsDir;

  public SellerUploadController(@Value("${app.uploads.dir:uploads}") String uploadsDir) {
    this.uploadsDir = Path.of(uploadsDir);
  }

  @PreAuthorize("hasAnyRole('OWNER','AGENT','ADMIN')")
  @PostMapping("/uploads")
  public Object upload(
      @AuthenticationPrincipal SecurityUser principal, @RequestParam("file") MultipartFile file) {
    if (principal.role() == UserRole.buyer) throw new IllegalArgumentException("Not allowed");
    if (file == null || file.isEmpty()) throw new IllegalArgumentException("File is required.");
    try {
      Files.createDirectories(uploadsDir);
      String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);
      String ext = "";
      int dot = original.lastIndexOf('.');
      if (dot >= 0 && dot < original.length() - 1) ext = original.substring(dot + 1);
      if (ext.length() > 8) ext = "";

      String name = "p_" + Instant.now().toEpochMilli() + "_" + UUID.randomUUID();
      String filename = ext.isBlank() ? name : (name + "." + ext);
      Path target = uploadsDir.resolve(filename).normalize();
      File out = target.toFile();
      file.transferTo(out);
      // Returned URL is relative to backend.
      return java.util.Map.of("url", "/uploads/" + filename);
    } catch (Exception e) {
      throw new IllegalArgumentException("Upload failed.");
    }
  }
}

