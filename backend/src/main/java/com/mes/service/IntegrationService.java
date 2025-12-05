package com.mes.service;

import com.mes.model.ExternalSystem;
import com.mes.model.IntegrationLog;
import com.mes.model.User;
import com.mes.repository.ExternalSystemRepository;
import com.mes.repository.IntegrationLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class IntegrationService {

    @Autowired
    private ExternalSystemRepository externalSystemRepository;

    @Autowired
    private IntegrationLogRepository integrationLogRepository;

    // External System Management
    @Transactional
    public ExternalSystem createExternalSystem(ExternalSystem system, User createdBy) {
        system.setCreatedBy(createdBy);
        system.setConnectionStatus("DISCONNECTED");
        return externalSystemRepository.save(system);
    }

    @Transactional
    public ExternalSystem updateExternalSystem(Long id, ExternalSystem systemDetails) {
        ExternalSystem system = externalSystemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("External system not found"));
        
        system.setSystemName(systemDetails.getSystemName());
        system.setSystemType(systemDetails.getSystemType());
        system.setDescription(systemDetails.getDescription());
        system.setBaseUrl(systemDetails.getBaseUrl());
        system.setApiKey(systemDetails.getApiKey());
        system.setApiSecret(systemDetails.getApiSecret());
        system.setAuthenticationType(systemDetails.getAuthenticationType());
        system.setIsActive(systemDetails.getIsActive());
        system.setSyncIntervalMinutes(systemDetails.getSyncIntervalMinutes());
        system.setConfiguration(systemDetails.getConfiguration());
        
        return externalSystemRepository.save(system);
    }

    public List<ExternalSystem> getAllExternalSystems() {
        return externalSystemRepository.findAll();
    }

    public List<ExternalSystem> getActiveExternalSystems() {
        return externalSystemRepository.findByIsActive(true);
    }

    public List<ExternalSystem> getExternalSystemsByType(String systemType) {
        return externalSystemRepository.findBySystemType(systemType);
    }

    public ExternalSystem getExternalSystemById(Long id) {
        return externalSystemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("External system not found"));
    }

    @Transactional
    public void deleteExternalSystem(Long id) {
        externalSystemRepository.deleteById(id);
    }

    @Transactional
    public ExternalSystem updateConnectionStatus(Long id, String status) {
        ExternalSystem system = getExternalSystemById(id);
        system.setConnectionStatus(status);
        if ("CONNECTED".equals(status)) {
            system.setLastSync(LocalDateTime.now());
        }
        return externalSystemRepository.save(system);
    }

    // Integration Logging
    @Transactional
    public IntegrationLog logIntegration(ExternalSystem system, String integrationType, 
                                        String operation, String direction, String status,
                                        String requestData, String responseData, 
                                        String errorMessage, Integer durationMs) {
        IntegrationLog log = new IntegrationLog();
        log.setExternalSystem(system);
        log.setIntegrationType(integrationType);
        log.setOperation(operation);
        log.setDirection(direction);
        log.setStatus(status);
        log.setRequestData(requestData);
        log.setResponseData(responseData);
        log.setErrorMessage(errorMessage);
        log.setDurationMs(durationMs);
        log.setTimestamp(LocalDateTime.now());
        
        return integrationLogRepository.save(log);
    }

    public List<IntegrationLog> getIntegrationLogs(Long systemId) {
        return integrationLogRepository.findRecentLogsBySystem(systemId);
    }

    public List<IntegrationLog> getIntegrationLogsByType(String integrationType) {
        return integrationLogRepository.findByIntegrationType(integrationType);
    }

    public List<IntegrationLog> getRecentFailures(LocalDateTime since) {
        return integrationLogRepository.findRecentFailures(since);
    }

    public List<IntegrationLog> getIntegrationLogsByDateRange(LocalDateTime start, LocalDateTime end) {
        return integrationLogRepository.findByTimestampBetween(start, end);
    }

    // Test Connection
    public boolean testConnection(Long systemId) {
        ExternalSystem system = getExternalSystemById(systemId);
        
        try {
            // Implement actual connection test based on system type
            // This is a placeholder
            boolean connected = performConnectionTest(system);
            
            if (connected) {
                updateConnectionStatus(systemId, "CONNECTED");
                logIntegration(system, system.getSystemType(), "TEST_CONNECTION", 
                             "OUTBOUND", "SUCCESS", null, "Connection successful", null, 100);
            } else {
                updateConnectionStatus(systemId, "DISCONNECTED");
                logIntegration(system, system.getSystemType(), "TEST_CONNECTION", 
                             "OUTBOUND", "FAILURE", null, null, "Connection failed", 100);
            }
            
            return connected;
        } catch (Exception e) {
            updateConnectionStatus(systemId, "ERROR");
            logIntegration(system, system.getSystemType(), "TEST_CONNECTION", 
                         "OUTBOUND", "FAILURE", null, null, e.getMessage(), 100);
            return false;
        }
    }

    private boolean performConnectionTest(ExternalSystem system) {
        // Placeholder for actual connection test logic
        // Would implement HTTP request, database connection, etc. based on system type
        return system.getBaseUrl() != null && !system.getBaseUrl().isEmpty();
    }
}
