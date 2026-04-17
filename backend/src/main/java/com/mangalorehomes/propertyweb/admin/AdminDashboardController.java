package com.mangalorehomes.propertyweb.admin;

import com.mangalorehomes.propertyweb.enquiries.EnquiryRepository;
import com.mangalorehomes.propertyweb.enquiries.EnquiryStatus;
import com.mangalorehomes.propertyweb.properties.ApprovalStatus;
import com.mangalorehomes.propertyweb.properties.PropertyRepository;
import com.mangalorehomes.propertyweb.support.ContactMessageRepository;
import com.mangalorehomes.propertyweb.users.UserRepository;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
@Transactional(readOnly = true)
public class AdminDashboardController {
  private final PropertyRepository properties;
  private final UserRepository users;
  private final EnquiryRepository enquiries;
  private final ContactMessageRepository contacts;

  public AdminDashboardController(
      PropertyRepository properties,
      UserRepository users,
      EnquiryRepository enquiries,
      ContactMessageRepository contacts) {
    this.properties = properties;
    this.users = users;
    this.enquiries = enquiries;
    this.contacts = contacts;
  }

  @GetMapping("/stats")
  public Map<String, Object> stats() {
    var m = new LinkedHashMap<String, Object>();
    m.put("propertiesPending", properties.countByApprovalStatus(ApprovalStatus.pending));
    m.put("propertiesApproved", properties.countByApprovalStatus(ApprovalStatus.approved));
    m.put("propertiesRejected", properties.countByApprovalStatus(ApprovalStatus.rejected));
    m.put("usersTotal", users.count());
    m.put("enquiriesNew", enquiries.countByStatus(EnquiryStatus.NEW));
    m.put("enquiriesAssigned", enquiries.countByStatus(EnquiryStatus.ASSIGNED));
    m.put("enquiriesClosed", enquiries.countByStatus(EnquiryStatus.CLOSED));
    m.put("contactMessagesTotal", contacts.count());
    return m;
  }
}
