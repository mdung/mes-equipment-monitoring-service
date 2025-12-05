package com.mes.repository;

import com.mes.model.UserNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {
    List<UserNotification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<UserNotification> findByUserIdAndIsReadOrderByCreatedAtDesc(Long userId, Boolean isRead);
    List<UserNotification> findByUserIdAndIsArchivedOrderByCreatedAtDesc(Long userId, Boolean isArchived);
    
    @Query("SELECT n FROM UserNotification n WHERE n.user.id = :userId AND n.isRead = false AND n.isArchived = false ORDER BY n.createdAt DESC")
    List<UserNotification> findUnreadByUser(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(n) FROM UserNotification n WHERE n.user.id = :userId AND n.isRead = false AND n.isArchived = false")
    Long countUnreadByUser(@Param("userId") Long userId);
    
    @Query("SELECT n FROM UserNotification n WHERE n.expiresAt < :now")
    List<UserNotification> findExpiredNotifications(@Param("now") LocalDateTime now);
    
    List<UserNotification> findByUserIdAndNotificationTypeOrderByCreatedAtDesc(Long userId, String notificationType);
}
