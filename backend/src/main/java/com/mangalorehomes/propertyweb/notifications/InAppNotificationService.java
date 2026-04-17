package com.mangalorehomes.propertyweb.notifications;

import com.mangalorehomes.propertyweb.users.UserEntity;
import com.mangalorehomes.propertyweb.users.UserRepository;
import java.time.Instant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InAppNotificationService {
  private final NotificationRepository notifications;
  private final UserRepository users;

  public InAppNotificationService(NotificationRepository notifications, UserRepository users) {
    this.notifications = notifications;
    this.users = users;
  }

  @Transactional
  public void notifyUser(long userId, String title, String message) {
    var u = users.findById(userId).orElse(null);
    if (u == null) return;
    var n = new NotificationEntity();
    n.user = u;
    n.title = title == null ? "Update" : title;
    n.message = message == null ? "" : message;
    n.isRead = false;
    n.createdAt = Instant.now();
    notifications.save(n);
  }
}
