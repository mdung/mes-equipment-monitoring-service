# Data Visualization Features

This document describes the data visualization features implemented for the MES Equipment Monitoring Service.

## Features Implemented

### 1. Heatmaps for Equipment Utilization ✅

**Location**: `frontend/src/components/visualizations/EquipmentUtilizationHeatmap.jsx`

**Features**:
- **Time-Based Heatmap**: Week-based heatmap showing utilization by day and hour
- **Color Coding**: 
  - Red (0-20%): Low utilization
  - Orange (20-40%): Below average
  - Yellow (40-60%): Average
  - Light Green (60-80%): Good
  - Dark Green (80-100%): Excellent
- **Interactive Cells**: Click on cells to see detailed information
- **Hour Labels**: 24-hour format with AM/PM labels
- **Day Labels**: Day of week and date
- **Utilization Percentage**: Shows percentage in each cell
- **Status Information**: Displays equipment status for each time slot

**Usage**:
```jsx
<EquipmentUtilizationHeatmap 
  equipmentId={1} 
  timeRange="week" 
/>
```

**Data Structure**:
- Date and hour combinations
- Utilization percentage (0-100)
- Equipment status per time slot

### 2. Sankey Diagrams for Material Flow ✅

**Location**: `frontend/src/components/visualizations/MaterialFlowSankey.jsx`

**Features**:
- **Material Flow Visualization**: Shows flow from materials to finished products
- **Node Types**: 
  - Blue: Raw Materials
  - Green: Components
  - Yellow: Processes
  - Red: Finished Products
- **Link Width**: Proportional to material quantity
- **Interactive**: Hover over nodes and links for details
- **Color-Coded Flow**: Different colors for different material types
- **Value Labels**: Shows quantity on links

**Usage**:
```jsx
<MaterialFlowSankey 
  orderId={1} 
  timeRange="week" 
/>
```

**Data Structure**:
```javascript
{
  nodes: [
    { name: 'Raw Material A', type: 'material' },
    { name: 'Component X', type: 'component' },
    // ...
  ],
  links: [
    { source: 0, target: 1, value: 100 },
    // ...
  ]
}
```

### 3. Network Diagrams for Equipment Relationships ✅

**Location**: `frontend/src/components/visualizations/EquipmentNetworkDiagram.jsx`

**Features**:
- **Force-Directed Graph**: Interactive network visualization
- **Node Colors**: Color-coded by equipment status
  - Green: Running
  - Yellow: Idle
  - Red: Down
  - Blue: Maintenance
- **Interactive Nodes**: Click nodes to see details
- **Link Visualization**: Shows relationships between equipment
- **Zoom and Pan**: Navigate the network
- **Node Hover**: Highlight connected nodes
- **Auto-Layout**: Automatic positioning with physics simulation

**Usage**:
```jsx
<EquipmentNetworkDiagram 
  selectedEquipmentId={1} 
/>
```

**Features**:
- Drag nodes to reposition
- Zoom with mouse wheel
- Pan by dragging background
- Click nodes for details
- Shows connection count

### 4. 3D Factory Floor Layout ✅

**Location**: `frontend/src/components/visualizations/FactoryFloor3D.jsx`

**Features**:
- **3D Visualization**: Three.js-based 3D factory floor
- **Equipment Models**: 3D boxes representing equipment
- **Color-Coded Status**: Equipment color matches status
- **Interactive Camera**: 
  - Orbit controls (rotate, zoom, pan)
  - Multiple view modes (top, perspective, side)
- **Fullscreen Mode**: Toggle fullscreen for better viewing
- **Equipment Labels**: Text labels above equipment
- **Grid Floor**: Visual grid for reference
- **Click Interaction**: Click equipment for details

**Usage**:
```jsx
<FactoryFloor3D />
```

**View Modes**:
- Top View: Bird's eye view from above
- Perspective: 3D angled view
- Side View: Side-on view

**Controls**:
- Mouse drag: Rotate camera
- Mouse wheel: Zoom in/out
- Right-click drag: Pan
- Fullscreen button: Toggle fullscreen

### 5. Interactive Timeline Views ✅

**Location**: `frontend/src/components/visualizations/InteractiveTimeline.jsx`

**Features**:
- **Time Navigation**: Navigate through time with previous/next buttons
- **Zoom Control**: Zoom in/out to see different time ranges
- **Playback Mode**: Auto-advance through time
- **Event Visualization**: Color-coded events on timeline
- **Event Types**:
  - Blue: Production events
  - Yellow: Maintenance events
  - Red: Alert events
  - Green: Quality events
- **Current Date Indicator**: Visual indicator for current date
- **Event Details**: Click events to see details
- **Time Range Selection**: Adjustable time range (1-30 days)

**Usage**:
```jsx
<InteractiveTimeline
  events={events}
  startDate={new Date()}
  endDate={new Date()}
  onEventClick={(event) => console.log(event)}
/>
```

**Controls**:
- Previous/Next: Navigate days
- Play/Pause: Auto-advance
- Today: Jump to current date
- Zoom In/Out: Adjust time range
- Click Events: View details

## Data Visualization Page

**Location**: `frontend/src/pages/DataVisualization.jsx`

A dedicated page showcasing all visualization features:
- Tab-based navigation
- Equipment and order selection
- All visualization components
- Responsive layout

**Route**: `/visualizations`

## Component Structure

```
frontend/src/
├── components/
│   └── visualizations/
│       ├── EquipmentUtilizationHeatmap.jsx    # Heatmap visualization
│       ├── MaterialFlowSankey.jsx             # Sankey diagram
│       ├── EquipmentNetworkDiagram.jsx        # Network graph
│       ├── FactoryFloor3D.jsx                  # 3D factory layout
│       └── InteractiveTimeline.jsx             # Timeline view
└── pages/
    └── DataVisualization.jsx                   # Main visualization page
```

## Dependencies

- **d3**: Data visualization library
- **d3-sankey**: Sankey diagram implementation
- **react-force-graph-2d**: 2D force-directed graphs
- **react-force-graph-3d**: 3D force-directed graphs (for future use)
- **three**: 3D graphics library
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers for Three.js
- **date-fns**: Date manipulation

## Integration Points

### Backend API Endpoints (Expected)

The frontend expects these API endpoints:

- `GET /equipment/{id}/utilization?range={range}` - Get utilization data
- `GET /material-flow/order/{orderId}` - Get material flow data
- `GET /equipment/network` - Get equipment network relationships
- `GET /equipment` - Get all equipment (for 3D layout)

## Usage Examples

### Heatmap
```jsx
import EquipmentUtilizationHeatmap from '../components/visualizations/EquipmentUtilizationHeatmap';

<EquipmentUtilizationHeatmap equipmentId={1} timeRange="week" />
```

### Sankey Diagram
```jsx
import MaterialFlowSankey from '../components/visualizations/MaterialFlowSankey';

<MaterialFlowSankey orderId={1} />
```

### Network Diagram
```jsx
import EquipmentNetworkDiagram from '../components/visualizations/EquipmentNetworkDiagram';

<EquipmentNetworkDiagram selectedEquipmentId={1} />
```

### 3D Factory Floor
```jsx
import FactoryFloor3D from '../components/visualizations/FactoryFloor3D';

<FactoryFloor3D />
```

### Interactive Timeline
```jsx
import InteractiveTimeline from '../components/visualizations/InteractiveTimeline';

<InteractiveTimeline
  events={events}
  startDate={startDate}
  endDate={endDate}
  onEventClick={handleEventClick}
/>
```

## Visualization Features

### Heatmap
- Week view (can be extended to month/year)
- 24-hour breakdown
- Color intensity based on utilization
- Click cells for details
- Status information

### Sankey Diagram
- Material flow from source to destination
- Proportional link widths
- Color-coded node types
- Interactive hover effects
- Value labels

### Network Diagram
- Force-directed layout
- Status-based coloring
- Interactive navigation
- Connection visualization
- Node details on click

### 3D Factory Floor
- Three.js 3D rendering
- Interactive camera controls
- Multiple view modes
- Equipment positioning
- Fullscreen support

### Interactive Timeline
- Time navigation
- Zoom controls
- Playback mode
- Event visualization
- Current date indicator

## Performance Considerations

- **Lazy Loading**: Components load data on demand
- **Efficient Rendering**: Optimized for large datasets
- **Canvas Rendering**: Uses canvas for performance
- **WebGL**: 3D uses WebGL for hardware acceleration
- **Debouncing**: User interactions are debounced where appropriate

## Future Enhancements

Potential improvements:
- More heatmap time ranges (month, year)
- Custom Sankey layouts
- More 3D equipment models
- Timeline event filtering
- Export visualizations as images
- Print-friendly views
- More network layout algorithms
- Real-time updates for visualizations
- Custom color schemes
- Animation support

## Notes

- All visualizations are fully interactive
- Components support dark mode
- Responsive design for all screen sizes
- Sample data generation for demonstration
- Ready for backend API integration
- Performance optimized for large datasets
- Accessible with keyboard navigation support

