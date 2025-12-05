package com.mes.service;

import com.mes.model.*;
import com.mes.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OeeService {

    @Autowired
    private OeeCalculationRepository oeeCalculationRepository;

    @Autowired
    private OeeTargetRepository oeeTargetRepository;

    @Autowired
    private OeeTrendRepository oeeTrendRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private ProductionOrderRepository productionOrderRepository;

    @Autowired
    private DowntimeEventRepository downtimeEventRepository;

    @Autowired
    private QualityCheckRepository qualityCheckRepository;

    /**
     * Calculate real-time OEE for equipment
     */
    @Transactional
    public OeeCalculation calculateRealTimeOee(Long equipmentId, LocalDateTime start, LocalDateTime end) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        // Calculate time components
        long plannedMinutes = ChronoUnit.MINUTES.between(start, end);
        BigDecimal plannedProductionTime = BigDecimal.valueOf(plannedMinutes);

        // Get downtime events
        List<DowntimeEvent> downtimeEvents = downtimeEventRepository
                .findByEquipmentIdAndStartTimeBetween(equipmentId, start, end);
        
        BigDecimal totalDowntime = downtimeEvents.stream()
                .map(event -> {
                    LocalDateTime eventEnd = event.getEndTime() != null ? event.getEndTime() : end;
                    long minutes = ChronoUnit.MINUTES.between(event.getStartTime(), eventEnd);
                    return BigDecimal.valueOf(minutes);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal operatingTime = plannedProductionTime.subtract(totalDowntime);

        // Calculate Availability
        BigDecimal availability = plannedProductionTime.compareTo(BigDecimal.ZERO) > 0
                ? operatingTime.divide(plannedProductionTime, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        // Get production data
        List<ProductionOrder> orders = productionOrderRepository
                .findByEquipmentIdAndStatusInPeriod(equipmentId, start, end);

        int totalProduced = orders.stream()
                .mapToInt(order -> order.getProducedQuantity() != null ? order.getProducedQuantity() : 0)
                .sum();

        // Calculate ideal production quantity
        BigDecimal idealCycleTime = equipment.getIdealCycleTime() != null 
                ? equipment.getIdealCycleTime() 
                : BigDecimal.valueOf(60); // Default 60 seconds

        int idealQuantity = operatingTime.multiply(BigDecimal.valueOf(60))
                .divide(idealCycleTime, 0, RoundingMode.DOWN)
                .intValue();

        // Calculate Performance
        BigDecimal performance = idealQuantity > 0
                ? BigDecimal.valueOf(totalProduced)
                        .divide(BigDecimal.valueOf(idealQuantity), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        // Cap performance at 100% for OEE calculation (can show >100% separately)
        BigDecimal performanceForOee = performance.min(BigDecimal.valueOf(100));

        // Get quality data
        List<QualityCheck> qualityChecks = qualityCheckRepository
                .findByEquipmentIdAndCheckTimeBetween(equipmentId, start, end);

        int goodPieces = qualityChecks.stream()
                .filter(qc -> "PASSED".equals(qc.getStatus()))
                .mapToInt(qc -> qc.getSampleSize() != null ? qc.getSampleSize() : 1)
                .sum();

        int rejectedPieces = qualityChecks.stream()
                .filter(qc -> "FAILED".equals(qc.getStatus()))
                .mapToInt(qc -> qc.getSampleSize() != null ? qc.getSampleSize() : 1)
                .sum();

        // If no quality checks, assume all produced are good
        if (qualityChecks.isEmpty() && totalProduced > 0) {
            goodPieces = totalProduced;
        }

        // Calculate Quality
        BigDecimal quality = totalProduced > 0
                ? BigDecimal.valueOf(goodPieces)
                        .divide(BigDecimal.valueOf(totalProduced), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                : BigDecimal.valueOf(100);

        // Calculate OEE
        BigDecimal oee = availability
                .multiply(performanceForOee)
                .multiply(quality)
                .divide(BigDecimal.valueOf(10000), 2, RoundingMode.HALF_UP);

        // Get target OEE
        Optional<OeeTarget> target = oeeTargetRepository
                .findActiveTargetForEquipment(equipmentId, LocalDate.now());
        
        BigDecimal targetOee = target.map(OeeTarget::getTargetOee).orElse(null);
        BigDecimal variance = targetOee != null ? oee.subtract(targetOee) : null;

        // Create OEE calculation record
        OeeCalculation calculation = new OeeCalculation();
        calculation.setEquipment(equipment);
        calculation.setCalculationPeriodStart(start);
        calculation.setCalculationPeriodEnd(end);
        calculation.setPlannedProductionTime(plannedProductionTime);
        calculation.setDowntime(totalDowntime);
        calculation.setOperatingTime(operatingTime);
        calculation.setAvailabilityPercentage(availability.setScale(2, RoundingMode.HALF_UP));
        calculation.setIdealCycleTime(idealCycleTime);
        calculation.setTotalPiecesProduced(totalProduced);
        calculation.setIdealProductionQuantity(idealQuantity);
        calculation.setPerformancePercentage(performance.setScale(2, RoundingMode.HALF_UP));
        calculation.setGoodPieces(goodPieces);
        calculation.setRejectedPieces(rejectedPieces);
        calculation.setQualityPercentage(quality.setScale(2, RoundingMode.HALF_UP));
        calculation.setOeePercentage(oee);
        calculation.setTargetOeePercentage(targetOee);
        calculation.setVarianceFromTarget(variance);
        calculation.setCalculationType("REAL_TIME");

        return oeeCalculationRepository.save(calculation);
    }

    /**
     * Get OEE breakdown for equipment
     */
    public Map<String, Object> getOeeBreakdown(Long equipmentId, LocalDateTime start, LocalDateTime end) {
        List<OeeCalculation> calculations = oeeCalculationRepository
                .findByEquipmentAndPeriod(equipmentId, start, end);

        if (calculations.isEmpty()) {
            // Calculate if no data exists
            OeeCalculation calc = calculateRealTimeOee(equipmentId, start, end);
            calculations = List.of(calc);
        }

        // Calculate averages
        BigDecimal avgOee = calculations.stream()
                .map(OeeCalculation::getOeePercentage)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(calculations.size()), 2, RoundingMode.HALF_UP);

        BigDecimal avgAvailability = calculations.stream()
                .map(OeeCalculation::getAvailabilityPercentage)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(calculations.size()), 2, RoundingMode.HALF_UP);

        BigDecimal avgPerformance = calculations.stream()
                .map(OeeCalculation::getPerformancePercentage)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(calculations.size()), 2, RoundingMode.HALF_UP);

        BigDecimal avgQuality = calculations.stream()
                .map(OeeCalculation::getQualityPercentage)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(calculations.size()), 2, RoundingMode.HALF_UP);

        Map<String, Object> breakdown = new HashMap<>();
        breakdown.put("oee", avgOee);
        breakdown.put("availability", avgAvailability);
        breakdown.put("performance", avgPerformance);
        breakdown.put("quality", avgQuality);
        breakdown.put("calculations", calculations);
        breakdown.put("period", Map.of("start", start, "end", end));

        return breakdown;
    }

    /**
     * Get OEE trends
     */
    public List<OeeTrend> getOeeTrends(Long equipmentId, String period, LocalDateTime start, LocalDateTime end) {
        return oeeTrendRepository.findTrendData(equipmentId, start, end);
    }

    /**
     * Calculate and save OEE trend
     */
    @Transactional
    public OeeTrend calculateOeeTrend(Long equipmentId, String trendPeriod, 
                                     LocalDateTime periodStart, LocalDateTime periodEnd) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        List<OeeCalculation> calculations = oeeCalculationRepository
                .findByEquipmentAndPeriod(equipmentId, periodStart, periodEnd);

        if (calculations.isEmpty()) {
            return null;
        }

        // Calculate aggregated metrics
        BigDecimal avgOee = calculations.stream()
                .map(OeeCalculation::getOeePercentage)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(calculations.size()), 2, RoundingMode.HALF_UP);

        BigDecimal avgAvailability = calculations.stream()
                .map(OeeCalculation::getAvailabilityPercentage)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(calculations.size()), 2, RoundingMode.HALF_UP);

        BigDecimal avgPerformance = calculations.stream()
                .map(OeeCalculation::getPerformancePercentage)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(calculations.size()), 2, RoundingMode.HALF_UP);

        BigDecimal avgQuality = calculations.stream()
                .map(OeeCalculation::getQualityPercentage)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(calculations.size()), 2, RoundingMode.HALF_UP);

        BigDecimal minOee = calculations.stream()
                .map(OeeCalculation::getOeePercentage)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        BigDecimal maxOee = calculations.stream()
                .map(OeeCalculation::getOeePercentage)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        // Determine trend direction
        String trendDirection = determineTrendDirection(calculations);
        BigDecimal trendPercentage = calculateTrendPercentage(calculations);

        OeeTrend trend = new OeeTrend();
        trend.setEquipment(equipment);
        trend.setTrendPeriod(trendPeriod);
        trend.setPeriodStart(periodStart);
        trend.setPeriodEnd(periodEnd);
        trend.setAvgOee(avgOee);
        trend.setAvgAvailability(avgAvailability);
        trend.setAvgPerformance(avgPerformance);
        trend.setAvgQuality(avgQuality);
        trend.setMinOee(minOee);
        trend.setMaxOee(maxOee);
        trend.setTrendDirection(trendDirection);
        trend.setTrendPercentage(trendPercentage);

        return oeeTrendRepository.save(trend);
    }

    private String determineTrendDirection(List<OeeCalculation> calculations) {
        if (calculations.size() < 2) {
            return "STABLE";
        }

        // Compare first half vs second half
        int midPoint = calculations.size() / 2;
        List<OeeCalculation> firstHalf = calculations.subList(0, midPoint);
        List<OeeCalculation> secondHalf = calculations.subList(midPoint, calculations.size());

        BigDecimal firstAvg = firstHalf.stream()
                .map(OeeCalculation::getOeePercentage)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(firstHalf.size()), 2, RoundingMode.HALF_UP);

        BigDecimal secondAvg = secondHalf.stream()
                .map(OeeCalculation::getOeePercentage)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(secondHalf.size()), 2, RoundingMode.HALF_UP);

        BigDecimal difference = secondAvg.subtract(firstAvg);

        if (difference.abs().compareTo(BigDecimal.valueOf(2)) < 0) {
            return "STABLE";
        } else if (difference.compareTo(BigDecimal.ZERO) > 0) {
            return "IMPROVING";
        } else {
            return "DECLINING";
        }
    }

    private BigDecimal calculateTrendPercentage(List<OeeCalculation> calculations) {
        if (calculations.size() < 2) {
            return BigDecimal.ZERO;
        }

        int midPoint = calculations.size() / 2;
        List<OeeCalculation> firstHalf = calculations.subList(0, midPoint);
        List<OeeCalculation> secondHalf = calculations.subList(midPoint, calculations.size());

        BigDecimal firstAvg = firstHalf.stream()
                .map(OeeCalculation::getOeePercentage)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(firstHalf.size()), 2, RoundingMode.HALF_UP);

        BigDecimal secondAvg = secondHalf.stream()
                .map(OeeCalculation::getOeePercentage)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(secondHalf.size()), 2, RoundingMode.HALF_UP);

        if (firstAvg.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return secondAvg.subtract(firstAvg)
                .divide(firstAvg, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Get benchmark comparison
     */
    public Map<String, Object> getBenchmarkComparison(Long equipmentId) {
        OeeCalculation latest = oeeCalculationRepository.findLatestByEquipment(equipmentId);
        Optional<OeeTarget> target = oeeTargetRepository
                .findActiveTargetForEquipment(equipmentId, LocalDate.now());

        Map<String, Object> comparison = new HashMap<>();
        
        if (latest != null) {
            comparison.put("current", latest.getOeePercentage());
            comparison.put("availability", latest.getAvailabilityPercentage());
            comparison.put("performance", latest.getPerformancePercentage());
            comparison.put("quality", latest.getQualityPercentage());
        }

        if (target.isPresent()) {
            OeeTarget t = target.get();
            comparison.put("target", t.getTargetOee());
            comparison.put("worldClass", t.getWorldClassOee());
            comparison.put("industryBenchmark", t.getIndustryBenchmarkOee());
            comparison.put("companyAverage", t.getCompanyAverageOee());
        }

        return comparison;
    }

    /**
     * Get target vs actual tracking
     */
    public Map<String, Object> getTargetVsActual(Long equipmentId, LocalDateTime start, LocalDateTime end) {
        List<OeeCalculation> calculations = oeeCalculationRepository
                .findByEquipmentAndPeriod(equipmentId, start, end);

        Optional<OeeTarget> target = oeeTargetRepository
                .findActiveTargetForEquipment(equipmentId, LocalDate.now());

        List<Map<String, Object>> dataPoints = calculations.stream()
                .map(calc -> {
                    Map<String, Object> point = new HashMap<>();
                    point.put("timestamp", calc.getCalculationPeriodEnd());
                    point.put("actual", calc.getOeePercentage());
                    point.put("target", calc.getTargetOeePercentage());
                    point.put("variance", calc.getVarianceFromTarget());
                    return point;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("dataPoints", dataPoints);
        result.put("target", target.map(OeeTarget::getTargetOee).orElse(null));
        result.put("period", Map.of("start", start, "end", end));

        return result;
    }

    // Scheduled job to calculate daily OEE trends (runs at midnight)
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void calculateDailyTrends() {
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1).withHour(0).withMinute(0);
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0);

        List<Equipment> allEquipment = equipmentRepository.findAll();
        
        for (Equipment equipment : allEquipment) {
            try {
                calculateOeeTrend(equipment.getId(), "DAILY", yesterday, today);
            } catch (Exception e) {
                System.err.println("Failed to calculate daily trend for equipment " + 
                                 equipment.getId() + ": " + e.getMessage());
            }
        }
    }
}
