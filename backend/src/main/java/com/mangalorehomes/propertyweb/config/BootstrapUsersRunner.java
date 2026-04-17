package com.mangalorehomes.propertyweb.config;

import com.mangalorehomes.propertyweb.catalog.LocalityRepository;
import com.mangalorehomes.propertyweb.catalog.PropertyTypeRepository;
import com.mangalorehomes.propertyweb.enquiries.EnquiryEntity;
import com.mangalorehomes.propertyweb.enquiries.EnquiryStatus;
import com.mangalorehomes.propertyweb.enquiries.EnquiryRepository;
import com.mangalorehomes.propertyweb.catalog.LocalityEntity;
import com.mangalorehomes.propertyweb.properties.ApprovalStatus;
import com.mangalorehomes.propertyweb.properties.ListingStatus;
import com.mangalorehomes.propertyweb.properties.PropertyEntity;
import com.mangalorehomes.propertyweb.properties.PropertyImageEntity;
import com.mangalorehomes.propertyweb.properties.PropertyImageRepository;
import com.mangalorehomes.propertyweb.properties.PropertyPurpose;
import com.mangalorehomes.propertyweb.properties.PropertyRepository;
import com.mangalorehomes.propertyweb.security.UserRole;
import com.mangalorehomes.propertyweb.security.UserStatus;
import com.mangalorehomes.propertyweb.users.UserEntity;
import com.mangalorehomes.propertyweb.users.UserRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class BootstrapUsersRunner implements CommandLineRunner {
  private static final Logger log = LoggerFactory.getLogger(BootstrapUsersRunner.class);

  private final UserRepository users;
  private final PasswordEncoder encoder;
  private final PropertyRepository properties;
  private final PropertyTypeRepository types;
  private final LocalityRepository localities;
  private final EnquiryRepository enquiries;
  private final PropertyImageRepository propertyImages;
  private final Path uploadsDir;

  private final boolean enabled;
  private final String adminEmail;
  private final String adminPassword;
  private final String sellerEmail;
  private final String sellerPassword;
  private final String agentEmail;
  private final String agentPassword;

  public BootstrapUsersRunner(
      UserRepository users,
      PasswordEncoder encoder,
      PropertyRepository properties,
      PropertyTypeRepository types,
      LocalityRepository localities,
      EnquiryRepository enquiries,
      PropertyImageRepository propertyImages,
      @Value("${app.uploads.dir:${user.home}/.mangalorehomes/uploads}") String uploadsDir,
      @Value("${app.bootstrap.enabled:false}") boolean enabled,
      @Value("${app.bootstrap.admin.email:admin@mangalorehomes.local}") String adminEmail,
      @Value("${app.bootstrap.admin.password:admin12345}") String adminPassword,
      @Value("${app.bootstrap.seller.email:seller@mangalorehomes.local}") String sellerEmail,
      @Value("${app.bootstrap.seller.password:seller12345}") String sellerPassword,
      @Value("${app.bootstrap.agent.email:agent@mangalorehomes.local}") String agentEmail,
      @Value("${app.bootstrap.agent.password:agent12345}") String agentPassword) {
    this.users = users;
    this.encoder = encoder;
    this.properties = properties;
    this.types = types;
    this.localities = localities;
    this.enquiries = enquiries;
    this.propertyImages = propertyImages;
    this.uploadsDir = Path.of(uploadsDir).toAbsolutePath().normalize();
    this.enabled = enabled;
    this.adminEmail = adminEmail;
    this.adminPassword = adminPassword;
    this.sellerEmail = sellerEmail;
    this.sellerPassword = sellerPassword;
    this.agentEmail = agentEmail;
    this.agentPassword = agentPassword;
  }

  @Override
  public void run(String... args) {
    // Always ensure an admin account exists, even when demo bootstrap is disabled.
    ensureAdminAccount();

    // Demo data (seller/agent + properties/enquiries) stays behind the bootstrap flag.
    if (!enabled) return;

    var seller =
        getOrCreateUser(
        "Demo Seller",
        sellerEmail.toLowerCase(Locale.ROOT),
        sellerPassword,
        UserRole.owner,
        "9888811111",
        "Coastal Realty");

    var agent =
        getOrCreateUser(
            "Demo Agent",
            agentEmail.toLowerCase(Locale.ROOT),
            agentPassword,
            UserRole.agent,
            "9777722222",
            "Kudla Agents");

    seedDemoProperties(seller, agent);
    seedDemoEnquiries();
  }

  // Known defaults we refuse to create an admin with — prevents a well-known backdoor
  // if the operator forgets to set BOOTSTRAP_ADMIN_PASSWORD.
  private static final java.util.Set<String> FORBIDDEN_DEFAULT_ADMIN_PASSWORDS =
      java.util.Set.of("admin", "admin12345", "password", "changeme", "123456", "admin123");

  /**
   * Creates an admin only when BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD are both set
   * explicitly, and the password isn't a known weak default. Never silently re-writes the
   * password of an existing admin — an operator who wants to rotate credentials should do it
   * intentionally through a separate admin-management flow, not via app restart.
   */
  private void ensureAdminAccount() {
    var email = adminEmail == null ? null : adminEmail.trim().toLowerCase(Locale.ROOT);
    if (email == null || email.isBlank()) return;

    var existing = users.findByEmailIgnoreCase(email);
    if (existing.isPresent()) {
      // Respect existing admin account; only ensure role + status are correct so a demoted
      // or suspended admin can be recovered by an operator setting BOOTSTRAP_ADMIN_EMAIL.
      var u = existing.get();
      boolean changed = false;
      if (u.role != UserRole.admin) { u.role = UserRole.admin; changed = true; }
      if (u.status != UserStatus.active) { u.status = UserStatus.active; changed = true; }
      if (u.fullName == null || u.fullName.isBlank()) { u.fullName = "Admin"; changed = true; }
      if (changed) {
        u.updatedAt = Instant.now();
        users.save(u);
        log.info("[bootstrap] Existing admin {} role/status normalized; password untouched.", email);
      }
      return;
    }

    // No admin yet — only create if operator supplied a real password. Refuse known defaults.
    if (adminPassword == null || adminPassword.isBlank()) {
      log.warn(
          "[bootstrap] No admin account exists and BOOTSTRAP_ADMIN_PASSWORD is not set. "
              + "Create one manually (e.g. SQL migration) or set BOOTSTRAP_ADMIN_PASSWORD to a strong value.");
      return;
    }
    if (FORBIDDEN_DEFAULT_ADMIN_PASSWORDS.contains(adminPassword.trim().toLowerCase(Locale.ROOT))
        || adminPassword.trim().length() < 10) {
      log.error(
          "[bootstrap] Refusing to create admin {} with a weak/default password. "
              + "Set BOOTSTRAP_ADMIN_PASSWORD to a value >= 10 chars and not in the common-defaults list.",
          email);
      return;
    }

    var u = new UserEntity();
    u.fullName = "Admin";
    u.email = email;
    u.role = UserRole.admin;
    u.status = UserStatus.active;
    u.isVerified = true;
    u.passwordHash = encoder.encode(adminPassword);
    u.createdAt = Instant.now();
    u.updatedAt = Instant.now();
    users.save(u);
    log.info("[bootstrap] Admin {} created. Rotate the password from the admin panel.", email);
  }

  private UserEntity getOrCreateUser(
      String fullName, String email, String password, UserRole role, String phone, String businessName) {
    var existing = users.findByEmailIgnoreCase(email);
    if (existing.isPresent()) {
      var u = existing.get();
      boolean changed = false;
      if (u.phone == null && phone != null) {
        u.phone = phone;
        changed = true;
      }
      if (u.businessName == null && businessName != null) {
        u.businessName = businessName;
        changed = true;
      }
      if (changed) users.save(u);
      return u;
    }

    var u = new UserEntity();
    u.fullName = fullName;
    u.email = email;
    u.phone = phone;
    u.passwordHash = encoder.encode(password);
    u.role = role;
    u.businessName = businessName;
    u.status = UserStatus.active;
    u.isVerified = true;
    return users.save(u);
  }

  private void seedDemoProperties(UserEntity seller, UserEntity agent) {
    var residential =
        types.findBySlug("residential").orElseGet(() -> types.findAll().stream().findFirst().orElseThrow());
    var commercial =
        types.findBySlug("commercial").orElseGet(() -> types.findAll().stream().findFirst().orElseThrow());
    var land =
        types.findBySlug("land").orElseGet(() -> types.findAll().stream().findFirst().orElseThrow());
    var agri =
        types.findBySlug("agricultural-land").orElseGet(() -> types.findAll().stream().findFirst().orElseThrow());

    // Ensure sample localities exist (from user-provided sample list)
    var bejai = ensureLocality("Mangalore", "Bejai", "bejai", true);
    var kadri = ensureLocality("Mangalore", "Kadri", "kadri", true);
    var mgRoad = ensureLocality("Mangalore", "MG Road", "mg-road", false);
    var surathkal = ensureLocality("Mangalore", "Surathkal", "surathkal", false);
    var moodbidri = ensureLocality("Moodbidri", "Moodbidri", "moodbidri", false);
    var kulshekar = ensureLocality("Mangalore", "Kulshekar", "kulshekar", false);
    var pumpwell = ensureLocality("Mangalore", "Pumpwell", "pumpwell", false);
    var kavoor = ensureLocality("Mangalore", "Kavoor", "kavoor", false);
    var bantwal = ensureLocality("Bantwal", "Bantwal", "bantwal", false);
    var balmatta = ensureLocality("Mangalore", "Balmatta", "balmatta", false);
    var hampankatta = ensureLocality("Mangalore", "Hampankatta", "hampankatta", false);

    // Map BUY -> sell listings in our DB (buyer side maps /buy to sell listings)
    // --- BUY (stored as sell) ---
    ensureProperty(
        seller,
        "3BHK Apartment in Bejai",
        "3bhk-apartment-in-bejai",
        PropertyPurpose.sell,
        residential,
        bejai,
        8500000L,
        3,
        2,
        1450,
        null,
        "semi-furnished",
        ApprovalStatus.approved,
        null,
        false,
        true,
        new LinkedHashMap<>());

    ensureProperty(
        seller,
        "2BHK Flat in Kadri",
        "2bhk-flat-in-kadri",
        PropertyPurpose.sell,
        residential,
        kadri,
        6200000L,
        2,
        2,
        1100,
        null,
        "furnished",
        ApprovalStatus.approved,
        null,
        false,
        true,
        new LinkedHashMap<>());

    ensureProperty(
        agent,
        "Office Space in MG Road",
        "office-space-in-mg-road",
        PropertyPurpose.sell,
        commercial,
        mgRoad,
        15000000L,
        null,
        null,
        2000,
        2,
        null,
        ApprovalStatus.pending,
        null,
        false,
        false,
        new LinkedHashMap<>());

    var landExtras1 = new LinkedHashMap<String, Object>();
    landExtras1.put("roadAccess", "Yes");
    landExtras1.put("surveyNo", "45/2A");
    ensureProperty(
        seller,
        "Residential Plot in Surathkal",
        "residential-plot-in-surathkal",
        PropertyPurpose.sell,
        land,
        surathkal,
        3500000L,
        null,
        null,
        2400,
        null,
        null,
        ApprovalStatus.approved,
        null,
        false,
        true,
        landExtras1);

    var agriExtras1 = new LinkedHashMap<String, Object>();
    agriExtras1.put("waterSource", "Borewell");
    agriExtras1.put("soilType", "Red Soil");
    ensureProperty(
        agent,
        "Agricultural Land in Moodbidri",
        "agricultural-land-in-moodbidri",
        PropertyPurpose.sell,
        agri,
        moodbidri,
        1200000L,
        null,
        null,
        acresToSqft(1.5),
        null,
        null,
        ApprovalStatus.rejected,
        "Please provide land documents and survey details for verification.",
        false,
        false,
        agriExtras1);

    // --- SELL (stored as sell) ---
    ensureProperty(
        seller,
        "4BHK Villa for Sale in Kulshekar",
        "4bhk-villa-for-sale-in-kulshekar",
        PropertyPurpose.sell,
        residential,
        kulshekar,
        18000000L,
        4,
        3,
        2500,
        null,
        null,
        ApprovalStatus.pending,
        null,
        false,
        false,
        new LinkedHashMap<>());

    ensureProperty(
        agent,
        "Retail Shop in Pumpwell",
        "retail-shop-in-pumpwell",
        PropertyPurpose.sell,
        commercial,
        pumpwell,
        9500000L,
        null,
        null,
        900,
        1,
        null,
        ApprovalStatus.approved,
        null,
        false,
        true,
        new LinkedHashMap<>());

    var landExtras2 = new LinkedHashMap<String, Object>();
    landExtras2.put("roadAccess", "Yes");
    landExtras2.put("surveyNo", "12/1");
    ensureProperty(
        seller,
        "Plot for Sale in Kavoor",
        "plot-for-sale-in-kavoor",
        PropertyPurpose.sell,
        land,
        kavoor,
        4000000L,
        null,
        null,
        3000,
        null,
        null,
        ApprovalStatus.approved,
        null,
        false,
        true,
        landExtras2);

    var agriExtras2 = new LinkedHashMap<String, Object>();
    agriExtras2.put("waterSource", "River");
    agriExtras2.put("soilType", "Fertile");
    ensureProperty(
        agent,
        "Farmland for Sale in Bantwal",
        "farmland-for-sale-in-bantwal",
        PropertyPurpose.sell,
        agri,
        bantwal,
        2200000L,
        null,
        null,
        acresToSqft(2.0),
        null,
        null,
        ApprovalStatus.pending,
        null,
        false,
        false,
        agriExtras2);

    var attavar = ensureLocality("Mangalore", "Attavar", "attavar", false);
    ensureProperty(
        seller,
        "Premium 3BHK in Attavar — pending admin review",
        "premium-3bhk-attavar-pending-demo",
        PropertyPurpose.sell,
        residential,
        attavar,
        9200000L,
        3,
        3,
        1650,
        null,
        "semi-furnished",
        ApprovalStatus.pending,
        null,
        false,
        false,
        new LinkedHashMap<>());

    // --- RENT (stored as rent) ---
    ensureProperty(
        seller,
        "2BHK for Rent in Balmatta",
        "2bhk-for-rent-in-balmatta",
        PropertyPurpose.rent,
        residential,
        balmatta,
        18000L,
        2,
        2,
        1000,
        null,
        null,
        ApprovalStatus.approved,
        null,
        false,
        true,
        new LinkedHashMap<>());

    ensureProperty(
        agent,
        "Office for Rent in Hampankatta",
        "office-for-rent-in-hampankatta",
        PropertyPurpose.rent,
        commercial,
        hampankatta,
        45000L,
        null,
        null,
        1200,
        1,
        null,
        ApprovalStatus.approved,
        null,
        false,
        true,
        new LinkedHashMap<>());

    seedDemoPropertyImages();
  }

  private LocalityEntity ensureLocality(String city, String name, String slug, boolean featured) {
    var existing = localities.findBySlug(slug);
    if (existing.isPresent()) return existing.get();
    var l = new LocalityEntity();
    l.city = city;
    l.name = name;
    l.slug = slug;
    l.isFeatured = featured;
    l.isActive = true;
    l.createdAt = Instant.now();
    l.updatedAt = Instant.now();
    return localities.save(l);
  }

  private static int acresToSqft(double acres) {
    // 1 acre = 43,560 sqft
    return (int) Math.round(acres * 43560.0);
  }

  private void ensureProperty(
      UserEntity seller,
      String title,
      String slug,
      PropertyPurpose purpose,
      com.mangalorehomes.propertyweb.catalog.PropertyTypeEntity type,
      com.mangalorehomes.propertyweb.catalog.LocalityEntity locality,
      long price,
      Integer bedrooms,
      Integer bathrooms,
      Integer areaSqft,
      Integer parkingCount,
      String furnishingStatus,
      ApprovalStatus approval,
      String rejectionReason,
      boolean featured,
      boolean verified,
      Object extraFields) {
    if (properties.findBySlug(slug).isPresent()) return;
    var p = new PropertyEntity();
    p.user = seller;
    p.title = title;
    p.slug = slug;
    p.purpose = purpose;
    p.propertyType = type;
    p.locality = locality;
    p.city = locality.city;
    p.addressLine = locality.name + ", " + locality.city;
    p.price = price;
    p.description = "Demo listing for testing approvals and enquiries.";
    p.approvalStatus = approval;
    p.rejectionReason = rejectionReason;
    p.listingStatus = ListingStatus.active;
    p.isFeatured = featured;
    p.isVerified = verified;
    p.bedrooms = bedrooms;
    p.bathrooms = bathrooms;
    p.areaSqft = areaSqft;
    p.parkingCount = parkingCount;
    p.furnishingStatus = furnishingStatus;
    @SuppressWarnings("unchecked")
    Map<String, Object> extras =
        extraFields instanceof Map<?, ?> m
            ? (Map<String, Object>) m
            : new LinkedHashMap<String, Object>();
    p.extraFields = extras;
    p.createdAt = Instant.now();
    p.updatedAt = Instant.now();
    properties.save(p);
  }

  /**
   * Copies four sample SVGs from classpath into {@code app.uploads.dir} and links them to demo listings so
   * the public site and admin approval screens show images. Skips if the property already has images.
   */
  private void seedDemoPropertyImages() {
    installDemoImageIfMissing("3bhk-apartment-in-bejai", "demo-1.svg", "pw-demo-bejai.svg");
    installDemoImageIfMissing("2bhk-flat-in-kadri", "demo-2.svg", "pw-demo-kadri.svg");
    installDemoImageIfMissing("retail-shop-in-pumpwell", "demo-3.svg", "pw-demo-pumpwell.svg");
    installDemoImageIfMissing("2bhk-for-rent-in-balmatta", "demo-4.svg", "pw-demo-balmatta.svg");
    installDemoImageIfMissing("office-space-in-mg-road", "demo-1.svg", "pw-demo-pending-mgroad.svg");
    installDemoImageIfMissing("4bhk-villa-for-sale-in-kulshekar", "demo-2.svg", "pw-demo-pending-kulshekar.svg");
    installDemoImageIfMissing("farmland-for-sale-in-bantwal", "demo-3.svg", "pw-demo-pending-bantwal.svg");
    installDemoImageIfMissing("premium-3bhk-attavar-pending-demo", "demo-4.svg", "pw-demo-pending-attavar.svg");
  }

  private void installDemoImageIfMissing(String slug, String resourceName, String publicFilename) {
    var prop = properties.findBySlug(slug).orElse(null);
    if (prop == null) return;
    if (propertyImages.countByPropertyId(prop.id) > 0) return;
    try {
      Files.createDirectories(uploadsDir);
      var resource = new ClassPathResource("bootstrap-images/" + resourceName);
      if (!resource.exists()) {
        log.warn("Bootstrap demo image missing on classpath: bootstrap-images/{}", resourceName);
        return;
      }
      Path target = uploadsDir.resolve(publicFilename).normalize();
      if (!target.startsWith(uploadsDir)) {
        throw new IllegalStateException("Invalid upload path.");
      }
      try (var in = resource.getInputStream()) {
        Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
      }
      var img = new PropertyImageEntity();
      img.property = prop;
      img.imageUrl = "/uploads/" + publicFilename;
      img.altText = prop.title;
      img.sortOrder = 0;
      img.createdAt = Instant.now();
      propertyImages.save(img);
    } catch (IOException e) {
      log.warn("Could not install demo image for {}: {}", slug, e.getMessage());
    }
  }

  private void seedDemoEnquiries() {
    // Create a couple of unassigned enquiries for admin inbox.
    var prop = properties.findBySlug("3bhk-apartment-in-bejai").orElse(null);
    if (prop == null) return;

    boolean already =
        enquiries.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
            .anyMatch(e -> e.property != null && e.property.id != null && e.property.id.equals(prop.id));
    if (already) return;

    var e1 = new EnquiryEntity();
    e1.property = prop;
    e1.user = null;
    e1.assignedSeller = null;
    e1.assignedAt = null;
    e1.name = "Naveen";
    e1.phone = "9800012345";
    e1.email = "naveen@example.com";
    e1.message = "Is it negotiable? Can we visit this weekend?";
    e1.status = EnquiryStatus.NEW;
    e1.source = "website";
    e1.createdAt = Instant.now();
    e1.updatedAt = Instant.now();
    enquiries.save(e1);

    var e2 = new EnquiryEntity();
    e2.property = prop;
    e2.user = null;
    e2.assignedSeller = null;
    e2.assignedAt = null;
    e2.name = "Shreya";
    e2.phone = "9800056789";
    e2.email = "shreya@example.com";
    e2.message = "What’s the deposit and maintenance?";
    e2.status = EnquiryStatus.NEW;
    e2.source = "website";
    e2.createdAt = Instant.now();
    e2.updatedAt = Instant.now();
    enquiries.save(e2);
  }
}

