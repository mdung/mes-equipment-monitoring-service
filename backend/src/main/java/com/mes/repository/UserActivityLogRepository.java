package com.mes.repository;

import com.mes.model.UserActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserActivityLogRepository extends JpaRepository<UserActivityLog, Long> {
    List<UserActivityLog> findByUserId(Long userId);
    List<UserActivityLog> findByUsername(String username);
    List<UserActivityLog> findByActivityType(String activityType);
    List<UserActivityLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
    List<UserActivityLog> findByResourceTypeAndResourceId(String resourceType, Long resourceId);
    List<UserActivityLog> findBySessionId(String sessionId);
    List<UserActivityLog> findByStatus(String status);
    
    @Query("SELECT a FROM UserActivityLog a WHERE a.user.id = :userId AND a.timestamp BETWEEN :start AND :end ORDER BY a.timestamp DESC")
    List<UserActivityLog> findUserActivityInRange(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT a.activityType, COUNT(a) FROM UserActivityLog a WHERE a.timestamp >= :since GROUP BY a.activityType")
    List<Object[]> getActivitySummary(@Param("since") LocalDateTime since);
    
    @Query("SELECT a FROM UserActivityLog a WHERE a.status = 'FAILED' AND a.timestamp >= :since ORDER BY a.timestamp DESC")
    List<UserActivityLog> findRecentFailures(@Param("since") LocalDateTime since);
}
