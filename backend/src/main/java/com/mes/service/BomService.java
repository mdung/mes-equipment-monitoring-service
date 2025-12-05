package com.mes.service;

import com.mes.model.BomItem;
import com.mes.repository.BomItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BomService {

    @Autowired
    private BomItemRepository bomItemRepository;

    public List<BomItem> getBomByProductId(Long productId) {
        return bomItemRepository.findByProductId(productId);
    }

    public BomItem addBomItem(BomItem bomItem) {
        return bomItemRepository.save(bomItem);
    }

    public BomItem updateBomItem(Long id, BomItem bomItemDetails) {
        BomItem bomItem = bomItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("BOM item not found"));

        bomItem.setQuantity(bomItemDetails.getQuantity());
        bomItem.setUnitOfMeasure(bomItemDetails.getUnitOfMeasure());
        bomItem.setScrapPercentage(bomItemDetails.getScrapPercentage());
        bomItem.setNotes(bomItemDetails.getNotes());

        return bomItemRepository.save(bomItem);
    }

    public void deleteBomItem(Long id) {
        bomItemRepository.deleteById(id);
    }
}
