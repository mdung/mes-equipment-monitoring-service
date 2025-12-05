package com.mes.service;

import com.mes.dto.*;
import com.mes.model.*;
import com.mes.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private EquipmentLogRepository equipmentLogRepository;

    @Autowired
    private ProductionOrderRepository productionOrderRepository;

    @Autowired
    private DowntimeEventRepository downtimeEventRepository;

    @Autowired
    private QualityCheckRepository qualityCheckRepository;

    public List<HistoricalDataPoint> getHistoricalData(Long equipmentId, LocalDateTime startDate, LocalDateTime endDate) {
        List<EquipmentLog> logs = equipmentLogRepository.findByEquipmentIdOrderByTimestampDesc(equipmentId);
        
        return logs.stream()
                .filter(log -> log.getTimestamp().isAfter(startDate) && log.getTimestamp().isBefore(endDate))
                .flatMap(log -> {
                    List<HistoricalDataPoint> points = new ArrayList<>();
                    if (log.getTemperature() != null) {
                        points.add(new HistoricalDataPoint(log.getTimestamp(), "temperature", log.getTemperature(), "°C"));
                    }
                    if (log.getVibration() != null) {
                        points.add(new HistoricalDataPoint(log.getTimestamp(), "vibration", log.getVibration(), "mm/s"));
                    }
                    if (log.getOutputCount() != null) {
                        points.add(new HistoricalDataPoint(log.getTimestamp(), "output", log.getOutputCount().doubleValue(), "units"));
                    }
                    return points.stream();
                })
                .collect(Collectors.toList());
    }

    public List<ProductionEfficiencyReport> getProductionEfficiencyReport(LocalDateTime startDate, LocalDateTime endDate) {
        List<ProductionOrder> orders = productionOrderRepository.findAll().stream()
                .filter(order -> order.getCreatedAt().isAfter(startDate) && order.getCreatedAt().isBefore(endDate))
                .collect(Collectors.toList());

        return orders.stream().map(order -> {
            ProductionEfficiencyReport report = new ProductionEfficiencyReport();
            report.setOrderId(order.getId());
            report.setOrderNumber(order.getOrderNumber());
            report.setProductName(order.getProductName());
            report.setTargetQuantity(order.getTargetQuantity());
            report.setProducedQuantity(order.getProducedQuantity() != null ? order.getProducedQuantity() : 0);
            
            double completionRate = order.getTargetQuantity() > 0 
                ? (report.getProducedQuantity().doubleValue() / order.getTargetQuantity()) * 100 
                : 0;
            report.setCompletionRate(Math.round(completionRate * 100.0) / 100.0);
            
            if (order.getStartTime() != null && order.getEndTime() != null) {
                long minutes = ChronoUnit.MINUTES.between(order.getStartTime(), order.getEndTime());
                report.setDurationMinutes(minutes);
                
                if (minutes > 0) {
                    double unitsPerHour = (report.getProducedQuantity().doubleValue() / minutes) * 60;
                    report.setUnitsPerHour(Math.round(unitsPerHour * 100.0) / 100.0);
                } else {
                    report.setUnitsPerHour(0.0);
                }
            } else {
                report.setDurationMinutes(0L);
                report.setUnitsPerHour(0.0);
            }
            
            report.setStatus(order.getStatus().name());
            return report;
        }).collect(Collectors.toList());
    }

    public List<EquipmentUtilizationReport> getEquipmentUtilizationReport(LocalDateTime startDate, LocalDateTime endDate) {
        List<Equipment> equipmentList = equipmentRepository.findAll();
        long totalMinutes = ChronoUnit.MINUTES.between(startDate, endDate);

        return equipmentList.stream().map(equipment -> {
            EquipmentUtilizationReport report = new EquipmentUtilizationReport();
            report.setEquipmentId(equipment.getId());
            report.setEquipmentName(equipment.getName());
            report.setEquipmentCode(equipment.getCode());
            report.setTotalMinutes(totalMinutes);

            // Get equipment logs in date range
            List<EquipmentLog> logs = equipmentLogRepository.findByEquipmentIdOrderByTimestampDesc(equipment.getId())
                    .stream()
                    .filter(log -> log.getTimestamp().isAfter(startDate) && log.getTimestamp().isBefore(endDate))
                    .collect(Collectors.toList());

            // Calculate status durations (simplified - in production, use more accurate tracking)
            long runningMinutes = logs.stream()
                    .filter(log -> "RUNNING".equals(log.getStatus()))
                    .count() * 5; // Assuming 5-minute intervals
            
            long idleMinutes = totalMinutes - runningMinutes;
            long downMinutes = 0L;
            long maintenanceMinutes = 0L;

            report.setRunningMinutes(runningMinutes);
            report.setIdleMinutes(idleMinutes);
            report.setDownMinutes(downMinutes);
            report.setMaintenanceMinutes(maintenanceMinutes);

            double utilizationRate = totalMinutes > 0 ? (runningMinutes.doubleValue() / totalMinutes) * 100 : 0;
            double availabilityRate = totalMinutes > 0 ? ((totalMinutes - downMinutes).doubleValue() / totalMinutes) * 100 : 0;

            report.setUtilizationRate(Math.round(utilizationRate * 100.0) / 100.0);
            report.setAvailabilityRate(Math.round(availabilityRate * 100.0) / 100.0);

            return report;
        }).collect(Collectors.toList());
    }

    public List<DowntimeAnalysisReport> getDowntimeAnalysisReport(LocalDateTime startDate, LocalDateTime endDate) {
        List<DowntimeEvent> events = downtimeEventRepository.findAll().stream()
                .filter(event -> event.getStartTime().isAfter(startDate) && event.getStartTime().isBefore(endDate))
                .collect(Collectors.toList());

        Map<String, List<DowntimeEvent>> groupedByReason = events.stream()
                .collect(Collectors.groupingBy(
                    event -> event.getReasonCode() != null ? event.getReasonCode() : "UNKNOWN"
                ));

        long totalDowntimeMinutes = events.stream()
                .mapToLong(event -> {
                    if (event.getEndTime() != null) {
                        return ChronoUnit.MINUTES.between(event.getStartTime(), event.getEndTime());
                    }
                    return 0;
                })
                .sum();

        return groupedByReason.entrySet().stream().map(entry -> {
            String reasonCode = entry.getKey();
            List<DowntimeEvent> reasonEvents = entry.getValue();

            long occurrences = reasonEvents.size();
            long totalMinutes = reasonEvents.stream()
                    .mapToLong(event -> {
                        if (event.getEndTime() != null) {
                            return ChronoUnit.MINUTES.between(event.getStartTime(), event.getEndTime());
                        }
                        return 0;
                    })
                    .sum();

            double averageMinutes = occurrences > 0 ? totalMinutes.doubleValue() / occurrences : 0;
            double percentage = totalDowntimeMinutes > 0 ? (totalMinutes.doubleValue() / totalDowntimeMinutes) * 100 : 0;

            return new DowntimeAnalysisReport(
                reasonCode,
                occurrences,
                totalMinutes,
                Math.round(averageMinutes * 100.0) / 100.0,
                Math.round(percentage * 100.0) / 100.0
            );
        })
        .sorted(Comparator.comparing(DowntimeAnalysisReport::getTotalMinutes).reversed())
        .collect(Collectors.toList());
    }

    public List<QualityTrendReport> getQualityTrendReport(LocalDateTime startDate, LocalDateTime endDate) {
        List<QualityCheck> checks = qualityCheckRepository.findAll().stream()
                .filter(check -> check.getCheckTime().isAfter(startDate) && check.getCheckTime().isBefore(endDate))
                .collect(Collectors.toList());

        Map<LocalDate, List<QualityCheck>> groupedByDate = checks.stream()
                .collect(Collectors.groupingBy(check -> check.getCheckTime().toLocalDate()));

        return groupedByDate.entrySet().stream().map(entry -> {
            LocalDate date = entry.getKey();
            List<QualityCheck> dayChecks = entry.getValue();

            int totalChecks = dayChecks.size();
            int totalPassed = dayChecks.stream().mapToInt(QualityCheck::getPassedCount).sum();
            int totalRejected = dayChecks.stream().mapToInt(QualityCheck::getRejectedCount).sum();
            int totalUnits = totalPassed + totalRejected;

            double passRate = totalUnits > 0 ? (totalPassed.doubleValue() / totalUnits) * 100 : 0;
            double rejectRate = totalUnits > 0 ? (totalRejected.doubleValue() / totalUnits) * 100 : 0;

            return new QualityTrendReport(
                date,
                totalChecks,
                totalPassed,
                totalRejected,
                Math.round(passRate * 100.0) / 100.0,
                Math.round(rejectRate * 100.0) / 100.0
            );
        })
        .sorted(Comparator.comparing(QualityTrendReport::getDate))
        .collect(Collectors.toList());
    }
}
