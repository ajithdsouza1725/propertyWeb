package com.mangalorehomes.propertyweb.notifications;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class MailNotificationService {
  private static final Logger log = LoggerFactory.getLogger(MailNotificationService.class);

  private final ObjectProvider<JavaMailSender> mailSenderProvider;

  @Value("${app.mail.enabled:false}")
  private boolean enabled;

  @Value("${app.mail.from:noreply@mangalorehomes.local}")
  private String from;

  @Value("${app.mail.admin-alert:}")
  private String adminAlertTo;

  public MailNotificationService(ObjectProvider<JavaMailSender> mailSenderProvider) {
    this.mailSenderProvider = mailSenderProvider;
  }

  public void notifyAdminNewEnquiry(long enquiryId, String propertyTitle, String buyerName) {
    if (!enabled || adminAlertTo == null || adminAlertTo.isBlank()) {
      log.info(
          "[mail skipped] New enquiry #{} for '{}' from {} (enable app.mail.enabled + SMTP + app.mail.admin-alert)",
          enquiryId,
          propertyTitle,
          buyerName);
      return;
    }
    var mailSender = mailSenderProvider.getIfAvailable();
    if (mailSender == null) {
      log.warn("[mail skipped] JavaMailSender not configured (set spring.mail.*)");
      return;
    }
    var msg = new SimpleMailMessage();
    msg.setFrom(from);
    msg.setTo(adminAlertTo);
    msg.setSubject("New property enquiry #" + enquiryId);
    msg.setText(
        "New enquiry received.\n\n"
            + "Enquiry ID: "
            + enquiryId
            + "\nProperty: "
            + propertyTitle
            + "\nBuyer: "
            + buyerName
            + "\n\nReview in Admin → Enquiries.");
    try {
      mailSender.send(msg);
    } catch (RuntimeException ex) {
      log.error("Failed to send admin enquiry notification for #{}", enquiryId, ex);
    }
  }

  public void notifySellerLeadAssigned(long enquiryId, String sellerEmail, String propertyTitle) {
    if (!enabled || sellerEmail == null || sellerEmail.isBlank()) {
      log.info(
          "[mail skipped] Lead #{} assigned for '{}' — seller has no email or mail disabled",
          enquiryId,
          propertyTitle);
      return;
    }
    var mailSender = mailSenderProvider.getIfAvailable();
    if (mailSender == null) {
      log.warn("[mail skipped] JavaMailSender not configured (set spring.mail.*)");
      return;
    }
    var msg = new SimpleMailMessage();
    msg.setFrom(from);
    msg.setTo(sellerEmail);
    msg.setSubject("New lead assigned — enquiry #" + enquiryId);
    msg.setText(
        "A lead has been assigned to you.\n\n"
            + "Enquiry ID: "
            + enquiryId
            + "\nProperty: "
            + propertyTitle
            + "\n\nOpen Seller → Enquiries to view details.");
    try {
      mailSender.send(msg);
    } catch (RuntimeException ex) {
      log.error("Failed to send seller lead notification for #{}", enquiryId, ex);
    }
  }

  /** Sends reset link when SMTP is enabled; otherwise logs the link (dev-friendly). */
  public void sendPasswordReset(String email, String resetLink, String fullName) {
    if (email == null || email.isBlank()) {
      log.warn(
          "[password reset] User has no email on file. Reset link (dev): {}",
          resetLink);
      return;
    }
    if (!enabled) {
      log.info(
          "[password reset] Mail disabled — link for {} ({}): {}",
          fullName == null ? "user" : fullName,
          email,
          resetLink);
      return;
    }
    var mailSender = mailSenderProvider.getIfAvailable();
    if (mailSender == null) {
      log.warn("[password reset] JavaMailSender missing — link: {}", resetLink);
      return;
    }

    String displayName = (fullName == null || fullName.isBlank()) ? "there" : fullName;
    String plainText =
        "Hi " + displayName + ",\n\n"
            + "We received a request to reset your MangaloreHomes password.\n\n"
            + "Use this link to set a new password (valid for 1 hour):\n"
            + resetLink + "\n\n"
            + "If you didn't request this, you can safely ignore this email.\n\n"
            + "— MangaloreHomes";
    String html = buildPasswordResetHtml(displayName, resetLink);

    try {
      MimeMessage mime = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(mime, false, "UTF-8");
      helper.setFrom(from);
      helper.setTo(email.trim());
      helper.setSubject("Reset your MangaloreHomes password");
      helper.setText(plainText, html); // multipart/alternative
      mailSender.send(mime);
    } catch (MessagingException | RuntimeException ex) {
      log.error("Failed to send password reset email to {} — falling back to plain text", email, ex);
      // Last-resort plain-text fallback so the user still gets the link.
      try {
        var msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(email.trim());
        msg.setSubject("Reset your MangaloreHomes password");
        msg.setText(plainText);
        mailSender.send(msg);
      } catch (RuntimeException ex2) {
        log.error("Plain-text fallback also failed for {}", email, ex2);
      }
    }
  }

  private static String buildPasswordResetHtml(String displayName, String resetLink) {
    // Inline-styled HTML for maximum mail-client compatibility. No external assets.
    return """
        <!doctype html>
        <html>
          <head><meta charset="utf-8"><title>Reset your password</title></head>
          <body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a2e;">
            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 16px;">
              <tr><td align="center">
                <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
                  <tr>
                    <td style="background:linear-gradient(135deg,#4f46e5 0%%,#7c3aed 100%%);padding:32px 32px 28px;color:#ffffff;">
                      <div style="display:inline-flex;align-items:center;gap:10px;">
                        <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;font-size:18px;">🏠</div>
                        <span style="font-size:18px;font-weight:800;letter-spacing:-0.2px;">MangaloreHomes</span>
                      </div>
                      <h1 style="margin:20px 0 0;font-size:24px;font-weight:800;letter-spacing:-0.3px;">Reset your password</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:28px 32px 8px;font-size:15px;line-height:1.6;color:#2a2a3e;">
                      <p style="margin:0 0 14px;">Hi %s,</p>
                      <p style="margin:0 0 14px;">We received a request to reset the password for your MangaloreHomes account. Click the button below to set a new password. This link is valid for <strong>1 hour</strong>.</p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:12px 32px 24px;">
                      <a href="%s" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;box-shadow:0 6px 16px rgba(79,70,229,0.3);">Reset password</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 32px 24px;font-size:13px;line-height:1.6;color:#5a5a70;">
                      <p style="margin:0 0 10px;">Or copy this link into your browser:</p>
                      <p style="margin:0;word-break:break-all;"><a href="%s" style="color:#4f46e5;text-decoration:none;">%s</a></p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 32px 28px;border-top:1px solid #eeeef2;font-size:12px;line-height:1.6;color:#8a8a9e;">
                      <p style="margin:0 0 6px;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
                      <p style="margin:0;">© MangaloreHomes · Mangalore, Karnataka</p>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </body>
        </html>
        """.formatted(escapeHtml(displayName), resetLink, resetLink, resetLink);
  }

  private static String escapeHtml(String s) {
    if (s == null) return "";
    return s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;")
        .replace("'", "&#39;");
  }
}
