# Testing Checklist

Use this checklist to verify all features are working correctly.

## Backend API Tests

### Equipment Endpoints
- [ ] GET /api/equipment - List all equipment
- [ ] POST /api/equipment - Create new equipment
- [ ] GET /api/equipment/{id} - Get equipment by ID
- [ ] PUT /api/equipment/{id} - Update equipment
- [ ] DELETE /api/equipment/{id} - Delete equipment
- [ ] GET /api/equipment/{id}/oee - Get equipment OEE

### Production Order Endpoints
- [ ] GET /api/orders - List all orders
- [ ] POST /api/orders - Create new order
- [ ] GET /api/orders/{id} - Get order by ID
- [ ] PUT /api/orders/{id} - Update order
- [ ] PUT /api/orders/{id}/start - Start order
- [ ] PUT /api/orders/{id}/complete - Complete order
- [ ] PUT /api/orders/{id}/cancel - Cancel order
- [ ] PUT /api/orders/{id}/update-quantity - Update quantity

### Quality Check Endpoints
- [ ] GET /api/quality/order/{orderId} - Get checks by order
- [ ] POST /api/quality - Record quality check

### Equipment Log Endpoints
- [ ] GET /api/equipment-logs/equipment/{equipmentId} - Get logs
- [ ] GET /api/equipment-logs/equipment/{equipmentId}/latest - Get latest log
- [ ] POST /api/equipment-logs - Create log

### Downtime Event Endpoints
- [ ] GET /api/downtime/equipment/{equipmentId} - Get downtime events
- [ ] POST /api/downtime - Record downtime
- [ ] PUT /api/downtime/{id}/end - End downtime

### Dashboard Endpoints
- [ ] GET /api/dashboard/stats - Get statistics
- [ ] GET /api/dashboard/equipment-status-distribution - Get status distribution

## Frontend Feature Tests

### Dashboard Page
- [ ] Page loads without errors
- [ ] Statistics cards display correct data
- [ ] Equipment status distribution chart renders
- [ ] Data updates when navigating away and back
- [ ] Loading state displays while fetching data

### Equipment List Page
- [ ] Equipment list displays correctly
- [ ] Search functionality works
- [ ] "Add Equipment" button opens modal
- [ ] Can create new equipment
- [ ] Can edit existing equipment
- [ ] Can delete equipment (with confirmation)
- [ ] Status badges display correct colors
- [ ] Toast notifications appear on actions
- [ ] Table is responsive

### Production Orders Page
- [ ] Orders display as cards
- [ ] "Create Order" button opens modal
- [ ] Can create new order
- [ ] Equipment dropdown populates
- [ ] Progress bar displays correctly
- [ ] "Start" button works for PLANNED orders
- [ ] "Complete" button works for IN_PROGRESS orders
- [ ] "Cancel" button works (with confirmation)
- [ ] Status badges display correct colors
- [ ] Toast notifications appear on actions

### Quality Checks Page
- [ ] Page loads without errors
- [ ] Quality metrics display per order
- [ ] "Record Check" button opens modal
- [ ] Can record quality check
- [ ] Pass rate calculates correctly
- [ ] Color coding works (green/yellow/red)
- [ ] Only IN_PROGRESS orders show in dropdown
- [ ] Toast notifications appear on actions

### Navigation & Layout
- [ ] Sidebar navigation works
- [ ] Active page is highlighted
- [ ] All menu items are accessible
- [ ] Logo and branding display
- [ ] Notification bell is visible
- [ ] User profile section displays
- [ ] Layout is responsive on mobile

### Modal Component
- [ ] Opens and closes correctly
- [ ] Backdrop click closes modal
- [ ] X button closes modal
- [ ] Form submission works
- [ ] Cancel button works
- [ ] Multiple modals don't conflict

### Toast Component
- [ ] Success toasts display (green)
- [ ] Error toasts display (red)
- [ ] Auto-dismiss after 3 seconds
- [ ] Manual dismiss with X button
- [ ] Multiple toasts stack correctly

## Integration Tests

### Equipment Flow
1. [ ] Create equipment via UI
2. [ ] Verify it appears in list
3. [ ] Edit the equipment
4. [ ] Verify changes are saved
5. [ ] Check dashboard updates
6. [ ] Delete equipment
7. [ ] Verify it's removed

### Production Order Flow
1. [ ] Create equipment first
2. [ ] Create order with equipment assigned
3. [ ] Verify order appears in list
4. [ ] Start the order
5. [ ] Verify status changes to IN_PROGRESS
6. [ ] Record quality check for order
7. [ ] Complete the order
8. [ ] Verify status changes to COMPLETED

### Quality Check Flow
1. [ ] Create and start an order
2. [ ] Record multiple quality checks
3. [ ] Verify pass rate calculates correctly
4. [ ] Check metrics update in real-time

### Dashboard Updates
1. [ ] Note initial dashboard stats
2. [ ] Create new equipment
3. [ ] Verify total equipment count increases
4. [ ] Change equipment status to RUNNING
5. [ ] Verify running count increases
6. [ ] Change equipment status to DOWN
7. [ ] Verify down count increases
8. [ ] Check status distribution chart updates

## Error Handling Tests

### Frontend
- [ ] API connection failure shows error toast
- [ ] Invalid form data shows validation errors
- [ ] Empty states display correctly
- [ ] Loading states prevent duplicate submissions

### Backend
- [ ] Invalid equipment ID returns 404
- [ ] Duplicate equipment code returns error
- [ ] Invalid order status transition handled
- [ ] Missing required fields return 400

## Performance Tests

- [ ] Dashboard loads in < 2 seconds
- [ ] Equipment list with 50+ items performs well
- [ ] Search/filter is responsive
- [ ] Chart rendering is smooth
- [ ] No memory leaks on page navigation

## Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Mobile Responsiveness

- [ ] Dashboard displays correctly on mobile
- [ ] Equipment list is scrollable
- [ ] Modals are usable on small screens
- [ ] Navigation is accessible
- [ ] Forms are easy to fill on mobile

## Database Tests

### Flyway Migration
- [ ] Flyway migrations run successfully on first startup
- [ ] Check flyway_schema_history table exists
- [ ] Verify V1__Schema.sql was applied successfully

### Schema Verification
```sql
-- Connect to database
psql -U mes_user -d mes_db

-- Check all tables exist
\dt
-- Should show: equipment, production_order, equipment_log, downtime_event, quality_check, flyway_schema_history

-- Check indexes
\di
-- Should show all indexes from migration

-- Check foreign keys
SELECT conname, conrelid::regclass, confrelid::regclass 
FROM pg_constraint 
WHERE contype = 'f';
```

- [ ] All 5 main tables created correctly
- [ ] All 5 indexes are in place
- [ ] Foreign key constraints work
- [ ] Data persists after backend restart
- [ ] Flyway baseline-on-migrate works correctly

## Notes

Record any issues found during testing:

---

**Issue 1:**
- Description:
- Steps to reproduce:
- Expected behavior:
- Actual behavior:

---

**Issue 2:**
- Description:
- Steps to reproduce:
- Expected behavior:
- Actual behavior:

---
