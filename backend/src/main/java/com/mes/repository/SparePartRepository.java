package com.mes.repository;

import com.mes.model.SparePart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SparePartRepository extends JpaRepository<SparePart, Long> {
    Optional<SparePart> findByPartNumber(String partNumber);
    List<SparePart> findByCategory(String category);
    
    @Query("SELECT s FROM SparePart s WHERE s.quantityInStock <= s.minimumStockLevel")
    List<SparePart> findLowStockParts();
}
