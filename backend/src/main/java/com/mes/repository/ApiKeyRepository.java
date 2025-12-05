package com.mes.repository;

import com.mes.model.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {
    Optional<ApiKey> findByApiKey(String apiKey);
    List<ApiKey> findByIsActive(Boolean isActive);
    Optional<ApiKey> findByKeyName(String keyName);
}
