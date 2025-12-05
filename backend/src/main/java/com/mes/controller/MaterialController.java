package com.mes.controller;

import com.mes.model.Material;
import com.mes.service.MaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/materials")
@CrossOrigin(origins = "*")
public class MaterialController {

    @Autowired
    private MaterialService materialService;

    @GetMapping
    public List<Material> getAllMaterials() {
        return materialService.getAllMaterials();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Material> getMaterialById(@PathVariable Long id) {
        return materialService.getMaterialById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Material createMaterial(@RequestBody Material material) {
        return materialService.createMaterial(material);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Material> updateMaterial(@PathVariable Long id, @RequestBody Material material) {
        try {
            return ResponseEntity.ok(materialService.updateMaterial(id, material));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/adjust-stock")
    public ResponseEntity<Material> adjustStock(@PathVariable Long id, @RequestBody Map<String, BigDecimal> request) {
        BigDecimal quantity = request.get("quantity");
        return ResponseEntity.ok(materialService.updateStock(id, quantity));
    }

    @GetMapping("/low-stock")
    public List<Material> getLowStockMaterials() {
        return materialService.getLowStockMaterials();
    }
}
