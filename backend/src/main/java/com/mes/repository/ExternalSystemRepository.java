package com.mes.repository;

import com.mes.model.ExternalSystem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExternalSystemRepository extends JpaRepository<ExternalSystem, Long> {
    Optional<ExternalSystem> findBySystemName(String systemName);
    List<ExternalSystem> findBySystemType(String systemType);
    List<ExternalSystem> findByIsActive(Boolean isActive);
    List<ExternalSystem> findByConnectionStatus(String connectionStatus);
}
