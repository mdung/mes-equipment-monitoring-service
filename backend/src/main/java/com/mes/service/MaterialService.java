package com.mes.service;

import com.mes.model.Material;
import com.mes.repository.MaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class MaterialService {

    @Autowired
    private MaterialRepository materialRepository;

    public List<Material> getAllMaterials() {
        return materialRepository.findAll();
    }

    public Optional<Material> getMaterialById(Long id) {
        return materialRepository.findById(id);
    }

    public Material createMaterial(Material material) {
        if (materialRepository.existsByMaterialCode(material.getMaterialCode())) {
            throw new RuntimeException("Material code already exists");
        }
        return materialRepository.save(material);
    }

    public Material updateMaterial(Long id, Material materialDetails) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found"));

        material.setMaterialName(materialDetails.getMaterialName());
        material.setDescription(materialDetails.getDescription());
        material.setUnitOfMeasure(materialDetails.getUnitOfMeasure());
        material.setUnitCost(materialDetails.getUnitCost());
        material.setCurrentStock(materialDetails.getCurrentStock());
        material.setMinimumStock(materialDetails.getMinimumStock());

        return materialRepository.save(material);
    }

    public void deleteMaterial(Long id) {
        materialRepository.deleteById(id);
    }

    public Material updateStock(Long id, BigDecimal quantity) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found"));

        material.setCurrentStock(material.getCurrentStock().add(quantity));
        return materialRepository.save(material);
    }

    public List<Material> getLowStockMaterials() {
        return materialRepository.findAll().stream()
                .filter(m -> m.getCurrentStock().compareTo(m.getMinimumStock()) < 0)
                .toList();
    }
}
