package com.mes.service;

import com.mes.model.AuditTrail;
import com.mes.model.User;
import com.mes.repository.AuditTrailRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class AuditService {

    @Autowired
    private AuditTrailRepository auditTrailRepository;

    @Autowired(required = false)
    private HttpServletRequest request;

    @Transactional
    public AuditTrail logAudit(String entityType, Long entityId, String action, String username, 
                               Map<String, Object> oldValues, Map<String, Object> newValues) {
        AuditTrail audit = new AuditTrail();
        audit.setEntityType(entityType);
        audit.setEntityId(entityId);
        audit.setAction(action);
        audit.setUsername(username);
        audit.setOldValues(oldValues);
        audit.setNewValues(newValues);
        audit.setTimestamp(LocalDateTime.now());
        
        if (request != null) {
            audit.setIpAddress(getClientIpAddress());
            audit.setUserAgent(request.getHeader("User-Agent"));
            audit.setSessionId(request.getSession(false) != null ? request.getSession().getId() : null);
        }
        
        audit.setChangesSummary(generateChangesSummary(oldValues, newValues));
        
        return auditTrailRepository.save(audit);
    }

    @Transactional
    public AuditTrail logAudit(String entityType, Long entityId, String action, User user, 
                               Map<String, Object> oldValues, Map<String, Object> newValues) {
        AuditTrail audit = logAudit(entityType, entityId, action, user.getUsername(), oldValues, newValues);
        audit.setUser(user);
        return auditTrailRepository.save(audit);
    }

    public List<AuditTrail> getEntityHistory(String entityType, Long entityId) {
        return auditTrailRepository.findEntityHistory(entityType, entityId);
    }

    public List<AuditTrail> getUserAudits(Long userId) {
        return auditTrailRepository.findByUserId(userId);
    }

    public List<AuditTrail> getAuditsByDateRange(LocalDateTime start, LocalDateTime end) {
        return auditTrailRepository.findAuditTrailByDateRange(start, end);
    }

    public List<AuditTrail> getAuditsByAction(String action) {
        return auditTrailRepository.findByAction(action);
    }

    public List<AuditTrail> getAuditsByEntityType(String entityType) {
        return auditTrailRepository.findByEntityType(entityType);
    }

    public Long getRecentAuditCount(LocalDateTime since) {
        return auditTrailRepository.countRecentAudits(since);
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

    private String generateChangesSummary(Map<String, Object> oldValues, Map<String, Object> newValues) {
        if (newValues == null || newValues.isEmpty()) {
            return "No changes";
        }
        
        StringBuilder summary = new StringBuilder();
        newValues.forEach((key, newValue) -> {
            Object oldValue = oldValues != null ? oldValues.get(key) : null;
            if (oldValue == null || !oldValue.equals(newValue)) {
                summary.append(key).append(": ");
                if (oldValue != null) {
                    summary.append(oldValue).append(" → ");
                }
                summary.append(newValue).append("; ");
            }
        });
        
        return summary.length() > 0 ? summary.toString() : "No changes";
    }
}
