# Maintenance Module Guide

## Overview

The Maintenance Module is a comprehensive system for managing equipment maintenance, preventive schedules, spare parts inventory, and maintenance costs. It provides a complete solution for tracking maintenance activities and ensuring equipment reliability.

## Features

### 1. Maintenance Calendar View
- **Visual Calendar Interface**: Month-by-month view of all scheduled maintenance activities
- **Task Visualization**: See all maintenance tasks and preventive schedules at a glance
- **Priority Indicators**: Color-coded tasks based on priority (High, Medium, Low)
- **Date Details**: Click on any date to see detailed information about scheduled activities
- **Navigation**: Easy month-to-month navigation with previous/next buttons

### 2. Preventive Maintenance Scheduler
- **Recurring Schedules**: Create maintenance schedules with various frequencies:
  - Daily
  - Weekly
  - Monthly
  - Quarterly
  - Yearly
- **Equipment Assignment**: Link schedules to specific equipment
- **Frequency Configuration**: Set custom intervals (e.g., every 2 weeks, every 3 months)
- **Duration Estimates**: Track estimated time for each maintenance activity
- **Priority Levels**: Set priority (Low, Medium, High) for each schedule
- **Active/Inactive Status**: Enable or disable schedules as needed
- **Upcoming Alerts**: Automatic alerts for maintenance due within 7 days

### 3. Maintenance Task Checklist
- **Task Management**: Create, assign, and track maintenance tasks
- **Status Tracking**: Monitor task progress through multiple states:
  - Pending
  - In Progress
  - Completed
  - Cancelled
- **User Assignment**: Assign tasks to specific maintenance personnel
- **Task Actions**:
  - Start Task: Begin work on a pending task
  - Complete Task: Mark task as done with completion notes
  - Edit Task: Update task details
- **Statistics Dashboard**: View task counts by status
- **Filtering**: Filter tasks by status for focused views
- **Completion Details**: Record actual duration and notes when completing tasks

### 4. Spare Parts Management
- **Inventory Tracking**: Maintain complete spare parts inventory
- **Stock Levels**: Monitor current stock and minimum thresholds
- **Low Stock Alerts**: Automatic warnings when parts fall below minimum levels
- **Part Information**:
  - Part Number (unique identifier)
  - Part Name and Description
  - Category
  - Unit Price
  - Quantity in Stock
  - Minimum Stock Level
  - Storage Location
  - Supplier Information
- **Inventory Value**: Real-time calculation of total inventory value
- **Low Stock Filter**: Quick view of parts needing reorder

### 5. Maintenance Cost Tracking
- **Cost Recording**: Track all costs associated with maintenance tasks
- **Cost Types**:
  - Labor
  - Parts
  - Materials
  - External Service
  - Other
- **Detailed Breakdown**: Record quantity and unit amount for each cost item
- **Cost Summary**: View total costs by type and overall
- **Task-Based Tracking**: Associate costs with specific maintenance tasks
- **Real-time Calculations**: Automatic total cost calculations

### 6. Equipment Maintenance History
- **Complete History**: View all completed maintenance tasks
- **Filtering Options**:
  - By Equipment
  - By Date Range
- **Detailed Records**: Each history entry includes:
  - Task details
  - Completion date and time
  - Assigned personnel
  - Actual duration
  - Priority level
  - Total cost
  - Completion notes
- **Cost Breakdown**: Expandable view showing detailed cost information
- **Statistics**:
  - Total completed tasks
  - Average maintenance duration
  - Total maintenance costs

## API Endpoints

### Maintenance Schedules

```
GET    /api/maintenance/schedules              - Get all schedules
GET    /api/maintenance/schedules/{id}         - Get schedule by ID
GET    /api/maintenance/schedules/equipment/{equipmentId} - Get schedules by equipment
GET    /api/maintenance/schedules/upcoming     - Get upcoming schedules (within 7 days)
POST   /api/maintenance/schedules              - Create new schedule
PUT    /api/maintenance/schedules/{id}         - Update schedule
DELETE /api/maintenance/schedules/{id}         - Delete schedule
```

### Maintenance Tasks

```
GET    /api/maintenance/tasks                  - Get all tasks
GET    /api/maintenance/tasks/{id}             - Get task by ID
GET    /api/maintenance/tasks/equipment/{equipmentId} - Get tasks by equipment
GET    /api/maintenance/tasks/user/{userId}    - Get tasks by assigned user
GET    /api/maintenance/tasks/status/{status}  - Get tasks by status
POST   /api/maintenance/tasks                  - Create new task
PUT    /api/maintenance/tasks/{id}             - Update task
PUT    /api/maintenance/tasks/{id}/start       - Start task
PUT    /api/maintenance/tasks/{id}/complete    - Complete task
```

### Spare Parts

```
GET    /api/maintenance/spare-parts            - Get all spare parts
GET    /api/maintenance/spare-parts/low-stock  - Get low stock parts
POST   /api/maintenance/spare-parts            - Create new spare part
PUT    /api/maintenance/spare-parts/{id}       - Update spare part
```

### Maintenance Costs

```
GET    /api/maintenance/costs/task/{taskId}    - Get costs by task
GET    /api/maintenance/costs/task/{taskId}/total - Get total cost for task
POST   /api/maintenance/costs                  - Add new cost
```

## Usage Guide

### Creating a Preventive Maintenance Schedule

1. Navigate to **Maintenance > Preventive Scheduler**
2. Click **New Schedule**
3. Fill in the form:
   - Select Equipment
   - Enter Schedule Name (e.g., "Monthly Oil Change")
   - Add Description
   - Set Frequency (e.g., Monthly, every 1 month)
   - Set Next Maintenance Date
   - Enter Estimated Duration
   - Set Priority Level
   - Set Status (Active/Inactive)
4. Click **Create**

### Managing Maintenance Tasks

1. Navigate to **Maintenance > Task Checklist**
2. View task statistics at the top
3. Filter tasks by status if needed
4. To create a new task:
   - Click **New Task**
   - Select Equipment
   - Enter Task Title and Description
   - Assign to a user (optional)
   - Set Scheduled Date and Priority
   - Click **Create**
5. To work on a task:
   - Click the **Play** icon to start a pending task
   - Click the **Check** icon to complete an in-progress task
   - Enter actual duration and notes when completing

### Managing Spare Parts

1. Navigate to **Maintenance > Spare Parts**
2. View inventory statistics and low stock alerts
3. To add a new part:
   - Click **Add Spare Part**
   - Enter Part Number and Name
   - Add Description and Category
   - Set Unit Price
   - Enter Current Stock and Minimum Level
   - Add Location and Supplier
   - Click **Add**
4. Use the checkbox to filter low stock items only

### Tracking Maintenance Costs

1. Navigate to **Maintenance > Cost Tracking**
2. Select a task from the dropdown
3. View cost summary by type
4. To add a cost:
   - Click **Add Cost**
   - Select Task (if not already selected)
   - Choose Cost Type
   - Enter Description
   - Set Quantity and Unit Amount
   - Click **Add Cost**
5. View detailed cost breakdown in the table

### Viewing Maintenance History

1. Navigate to **Maintenance > History**
2. View overall statistics
3. Apply filters:
   - Select specific equipment
   - Set date range
4. Click on any task row to expand and see:
   - Completion notes
   - Detailed cost breakdown
   - Timeline information

## Best Practices

### Preventive Maintenance
- Set up recurring schedules for all critical equipment
- Use appropriate frequencies based on manufacturer recommendations
- Enable upcoming alerts to stay ahead of maintenance needs
- Review and update schedules regularly

### Task Management
- Assign tasks to specific personnel for accountability
- Set realistic priorities based on equipment criticality
- Record actual duration to improve future estimates
- Add detailed notes when completing tasks

### Spare Parts
- Maintain accurate minimum stock levels
- Update inventory immediately after use
- Review low stock alerts regularly
- Keep supplier information current for quick reordering

### Cost Tracking
- Record all costs promptly and accurately
- Use appropriate cost types for better analysis
- Include detailed descriptions for future reference
- Review cost trends to identify optimization opportunities

## Database Schema

### maintenance_schedules
- Stores recurring maintenance schedule definitions
- Links to equipment
- Tracks frequency and next maintenance date

### maintenance_tasks
- Individual maintenance tasks (from schedules or ad-hoc)
- Links to equipment and assigned users
- Tracks status and completion details

### spare_parts
- Spare parts inventory
- Stock levels and pricing
- Location and supplier information

### maintenance_costs
- Cost records for maintenance tasks
- Supports multiple cost types
- Quantity and amount tracking

### maintenance_task_parts
- Links tasks to spare parts used
- Tracks quantity consumed

## Integration Points

- **Equipment Module**: All maintenance activities link to equipment records
- **User Management**: Task assignment and tracking
- **Dashboard**: Maintenance metrics and alerts
- **Reports**: Maintenance cost analysis and trends

## Future Enhancements

- Mobile app for field technicians
- Barcode scanning for spare parts
- Predictive maintenance using equipment sensor data
- Maintenance work order printing
- Vendor management integration
- Maintenance KPI dashboard
- Equipment downtime correlation
- Automated schedule generation based on equipment usage

## Troubleshooting

### Tasks not appearing in calendar
- Verify the scheduled date is set correctly
- Check that the task status is not "Cancelled"
- Ensure you're viewing the correct month

### Low stock alerts not showing
- Verify minimum stock levels are set
- Check that current stock is below minimum
- Refresh the page to see latest data

### Cost totals incorrect
- Ensure quantity field is filled for all costs
- Verify amount values are entered correctly
- Check that all costs are associated with the correct task

## Support

For issues or questions about the Maintenance Module:
1. Check this guide for common solutions
2. Review API documentation for integration issues
3. Contact system administrator for access or permission issues
