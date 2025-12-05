package com.mes.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SparePartDto {
    private Long id;
    private String partNumber;
    private String partName;
    private String description;
    private String category;
    private BigDecimal unitPrice;
    private Integer quantityInStock;
    private Integer minimumStockLevel;
    private String location;
    private String supplier;
    private Boolean isLowStock;
}
