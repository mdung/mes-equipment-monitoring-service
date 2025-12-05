package com.mes.service;

import com.mes.model.User;
import com.mes.model.UserActivityLog;
import com.mes.repository.UserActivityLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserActivityService {

    @Autowired
    private UserActivityLogRepository activityLogRepository;

    @Autowired(required = false)
    private HttpServletRequest request;

    @Transactional
    public UserActivityLog logActivity(String username, String activityType, String description) {
        UserActivityLog log = new UserActivityLog();
        log.setUsername(username);
        log.setActivityType(activityType);
        log.setActivityDescription(description);
        log.setTimestamp(LocalDateTime.now());
        log.setStatus("SUCCESS");
        
        if (request != null) {
            log.setIpAddress(getClientIpAddress());
            log.setUserAgent(request.getHeader("User-Agent"));
            log.setSessionId(request.getSession(false) != null ? request.getSession().getId() : null);
        }
        
        return activityLogRepository.save(log);
    }

    @Transactional
    public UserActivityLog logActivity(User user, String activityType, String description, 
                                       String resourceType, Long resourceId) {
        UserActivityLog log = logActivity(user.getUsername(), activityType, description);
        log.setUser(user);
        log.setResourceType(resourceType);
        log.setResourceId(resourceId);
        return activityLogRepository.save(log);
    }

    @Transactional
    public UserActivityLog logFailedActivity(String username, String activityType, String description, String errorMessage) {
        UserActivityLog log = logActivity(username, activityType, description);
        log.setStatus("FAILED");
        log.setErrorMessage(errorMessage);
        return activityLogRepository.save(log);
    }

    public List<UserActivityLog> getUserActivities(Long userId) {
        return activityLogRepository.findByUserId(userId);
    }

    public List<UserActivityLog> getUserActivitiesInRange(Long userId, LocalDateTime start, LocalDateTime end) {
        return activityLogRepository.findUserActivityInRange(userId, start, end);
    }

    public List<UserActivityLog> getActivitiesByType(String activityType) {
        return activityLogRepository.findByActivityType(activityType);
    }

    public List<UserActivityLog> getActivitiesByDateRange(LocalDateTime start, LocalDateTime end) {
        return activityLogRepository.findByTimestampBetween(start, end);
    }

    public List<UserActivityLog> getRecentFailures(LocalDateTime since) {
        return activityLogRepository.findRecentFailures(since);
    }

    public Map<String, Long> getActivitySummary(LocalDateTime since) {
        List<Object[]> results = activityLogRepository.getActivitySummary(since);
        Map<String, Long> summary = new HashMap<>();
        for (Object[] result : results) {
            summary.put((String) result[0], (Long) result[1]);
        }
        return summary;
    }

    private String getClientIpAddress() {
        if (request == null) return null;
        
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}
