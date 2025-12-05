package com.mes.controller;

import com.mes.model.ProductionOrder;
import com.mes.service.ProductionOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class ProductionOrderController {

    @Autowired
    private ProductionOrderService productionOrderService;

    @GetMapping
    public List<ProductionOrder> getAllOrders() {
        return productionOrderService.getAllOrders();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductionOrder> getOrderById(@PathVariable Long id) {
        return productionOrderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ProductionOrder createOrder(@RequestBody ProductionOrder order) {
        return productionOrderService.createOrder(order);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductionOrder> updateOrder(@PathVariable Long id, @RequestBody ProductionOrder order) {
        try {
            return ResponseEntity.ok(productionOrderService.updateOrder(id, order));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<ProductionOrder> startOrder(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(productionOrderService.startOrder(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ProductionOrder> completeOrder(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(productionOrderService.completeOrder(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ProductionOrder> cancelOrder(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(productionOrderService.cancelOrder(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/update-quantity")
    public ResponseEntity<ProductionOrder> updateProducedQuantity(@PathVariable Long id, @RequestParam Integer quantity) {
        try {
            return ResponseEntity.ok(productionOrderService.updateProducedQuantity(id, quantity));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
