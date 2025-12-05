package com.mes.service;

import com.mes.dto.*;
import com.mes.model.*;
import com.mes.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaintenanceService {

    @Autowired
    private MaintenanceScheduleRepository scheduleRepository;

    @Autowired
    private MaintenanceTaskRepository taskRepository;

    @Autowired
    private SparePartRepository sparePartRepository;

    @Autowired
    private MaintenanceCostRepository costRepository;

    @Autowired
    private MaintenanceTaskPartRepository taskPartRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private UserRepository userRepository;

    // Maintenance Schedules
    public List<MaintenanceScheduleDto> getAllSchedules() {
        return scheduleRepository.findAll().stream()
                .map(this::convertScheduleToDto)
                .collect(Collectors.toList());
    }

    public MaintenanceScheduleDto getScheduleById(Long id) {
        MaintenanceSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        return convertScheduleToDto(schedule);
    }

    public List<MaintenanceScheduleDto> getSchedulesByEquipment(Long equipmentId) {
        return scheduleRepository.findByEquipmentId(equipmentId).stream()
                .map(this::convertScheduleToDto)
                .collect(Collectors.toList());
    }

    public List<MaintenanceScheduleDto> getUpcomingSchedules() {
        LocalDateTime nextWeek = LocalDateTime.now().plusDays(7);
        return scheduleRepository.findByNextMaintenanceDateBefore(nextWeek).stream()
                .map(this::convertScheduleToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MaintenanceScheduleDto createSchedule(MaintenanceSchedule schedule) {
        Equipment equipment = equipmentRepository.findById(schedule.getEquipment().getId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
        schedule.setEquipment(equipment);
        MaintenanceSchedule saved = scheduleRepository.save(schedule);
        return convertScheduleToDto(saved);
    }

    @Transactional
    public MaintenanceScheduleDto updateSchedule(Long id, MaintenanceSchedule scheduleDetails) {
        MaintenanceSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        schedule.setScheduleName(scheduleDetails.getScheduleName());
        schedule.setDescription(scheduleDetails.getDescription());
        schedule.setFrequency(scheduleDetails.getFrequency());
        schedule.setFrequencyValue(scheduleDetails.getFrequencyValue());
        schedule.setNextMaintenanceDate(scheduleDetails.getNextMaintenanceDate());
        schedule.setEstimatedDurationMinutes(scheduleDetails.getEstimatedDurationMinutes());
        schedule.setPriority(scheduleDetails.getPriority());
        schedule.setIsActive(scheduleDetails.getIsActive());

        MaintenanceSchedule updated = scheduleRepository.save(schedule);
        return convertScheduleToDto(updated);
    }

    @Transactional
    public void deleteSchedule(Long id) {
        scheduleRepository.deleteById(id);
    }

    // Maintenance Tasks
    public List<MaintenanceTaskDto> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::convertTaskToDto)
                .collect(Collectors.toList());
    }

    public MaintenanceTaskDto getTaskById(Long id) {
        MaintenanceTask task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        return convertTaskToDto(task);
    }

    public List<MaintenanceTaskDto> getTasksByEquipment(Long equipmentId) {
        return taskRepository.findByEquipmentId(equipmentId).stream()
                .map(this::convertTaskToDto)
                .collect(Collectors.toList());
    }

    public List<MaintenanceTaskDto> getTasksByUser(Long userId) {
        return taskRepository.findByAssignedToId(userId).stream()
                .map(this::convertTaskToDto)
                .collect(Collectors.toList());
    }

    public List<MaintenanceTaskDto> getTasksByStatus(String status) {
        return taskRepository.findByStatus(status).stream()
                .map(this::convertTaskToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MaintenanceTaskDto createTask(MaintenanceTask task) {
        Equipment equipment = equipmentRepository.findById(task.getEquipment().getId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
        task.setEquipment(equipment);

        if (task.getAssignedTo() != null && task.getAssignedTo().getId() != null) {
            User user = userRepository.findById(task.getAssignedTo().getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            task.setAssignedTo(user);
        }

        MaintenanceTask saved = taskRepository.save(task);
        return convertTaskToDto(saved);
    }

    @Transactional
    public MaintenanceTaskDto updateTask(Long id, MaintenanceTask taskDetails) {
        MaintenanceTask task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setTaskTitle(taskDetails.getTaskTitle());
        task.setDescription(taskDetails.getDescription());
        task.setStatus(taskDetails.getStatus());
        task.setPriority(taskDetails.getPriority());
        task.setScheduledDate(taskDetails.getScheduledDate());
        task.setNotes(taskDetails.getNotes());

        if (taskDetails.getAssignedTo() != null) {
            User user = userRepository.findById(taskDetails.getAssignedTo().getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            task.setAssignedTo(user);
        }

        MaintenanceTask updated = taskRepository.save(task);
        return convertTaskToDto(updated);
    }

    @Transactional
    public MaintenanceTaskDto startTask(Long id) {
        MaintenanceTask task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus("IN_PROGRESS");
        task.setStartedAt(LocalDateTime.now());
        MaintenanceTask updated = taskRepository.save(task);
        return convertTaskToDto(updated);
    }

    @Transactional
    public MaintenanceTaskDto completeTask(Long id, Integer actualDuration, String notes) {
        MaintenanceTask task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus("COMPLETED");
        task.setCompletedAt(LocalDateTime.now());
        task.setActualDurationMinutes(actualDuration);
        if (notes != null) {
            task.setNotes(notes);
        }
        MaintenanceTask updated = taskRepository.save(task);
        return convertTaskToDto(updated);
    }

    // Spare Parts
    public List<SparePartDto> getAllSpareParts() {
        return sparePartRepository.findAll().stream()
                .map(this::convertSparePartToDto)
                .collect(Collectors.toList());
    }

    public List<SparePartDto> getLowStockParts() {
        return sparePartRepository.findLowStockParts().stream()
                .map(this::convertSparePartToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public SparePartDto createSparePart(SparePart part) {
        SparePart saved = sparePartRepository.save(part);
        return convertSparePartToDto(saved);
    }

    @Transactional
    public SparePartDto updateSparePart(Long id, SparePart partDetails) {
        SparePart part = sparePartRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Spare part not found"));

        part.setPartName(partDetails.getPartName());
        part.setDescription(partDetails.getDescription());
        part.setCategory(partDetails.getCategory());
        part.setUnitPrice(partDetails.getUnitPrice());
        part.setQuantityInStock(partDetails.getQuantityInStock());
        part.setMinimumStockLevel(partDetails.getMinimumStockLevel());
        part.setLocation(partDetails.getLocation());
        part.setSupplier(partDetails.getSupplier());

        SparePart updated = sparePartRepository.save(part);
        return convertSparePartToDto(updated);
    }

    // Maintenance Costs
    public List<MaintenanceCost> getCostsByTask(Long taskId) {
        return costRepository.findByTaskId(taskId);
    }

    public BigDecimal getTotalCostByTask(Long taskId) {
        BigDecimal total = costRepository.getTotalCostByTaskId(taskId);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Transactional
    public MaintenanceCost addCost(MaintenanceCost cost) {
        MaintenanceTask task = taskRepository.findById(cost.getTask().getId())
                .orElseThrow(() -> new RuntimeException("Task not found"));
        cost.setTask(task);
        return costRepository.save(cost);
    }

    // Helper methods
    private MaintenanceScheduleDto convertScheduleToDto(MaintenanceSchedule schedule) {
        MaintenanceScheduleDto dto = new MaintenanceScheduleDto();
        dto.setId(schedule.getId());
        dto.setEquipmentId(schedule.getEquipment().getId());
        dto.setEquipmentName(schedule.getEquipment().getName());
        dto.setScheduleName(schedule.getScheduleName());
        dto.setDescription(schedule.getDescription());
        dto.setFrequency(schedule.getFrequency());
        dto.setFrequencyValue(schedule.getFrequencyValue());
        dto.setLastMaintenanceDate(schedule.getLastMaintenanceDate());
        dto.setNextMaintenanceDate(schedule.getNextMaintenanceDate());
        dto.setEstimatedDurationMinutes(schedule.getEstimatedDurationMinutes());
        dto.setPriority(schedule.getPriority());
        dto.setIsActive(schedule.getIsActive());
        return dto;
    }

    private MaintenanceTaskDto convertTaskToDto(MaintenanceTask task) {
        MaintenanceTaskDto dto = new MaintenanceTaskDto();
        dto.setId(task.getId());
        dto.setScheduleId(task.getSchedule() != null ? task.getSchedule().getId() : null);
        dto.setEquipmentId(task.getEquipment().getId());
        dto.setEquipmentName(task.getEquipment().getName());
        dto.setTaskTitle(task.getTaskTitle());
        dto.setDescription(task.getDescription());
        dto.setAssignedToId(task.getAssignedTo() != null ? task.getAssignedTo().getId() : null);
        dto.setAssignedToName(task.getAssignedTo() != null ? task.getAssignedTo().getFullName() : null);
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setScheduledDate(task.getScheduledDate());
        dto.setStartedAt(task.getStartedAt());
        dto.setCompletedAt(task.getCompletedAt());
        dto.setActualDurationMinutes(task.getActualDurationMinutes());
        dto.setNotes(task.getNotes());
        dto.setCreatedAt(task.getCreatedAt());
        return dto;
    }

    private SparePartDto convertSparePartToDto(SparePart part) {
        SparePartDto dto = new SparePartDto();
        dto.setId(part.getId());
        dto.setPartNumber(part.getPartNumber());
        dto.setPartName(part.getPartName());
        dto.setDescription(part.getDescription());
        dto.setCategory(part.getCategory());
        dto.setUnitPrice(part.getUnitPrice());
        dto.setQuantityInStock(part.getQuantityInStock());
        dto.setMinimumStockLevel(part.getMinimumStockLevel());
        dto.setLocation(part.getLocation());
        dto.setSupplier(part.getSupplier());
        dto.setIsLowStock(part.getQuantityInStock() <= part.getMinimumStockLevel());
        return dto;
    }
}
