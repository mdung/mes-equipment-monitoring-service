package com.mes.service;

import com.mes.model.ProductionOrder;
import com.mes.model.ProductionOrderStatus;
import com.mes.repository.ProductionOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProductionOrderService {

    @Autowired
    private ProductionOrderRepository productionOrderRepository;

    public List<ProductionOrder> getAllOrders() {
        return productionOrderRepository.findAll();
    }

    public Optional<ProductionOrder> getOrderById(Long id) {
        return productionOrderRepository.findById(id);
    }

    public ProductionOrder createOrder(ProductionOrder order) {
        return productionOrderRepository.save(order);
    }

    public ProductionOrder updateOrder(Long id, ProductionOrder orderDetails) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setProductName(orderDetails.getProductName());
        order.setTargetQuantity(orderDetails.getTargetQuantity());
        order.setStatus(orderDetails.getStatus());
        order.setEquipment(orderDetails.getEquipment());

        if (orderDetails.getStatus() == ProductionOrderStatus.IN_PROGRESS && order.getStartTime() == null) {
            order.setStartTime(java.time.LocalDateTime.now());
        }
        if (orderDetails.getStatus() == ProductionOrderStatus.COMPLETED && order.getEndTime() == null) {
            order.setEndTime(java.time.LocalDateTime.now());
        }

        return productionOrderRepository.save(order);
    }

    public ProductionOrder startOrder(Long id) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(ProductionOrderStatus.IN_PROGRESS);
        order.setStartTime(java.time.LocalDateTime.now());
        return productionOrderRepository.save(order);
    }

    public ProductionOrder completeOrder(Long id) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(ProductionOrderStatus.COMPLETED);
        order.setEndTime(java.time.LocalDateTime.now());
        return productionOrderRepository.save(order);
    }

    public ProductionOrder cancelOrder(Long id) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(ProductionOrderStatus.CANCELLED);
        return productionOrderRepository.save(order);
    }

    public ProductionOrder updateProducedQuantity(Long id, Integer quantity) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setProducedQuantity(quantity);
        return productionOrderRepository.save(order);
    }
}
