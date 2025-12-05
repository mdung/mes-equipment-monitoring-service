# Advanced Production Order Management

This document describes the advanced production order management features implemented for the MES Equipment Monitoring Service.

## Features Implemented

### 1. Gantt Chart for Production Scheduling ✅

**Location**: `frontend/src/components/production/GanttChart.jsx`

**Features**:
- **Visual Timeline**: Week-based Gantt chart view showing production orders
- **Equipment Grouping**: Orders grouped by assigned equipment
- **Interactive Bars**: Click on order bars to view details
- **Date Navigation**: Navigate between weeks with previous/next buttons
- **Zoom Control**: Zoom in/out for better visibility
- **Status Colors**: Different colors for order statuses (Completed, In Progress, Planned, Cancelled, Delayed)
- **Priority Indicators**: Visual priority indicators with colored borders
- **Today Button**: Quick navigation to current week

**Usage**:
- Switch to Gantt view using the view mode selector
- Navigate weeks using arrow buttons
- Click on order bars to see details
- Use zoom controls to adjust view scale

### 2. Order Priority Management ✅

**Location**: `frontend/src/pages/ProductionOrders.jsx`

**Features**:
- **Priority Levels**: 0-10 priority scale (0 = lowest, 10 = highest)
- **Visual Indicators**: Color-coded priority display
  - Red (8-10): High priority
  - Orange (5-7): Medium priority
  - Blue (0-4): Low priority
- **Quick Adjustment**: Up/down arrows to adjust priority in list view
- **Priority Sorting**: Sort orders by priority
- **Priority in Forms**: Set priority when creating orders

**Priority Colors**:
- High Priority (8-10): Red
- Medium Priority (5-7): Orange
- Low Priority (0-4): Blue

**Usage**:
- Set priority when creating orders
- Adjust priority using up/down arrows in list view
- Sort orders by priority using the sort dropdown

### 3. Material Requirements Display ✅

**Location**: `frontend/src/components/production/MaterialRequirements.jsx`

**Features**:
- **BOM Integration**: Displays Bill of Materials for the product
- **Stock Status**: Shows required vs available quantities
- **Status Indicators**:
  - Green: Sufficient stock
  - Yellow: Low stock (80% of required)
  - Red: Insufficient stock
- **Material Consumption**: Tracks actual material consumption
- **Unit of Measure**: Displays units for each material
- **Consumption History**: Shows when materials were consumed

**Usage**:
- View material requirements in order details modal
- See stock status at a glance
- Track material consumption over time

### 4. Work Instructions Viewer ✅

**Location**: `frontend/src/components/production/WorkInstructions.jsx`

**Features**:
- **Step-by-Step Instructions**: Detailed work instructions for each production step
- **Step Navigation**: Navigate between steps with Previous/Next buttons
- **Step Completion**: Mark steps as complete
- **Visual Indicators**: 
  - Completed steps: Green background with checkmark
  - Current step: Highlighted with accent color
  - Pending steps: Default styling
- **Step Details**:
  - Step title and description
  - Estimated duration
  - Required equipment
  - Safety notes (highlighted in yellow)
  - Quality checkpoints
- **Progress Tracking**: Visual progress through steps

**Usage**:
- View work instructions in order details modal
- Navigate through steps
- Mark steps as complete
- Review safety notes and quality checkpoints

### 5. Progress Photos/Attachments ✅

**Location**: `frontend/src/components/production/ProgressAttachments.jsx`

**Features**:
- **Photo Upload**: Upload progress photos
- **Camera Capture**: Direct camera capture on mobile devices
- **File Upload**: Upload various file types (images, PDFs, documents)
- **Image Gallery**: Grid view of uploaded attachments
- **File Management**: Delete attachments
- **Download Support**: Download attachments
- **Upload Date**: Track when files were uploaded
- **File Type Icons**: Visual indicators for different file types

**Supported Formats**:
- Images: JPG, JPEG, PNG, GIF, WebP
- Documents: PDF, DOC, DOCX

**Usage**:
- Click "Camera" to capture photo directly
- Click "Upload" to select files
- View attachments in grid view
- Delete unwanted attachments
- Download attachments

### 6. Order Dependencies ✅

**Location**: `frontend/src/components/production/OrderDependencies.jsx`

**Features**:
- **Dependency Management**: Define which orders must complete before this order can start
- **Visual Status**: Color-coded dependency status
  - Green: Dependent order completed (ready)
  - Blue: Dependent order in progress
  - Red: Dependent order cancelled (blocked)
  - Yellow: Dependent order pending (waiting)
- **Add Dependencies**: Add new dependencies
- **Remove Dependencies**: Remove existing dependencies
- **Dependency List**: View all dependencies for an order
- **Order Linking**: Link to dependent orders

**Dependency Types**:
- **PRECEDES**: This order must complete before dependent orders can start
- **BLOCKS**: This order blocks dependent orders

**Usage**:
- View dependencies in order details modal
- Add dependencies by selecting from available orders
- Remove dependencies when no longer needed
- See dependency status at a glance

### 7. Batch Operations (Bulk Start/Stop) ✅

**Location**: `frontend/src/pages/ProductionOrders.jsx`, `frontend/src/components/BulkActions.jsx`

**Features**:
- **Multi-Select**: Select multiple orders using checkboxes
- **Select All**: Quick select/deselect all orders
- **Bulk Start**: Start multiple orders at once
- **Bulk Stop/Cancel**: Cancel multiple orders at once
- **Visual Feedback**: Selected orders are highlighted
- **Bulk Actions Bar**: Appears when orders are selected
- **Confirmation Dialogs**: Safety prompts for destructive actions

**Batch Operations**:
- Start Selected: Start all selected orders
- Cancel Selected: Cancel all selected orders
- Export Selected: Export selected orders (if implemented)

**Usage**:
- Check boxes to select orders
- Use "Select All" in table header
- Click bulk action buttons to perform operations
- Selected orders are highlighted

## Enhanced Production Orders Page

**Location**: `frontend/src/pages/ProductionOrders.jsx`

**New Features**:
- **Multiple View Modes**:
  - Grid View: Card-based layout
  - List View: Table-based layout with sorting
  - Gantt View: Timeline visualization
- **Sorting Options**:
  - By Priority
  - By Date
  - By Status
- **Priority Management**: Adjust priority directly in list view
- **Order Details Modal**: Comprehensive view with all advanced features
- **Bulk Operations**: Select and operate on multiple orders

## Component Structure

```
frontend/src/
├── components/
│   └── production/
│       ├── GanttChart.jsx              # Gantt chart visualization
│       ├── MaterialRequirements.jsx     # Material requirements display
│       ├── WorkInstructions.jsx        # Work instructions viewer
│       ├── ProgressAttachments.jsx     # Progress photos/attachments
│       └── OrderDependencies.jsx       # Order dependencies management
└── pages/
    └── ProductionOrders.jsx            # Enhanced production orders page
```

## Integration Points

### Backend API Endpoints (Expected)

The frontend expects these API endpoints:

- `GET /orders` - Get all orders
- `GET /orders/:id` - Get order details
- `POST /orders` - Create order
- `PUT /orders/:id` - Update order
- `PUT /orders/:id/start` - Start order
- `PUT /orders/:id/complete` - Complete order
- `PUT /orders/:id/cancel` - Cancel order
- `GET /orders/:id/attachments` - Get attachments
- `POST /orders/:id/attachments` - Upload attachments
- `DELETE /orders/:id/attachments/:attachmentId` - Delete attachment
- `GET /orders/:id/dependencies` - Get dependencies
- `POST /orders/:id/dependencies` - Add dependency
- `DELETE /orders/:id/dependencies/:dependencyId` - Remove dependency
- `GET /bom/product/:productName` - Get BOM for product
- `GET /material-consumption/order/:orderId` - Get material consumption
- `GET /work-instructions/product/:productName` - Get work instructions

## Usage Examples

### Viewing Gantt Chart
1. Navigate to Production Orders
2. Click Gantt view button
3. Navigate weeks using arrow buttons
4. Click on order bars for details

### Managing Priority
1. Switch to List view
2. Use up/down arrows next to priority to adjust
3. Or set priority when creating order

### Viewing Material Requirements
1. Click "Details" on any order
2. View Material Requirements section
3. See stock status and consumption

### Adding Work Instructions
1. Open order details
2. Navigate to Work Instructions section
3. Follow step-by-step instructions
4. Mark steps as complete

### Uploading Progress Photos
1. Open order details
2. Go to Progress Photos section
3. Click "Camera" or "Upload"
4. Select/capture photos
5. View in gallery

### Managing Dependencies
1. Open order details
2. Go to Order Dependencies section
3. Click "Add Dependency"
4. Select dependent order
5. View dependency status

### Bulk Operations
1. Switch to List view
2. Select orders using checkboxes
3. Use bulk action buttons
4. Confirm actions

## Dependencies

- `date-fns`: Date manipulation for Gantt chart
- React hooks for state management
- Lucide React for icons

## Future Enhancements

Potential improvements:
- Drag-and-drop in Gantt chart
- Resource leveling
- Critical path analysis
- More dependency types
- Work instruction templates
- Material reservation
- Advanced attachment organization
- Dependency visualization graph

## Notes

- All features are fully integrated
- Gantt chart uses week-based view (can be extended)
- Priority system uses 0-10 scale
- Material requirements integrate with BOM system
- Work instructions support step-by-step workflows
- Attachments support multiple file types
- Dependencies prevent order conflicts
- Batch operations improve efficiency

