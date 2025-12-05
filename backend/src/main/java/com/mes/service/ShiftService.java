package com.mes.service;

import com.mes.dto.*;
import com.mes.model.*;
import com.mes.repository.*;
import com.mes.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ShiftService {

    @Autowired
    private ShiftRepository shiftRepository;

    @Autowired
    private ShiftAssignmentRepository shiftAssignmentRepository;

    @Autowired
    private ShiftHandoverRepository shiftHandoverRepository;

    @Autowired
    private ShiftProductionLogRepository shiftProductionLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    // Shift CRUD
    public List<ShiftDto> getAllShifts() {
        return shiftRepository.findAll().stream()
                .map(this::convertToShiftDto)
                .collect(Collectors.toList());
    }

    public List<ShiftDto> getActiveShifts() {
        return shiftRepository.findByActiveTrue().stream()
                .map(this::convertToShiftDto)
                .collect(Collectors.toList());
    }

    public ShiftDto getShiftById(Long id) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shift not found"));
        return convertToShiftDto(shift);
    }

    // Shift Assignments
    @Transactional
    public ShiftAssignmentDto createAssignment(CreateShiftAssignmentRequest request) {
        Shift shift = shiftRepository.findById(request.getShiftId())
                .orElseThrow(() -> new RuntimeException("Shift not found"));
        
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        ShiftAssignment assignment = new ShiftAssignment();
        assignment.setShift(shift);
        assignment.setUser(user);
        assignment.setAssignmentDate(request.getAssignmentDate());
        assignment.setNotes(request.getNotes());

        if (request.getEquipmentId() != null) {
            Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                    .orElseThrow(() -> new RuntimeException("Equipment not found"));
            assignment.setEquipment(equipment);
        }

        ShiftAssignment saved = shiftAssignmentRepository.save(assignment);
        return convertToAssignmentDto(saved);
    }

    public List<ShiftAssignmentDto> getAssignmentsByDate(LocalDate date) {
        return shiftAssignmentRepository.findByAssignmentDate(date).stream()
                .map(this::convertToAssignmentDto)
                .collect(Collectors.toList());
    }

    public List<ShiftAssignmentDto> getAssignmentsByShiftAndDate(Long shiftId, LocalDate date) {
        return shiftAssignmentRepository.findByShiftIdAndAssignmentDate(shiftId, date).stream()
                .map(this::convertToAssignmentDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteAssignment(Long id) {
        shiftAssignmentRepository.deleteById(id);
    }

    // Shift Handovers
    @Transactional
    public ShiftHandoverDto createHandover(CreateShiftHandoverRequest request) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        
        Shift fromShift = shiftRepository.findById(request.getFromShiftId())
                .orElseThrow(() -> new RuntimeException("From shift not found"));
        
        Shift toShift = shiftRepository.findById(request.getToShiftId())
                .orElseThrow(() -> new RuntimeException("To shift not found"));
        
        User fromUser = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        ShiftHandover handover = new ShiftHandover();
        handover.setFromShift(fromShift);
        handover.setToShift(toShift);
        handover.setFromUser(fromUser);
        handover.setHandoverDate(request.getHandoverDate());
        handover.setHandoverTime(LocalDateTime.now());
        handover.setProductionSummary(request.getProductionSummary());
        handover.setQualityIssues(request.getQualityIssues());
        handover.setEquipmentStatus(request.getEquipmentStatus());
        handover.setPendingTasks(request.getPendingTasks());
        handover.setNotes(request.getNotes());

        ShiftHandover saved = shiftHandoverRepository.save(handover);
        return convertToHandoverDto(saved);
    }

    public List<ShiftHandoverDto> getHandoversByDate(LocalDate date) {
        return shiftHandoverRepository.findByHandoverDate(date).stream()
                .map(this::convertToHandoverDto)
                .collect(Collectors.toList());
    }

    public List<ShiftHandoverDto> getPendingHandovers() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        
        return shiftHandoverRepository.findByToUserIdAndAcknowledgedFalse(userDetails.getId()).stream()
                .map(this::convertToHandoverDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ShiftHandoverDto acknowledgeHandover(Long id) {
        ShiftHandover handover = shiftHandoverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Handover not found"));
        
        handover.setAcknowledged(true);
        handover.setAcknowledgedAt(LocalDateTime.now());
        
        ShiftHandover saved = shiftHandoverRepository.save(handover);
        return convertToHandoverDto(saved);
    }

    // Production Reports
    public List<ShiftProductionReport> getProductionReportByDateRange(LocalDate startDate, LocalDate endDate) {
        List<ShiftProductionLog> logs = shiftProductionLogRepository.findByShiftDateBetween(startDate, endDate);
        List<ShiftAssignment> assignments = shiftAssignmentRepository.findByAssignmentDateBetween(startDate, endDate);

        Map<String, List<ShiftProductionLog>> groupedByShiftAndDate = logs.stream()
                .collect(Collectors.groupingBy(log -> 
                    log.getShiftDate() + "_" + log.getShift().getId()
                ));

        Map<String, Long> operatorCounts = assignments.stream()
                .collect(Collectors.groupingBy(
                    a -> a.getAssignmentDate() + "_" + a.getShift().getId(),
                    Collectors.counting()
                ));

        return groupedByShiftAndDate.entrySet().stream().map(entry -> {
            List<ShiftProductionLog> shiftLogs = entry.getValue();
            ShiftProductionLog firstLog = shiftLogs.get(0);

            int totalProduced = shiftLogs.stream().mapToInt(ShiftProductionLog::getQuantityProduced).sum();
            int totalPassed = shiftLogs.stream().mapToInt(ShiftProductionLog::getQualityPassed).sum();
            int totalRejected = shiftLogs.stream().mapToInt(ShiftProductionLog::getQualityRejected).sum();
            int totalDowntime = shiftLogs.stream().mapToInt(ShiftProductionLog::getDowntimeMinutes).sum();
            
            double passRate = (totalPassed + totalRejected) > 0 
                ? (totalPassed * 100.0) / (totalPassed + totalRejected) 
                : 0;

            int operatorCount = operatorCounts.getOrDefault(entry.getKey(), 0L).intValue();

            return new ShiftProductionReport(
                firstLog.getShiftDate(),
                firstLog.getShift().getId(),
                firstLog.getShift().getName(),
                firstLog.getShift().getShiftType().name(),
                totalProduced,
                totalPassed,
                totalRejected,
                totalDowntime,
                Math.round(passRate * 100.0) / 100.0,
                operatorCount
            );
        }).collect(Collectors.toList());
    }

    // Conversion methods
    private ShiftDto convertToShiftDto(Shift shift) {
        ShiftDto dto = new ShiftDto();
        dto.setId(shift.getId());
        dto.setName(shift.getName());
        dto.setShiftType(shift.getShiftType().name());
        dto.setStartTime(shift.getStartTime());
        dto.setEndTime(shift.getEndTime());
        dto.setDescription(shift.getDescription());
        dto.setActive(shift.getActive());
        return dto;
    }

    private ShiftAssignmentDto convertToAssignmentDto(ShiftAssignment assignment) {
        ShiftAssignmentDto dto = new ShiftAssignmentDto();
        dto.setId(assignment.getId());
        dto.setShiftId(assignment.getShift().getId());
        dto.setShiftName(assignment.getShift().getName());
        dto.setUserId(assignment.getUser().getId());
        dto.setUserName(assignment.getUser().getUsername());
        dto.setUserFullName(assignment.getUser().getFullName());
        dto.setAssignmentDate(assignment.getAssignmentDate());
        dto.setNotes(assignment.getNotes());
        
        if (assignment.getEquipment() != null) {
            dto.setEquipmentId(assignment.getEquipment().getId());
            dto.setEquipmentName(assignment.getEquipment().getName());
        }
        
        return dto;
    }

    private ShiftHandoverDto convertToHandoverDto(ShiftHandover handover) {
        ShiftHandoverDto dto = new ShiftHandoverDto();
        dto.setId(handover.getId());
        dto.setFromShiftId(handover.getFromShift().getId());
        dto.setFromShiftName(handover.getFromShift().getName());
        dto.setToShiftId(handover.getToShift().getId());
        dto.setToShiftName(handover.getToShift().getName());
        dto.setFromUserId(handover.getFromUser().getId());
        dto.setFromUserName(handover.getFromUser().getUsername());
        
        if (handover.getToUser() != null) {
            dto.setToUserId(handover.getToUser().getId());
            dto.setToUserName(handover.getToUser().getUsername());
        }
        
        dto.setHandoverDate(handover.getHandoverDate());
        dto.setHandoverTime(handover.getHandoverTime());
        dto.setProductionSummary(handover.getProductionSummary());
        dto.setQualityIssues(handover.getQualityIssues());
        dto.setEquipmentStatus(handover.getEquipmentStatus());
        dto.setPendingTasks(handover.getPendingTasks());
        dto.setNotes(handover.getNotes());
        dto.setAcknowledged(handover.getAcknowledged());
        dto.setAcknowledgedAt(handover.getAcknowledgedAt());
        
        return dto;
    }
}
