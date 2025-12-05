package com.mes.repository;

import com.mes.model.BomItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BomItemRepository extends JpaRepository<BomItem, Long> {
    List<BomItem> findByProductId(Long productId);
}
