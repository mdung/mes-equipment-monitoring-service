# Maintenance Module - Testing Checklist

## Pre-Testing Setup

- [ ] Backend server is running on `http://localhost:8080`
- [ ] Frontend server is running on `http://localhost:5173`
- [ ] Database migrations have been applied successfully
- [ ] At least one equipment record exists in the database
- [ ] At least one user exists for task assignment
- [ ] Logged in with appropriate credentials

## 1. Calendar View Testing

### Basic Functionality
- [ ] Navigate to Maintenance module
- [ ] Calendar View tab is selected by default
- [ ] Current month is displayed
- [ ] Today's date is highlighted in blue
- [ ] Previous/Next month buttons work correctly

### Task Display
- [ ] Create a test task for today
- [ ] Task appears on the calendar
- [ ] Task shows correct priority color (Red/Yellow/Green)
- [ ] Multiple tasks on same day show correctly
- [ ] Overflow indicator shows when more than 3 items

### Date Details
- [ ] Click on a date with tasks
- [ ] Modal opens showing task details
- [ ] Task information is complete and accurate
- [ ] Modal closes when clicking outside or close button
- [ ] Click on empty date shows "No tasks scheduled"

## 2. Preventive Scheduler Testing

### Schedule Creation
- [ ] Click "New Schedule" button
- [ ] Modal opens with empty form
- [ ] Select equipment from dropdown
- [ ] Enter schedule name
- [ ] Add description
- [ ] Select frequency (test each: Daily, Weekly, Monthly, Quarterly, Yearly)
- [ ] Set frequency value (e.g., every 2 weeks)
- [ ] Set next maintenance date
- [ ] Enter estimated duration
- [ ] Set priority level
- [ ] Set status (Active/Inactive)
- [ ] Click "Create"
- [ ] Success toast appears
- [ ] New schedule appears in table

### Schedule Management
- [ ] View all schedules in table
- [ ] Verify all columns display correctly
- [ ] Click edit button on a schedule
- [ ] Modal opens with pre-filled data
- [ ] Modify schedule details
- [ ] Click "Update"
- [ ] Changes are saved and reflected in table
- [ ] Click delete button
- [ ] Confirmation dialog appears
- [ ] Confirm deletion
- [ ] Schedule is removed from table

### Upcoming Alerts
- [ ] Create schedule with next maintenance date within 7 days
- [ ] Yellow alert box appears at top
- [ ] Alert shows correct count of upcoming schedules
- [ ] Schedule row is highlighted in yellow

## 3. Task Checklist Testing

### Task Creation
- [ ] Click "New Task" button
- [ ] Modal opens
- [ ] Select equipment
- [ ] Enter task title
- [ ] Add description
- [ ] Assign to user (optional)
- [ ] Set scheduled date
- [ ] Set priority
- [ ] Click "Create"
- [ ] Task appears in table with "PENDING" status

### Task Workflow
- [ ] Find a pending task
- [ ] Click play icon (▶) to start
- [ ] Status changes to "IN_PROGRESS"
- [ ] Started timestamp is recorded
- [ ] Click checkmark icon (✓) to complete
- [ ] Completion modal opens
- [ ] Enter actual duration (optional)
- [ ] Add completion notes (optional)
- [ ] Click "Complete Task"
- [ ] Status changes to "COMPLETED"
- [ ] Completed timestamp is recorded

### Task Statistics
- [ ] View statistics cards at top
- [ ] Total tasks count is correct
- [ ] Pending count matches filtered view
- [ ] In Progress count matches filtered view
- [ ] Completed count matches filtered view

### Filtering
- [ ] Select "All Tasks" filter - shows all tasks
- [ ] Select "Pending" filter - shows only pending
- [ ] Select "In Progress" filter - shows only in progress
- [ ] Select "Completed" filter - shows only completed

### Task Editing
- [ ] Click edit button on pending task
- [ ] Modal opens with current data
- [ ] Modify task details
- [ ] Save changes
- [ ] Changes reflected in table
- [ ] Completed tasks cannot be edited (no edit button)

## 4. Spare Parts Management Testing

### Parts Creation
- [ ] Click "Add Spare Part" button
- [ ] Modal opens
- [ ] Enter part number (unique)
- [ ] Enter part name
- [ ] Add description
- [ ] Enter category
- [ ] Set unit price
- [ ] Enter quantity in stock
- [ ] Set minimum stock level
- [ ] Add location
- [ ] Enter supplier
- [ ] Click "Add"
- [ ] Part appears in table

### Low Stock Detection
- [ ] Create part with stock below minimum
- [ ] Red alert box appears at top
- [ ] Alert shows correct count
- [ ] Part row is highlighted in red
- [ ] "Low Stock" indicator appears in stock column
- [ ] Enable "Show low stock items only" checkbox
- [ ] Only low stock items are displayed

### Statistics
- [ ] Total Parts count is correct
- [ ] Low Stock Items count is accurate
- [ ] Total Inventory Value is calculated correctly
- [ ] Value updates when parts are added/edited

### Parts Editing
- [ ] Click edit button on a part
- [ ] Modal opens with current data
- [ ] Modify part details
- [ ] Update stock quantity
- [ ] Save changes
- [ ] Changes reflected in table
- [ ] Inventory value recalculates

## 5. Cost Tracking Testing

### Task Selection
- [ ] View Cost Tracking tab
- [ ] Dropdown shows completed and in-progress tasks
- [ ] Select a task
- [ ] Cost summary cards appear
- [ ] Cost breakdown table appears (if costs exist)

### Adding Costs
- [ ] Click "Add Cost" button (requires task selection)
- [ ] Modal opens
- [ ] Task is pre-selected
- [ ] Select cost type (Labor, Parts, Materials, External Service, Other)
- [ ] Enter description
- [ ] Set quantity
- [ ] Enter unit amount
- [ ] Total cost preview updates automatically
- [ ] Click "Add Cost"
- [ ] Cost appears in breakdown table

### Cost Calculations
- [ ] Add multiple costs of different types
- [ ] Verify each cost row shows correct total (quantity × unit amount)
- [ ] Verify cost summary by type is correct
- [ ] Verify total cost is sum of all costs
- [ ] Cost type badges show correct colors

### Multiple Cost Types
- [ ] Add Labor cost
- [ ] Add Parts cost
- [ ] Add Materials cost
- [ ] Add External Service cost
- [ ] Add Other cost
- [ ] Each type appears in summary cards
- [ ] Total includes all types

## 6. Maintenance History Testing

### History Display
- [ ] Complete at least one maintenance task
- [ ] Navigate to History tab
- [ ] Completed task appears in table
- [ ] All columns display correctly
- [ ] Completion date and time are accurate

### Statistics
- [ ] Completed Tasks count is correct
- [ ] Average Duration is calculated (if durations recorded)
- [ ] Total Cost is sum of all task costs

### Filtering
- [ ] Select equipment from dropdown
- [ ] Only tasks for that equipment are shown
- [ ] Select "All Equipment" - all tasks shown
- [ ] Set start date
- [ ] Only tasks after start date shown
- [ ] Set end date
- [ ] Only tasks within date range shown
- [ ] Clear filters - all tasks shown

### Expandable Details
- [ ] Click on a task row
- [ ] Row expands to show details
- [ ] Completion notes are displayed (if any)
- [ ] Cost breakdown table appears (if costs exist)
- [ ] Cost breakdown shows all cost items
- [ ] Cost total is correct
- [ ] Timeline information is accurate
- [ ] Click row again to collapse

## 7. Integration Testing

### Calendar Integration
- [ ] Create schedule in Preventive Scheduler
- [ ] Schedule appears in Calendar View
- [ ] Create task in Task Checklist
- [ ] Task appears in Calendar View
- [ ] Dates match correctly

### Task to History Flow
- [ ] Create new task
- [ ] Start task
- [ ] Complete task with notes
- [ ] Task appears in History
- [ ] All details are preserved

### Cost to History Integration
- [ ] Complete a task
- [ ] Add costs to the task
- [ ] View task in History
- [ ] Expand task details
- [ ] Cost breakdown is visible
- [ ] Costs match what was entered

### Spare Parts Usage
- [ ] Create maintenance task
- [ ] Record parts used (if implementing parts usage)
- [ ] Verify stock levels update
- [ ] Check low stock alerts trigger

## 8. Error Handling Testing

### Validation
- [ ] Try creating schedule without equipment - should fail
- [ ] Try creating task without title - should fail
- [ ] Try creating part without part number - should fail
- [ ] Try adding cost without amount - should fail
- [ ] Error messages are clear and helpful

### Network Errors
- [ ] Stop backend server
- [ ] Try any operation
- [ ] Error toast appears
- [ ] User is informed of the issue
- [ ] Restart backend
- [ ] Operations work again

### Data Integrity
- [ ] Try creating duplicate part number - should fail
- [ ] Try deleting equipment with schedules - verify cascade behavior
- [ ] Try completing already completed task - should fail

## 9. UI/UX Testing

### Responsiveness
- [ ] Resize browser window
- [ ] All components adjust appropriately
- [ ] Tables remain usable
- [ ] Modals are centered and sized correctly
- [ ] No horizontal scrolling on mobile sizes

### Visual Feedback
- [ ] Hover effects work on buttons
- [ ] Active tab is highlighted
- [ ] Loading states appear during API calls
- [ ] Success toasts appear for successful operations
- [ ] Error toasts appear for failed operations
- [ ] Toast messages auto-dismiss after 3 seconds

### Navigation
- [ ] All tabs are accessible
- [ ] Tab switching is smooth
- [ ] Back button works correctly
- [ ] Sidebar navigation to Maintenance works
- [ ] Maintenance icon (wrench) is visible

## 10. Performance Testing

### Data Loading
- [ ] Create 50+ schedules
- [ ] Calendar loads without lag
- [ ] Table pagination works (if implemented)
- [ ] Filtering is responsive

### Large Datasets
- [ ] Create 100+ tasks
- [ ] Task list loads quickly
- [ ] Filtering performs well
- [ ] No browser freezing

## 11. Cross-Browser Testing

### Chrome
- [ ] All features work
- [ ] UI renders correctly
- [ ] No console errors

### Firefox
- [ ] All features work
- [ ] UI renders correctly
- [ ] No console errors

### Safari (if available)
- [ ] All features work
- [ ] UI renders correctly
- [ ] No console errors

### Edge
- [ ] All features work
- [ ] UI renders correctly
- [ ] No console errors

## 12. Security Testing

### Authentication
- [ ] Logout and try accessing /maintenance
- [ ] Should redirect to login
- [ ] Login and access works

### Authorization
- [ ] Test with different user roles
- [ ] Verify appropriate access levels
- [ ] API endpoints respect permissions

## Test Results Summary

**Date Tested**: _______________
**Tested By**: _______________
**Environment**: _______________

**Total Tests**: _______________
**Passed**: _______________
**Failed**: _______________
**Blocked**: _______________

### Critical Issues Found
1. 
2. 
3. 

### Minor Issues Found
1. 
2. 
3. 

### Recommendations
1. 
2. 
3. 

**Overall Status**: ⬜ Pass ⬜ Pass with Issues ⬜ Fail

**Sign-off**: _______________
