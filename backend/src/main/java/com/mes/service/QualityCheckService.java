package com.mes.service;

import com.mes.model.QualityCheck;
import com.mes.repository.QualityCheckRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class QualityCheckService {

    @Autowired
    private QualityCheckRepository qualityCheckRepository;

    public List<QualityCheck> getChecksByOrderId(Long orderId) {
        return qualityCheckRepository.findByProductionOrderId(orderId);
    }

    public QualityCheck recordCheck(QualityCheck check) {
        return qualityCheckRepository.save(check);
    }
}
