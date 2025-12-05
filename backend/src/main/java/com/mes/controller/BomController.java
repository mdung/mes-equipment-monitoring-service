package com.mes.controller;

import com.mes.model.BomItem;
import com.mes.service.BomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bom")
@CrossOrigin(origins = "*")
public class BomController {

    @Autowired
    private BomService bomService;

    @GetMapping("/product/{productId}")
    public List<BomItem> getBomByProduct(@PathVariable Long productId) {
        return bomService.getBomByProductId(productId);
    }

    @PostMapping
    public BomItem addBomItem(@RequestBody BomItem bomItem) {
        return bomService.addBomItem(bomItem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BomItem> updateBomItem(@PathVariable Long id, @RequestBody BomItem bomItem) {
        try {
            return ResponseEntity.ok(bomService.updateBomItem(id, bomItem));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBomItem(@PathVariable Long id) {
        bomService.deleteBomItem(id);
        return ResponseEntity.ok().build();
    }
}
