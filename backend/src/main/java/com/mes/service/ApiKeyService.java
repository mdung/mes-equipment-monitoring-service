package com.mes.service;

import com.mes.model.ApiKey;
import com.mes.model.User;
import com.mes.repository.ApiKeyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Service
public class ApiKeyService {

    @Autowired
    private ApiKeyRepository apiKeyRepository;

    private static final SecureRandom secureRandom = new SecureRandom();
    private static final Base64.Encoder base64Encoder = Base64.getUrlEncoder();

    @Transactional
    public ApiKey createApiKey(String keyName, String description, List<String> permissions, 
                               LocalDateTime expiresAt, User createdBy) {
        ApiKey apiKey = new ApiKey();
        apiKey.setKeyName(keyName);
        apiKey.setApiKey(generateApiKey());
        apiKey.setApiSecret(generateApiSecret());
        apiKey.setDescription(description);
        apiKey.setPermissions(permissions);
        apiKey.setExpiresAt(expiresAt);
        apiKey.setCreatedBy(createdBy);
        apiKey.setIsActive(true);
        
        return apiKeyRepository.save(apiKey);
    }

    @Transactional
    public ApiKey updateApiKey(Long id, ApiKey apiKeyDetails) {
        ApiKey apiKey = apiKeyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("API key not found"));
        
        apiKey.setKeyName(apiKeyDetails.getKeyName());
        apiKey.setDescription(apiKeyDetails.getDescription());
        apiKey.setPermissions(apiKeyDetails.getPermissions());
        apiKey.setIsActive(apiKeyDetails.getIsActive());
        apiKey.setRateLimitPerMinute(apiKeyDetails.getRateLimitPerMinute());
        apiKey.setRateLimitPerHour(apiKeyDetails.getRateLimitPerHour());
        apiKey.setAllowedIpAddresses(apiKeyDetails.getAllowedIpAddresses());
        apiKey.setExpiresAt(apiKeyDetails.getExpiresAt());
        
        return apiKeyRepository.save(apiKey);
    }

    public List<ApiKey> getAllApiKeys() {
        return apiKeyRepository.findAll();
    }

    public List<ApiKey> getActiveApiKeys() {
        return apiKeyRepository.findByIsActive(true);
    }

    public ApiKey getApiKeyById(Long id) {
        return apiKeyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("API key not found"));
    }

    public ApiKey validateApiKey(String apiKey) {
        ApiKey key = apiKeyRepository.findByApiKey(apiKey)
                .orElseThrow(() -> new RuntimeException("Invalid API key"));
        
        if (!key.getIsActive()) {
            throw new RuntimeException("API key is inactive");
        }
        
        if (key.getExpiresAt() != null && key.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("API key has expired");
        }
        
        return key;
    }

    @Transactional
    public void recordApiKeyUsage(String apiKey) {
        ApiKey key = apiKeyRepository.findByApiKey(apiKey).orElse(null);
        if (key != null) {
            key.setLastUsed(LocalDateTime.now());
            key.setUsageCount(key.getUsageCount() + 1);
            apiKeyRepository.save(key);
        }
    }

    @Transactional
    public void revokeApiKey(Long id) {
        ApiKey apiKey = getApiKeyById(id);
        apiKey.setIsActive(false);
        apiKeyRepository.save(apiKey);
    }

    @Transactional
    public void deleteApiKey(Long id) {
        apiKeyRepository.deleteById(id);
    }

    private String generateApiKey() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return "mk_" + base64Encoder.encodeToString(randomBytes).substring(0, 40);
    }

    private String generateApiSecret() {
        byte[] randomBytes = new byte[48];
        secureRandom.nextBytes(randomBytes);
        return "sk_" + base64Encoder.encodeToString(randomBytes).substring(0, 60);
    }

    public boolean hasPermission(ApiKey apiKey, String permission) {
        return apiKey.getPermissions() != null && apiKey.getPermissions().contains(permission);
    }

    public boolean isIpAllowed(ApiKey apiKey, String ipAddress) {
        if (apiKey.getAllowedIpAddresses() == null || apiKey.getAllowedIpAddresses().length == 0) {
            return true; // No IP restriction
        }
        
        for (String allowedIp : apiKey.getAllowedIpAddresses()) {
            if (allowedIp.equals(ipAddress)) {
                return true;
            }
        }
        
        return false;
    }
}
