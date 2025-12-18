# Enhanced UI Features Guide

## Overview

This guide covers the comprehensive set of advanced UI features implemented for the manufacturing system. These features provide a modern, accessible, and user-friendly interface with enterprise-grade functionality.

## 🎨 Theme System

### Enhanced Theme Context
- **System Theme Detection**: Automatically detects and follows system dark/light mode preferences
- **Manual Override**: Users can manually set light, dark, or system theme
- **Persistent Storage**: Theme preferences are saved and restored across sessions
- **Real-time Updates**: Responds to system theme changes automatically

### Usage
```jsx
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { isDark, themeMode, setTheme, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {themeMode} ({isDark ? 'Dark' : 'Light'})</p>
      <button onClick={() => setTheme('system')}>Use System Theme</button>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

## 🔔 Notification System

### Features
- **Multiple Types**: Success, error, warning, and info notifications
- **Auto-dismiss**: Configurable duration with manual dismiss option
- **Action Buttons**: Add interactive buttons to notifications
- **Stacking**: Multiple notifications stack elegantly
- **Animations**: Smooth entrance and exit animations

### Usage
```jsx
import { useNotifications } from '../components/NotificationSystem';

function MyComponent() {
  const { success, error, warning, info } = useNotifications();
  
  const handleAction = () => {
    success('Operation completed!');
    error('Something went wrong!', { duration: 0 }); // Persistent error
    info('Info with action', {
      actions: [
        { label: 'Learn More', handler: () => console.log('Action clicked') }
      ]
    });
  };
}
```

## ⌨️ Keyboard Shortcuts

### Global Shortcuts
- `Ctrl+K` - Focus search input
- `Ctrl+?` - Show shortcuts help
- `Ctrl+S` - Save (if save button present)
- `Ctrl+P` - Print current page
- `Esc` - Close modals/cancel actions
- `F5` - Refresh page

### Navigation Shortcuts
- `Ctrl+D` - Dashboard
- `Ctrl+E` - Equipment
- `Ctrl+M` - Maintenance
- `Ctrl+Q` - Quality
- `Ctrl+R` - Reports
- `Ctrl+N` - Notifications

### Implementation
The `KeyboardShortcutsManager` component automatically handles all shortcuts. Just add data attributes to your elements:
```jsx
<input data-search-input placeholder="Search..." />
<button data-save-button>Save</button>
<button data-modal-close>Close</button>
```

## 📊 Advanced Data Table

### Features
- **Sorting**: Multi-column sorting with visual indicators
- **Pagination**: Configurable page sizes with navigation
- **Search & Filtering**: Advanced search with multiple filter types
- **Bulk Operations**: Select multiple rows for batch actions
- **Row Actions**: Contextual actions for individual rows
- **Responsive**: Mobile-friendly design
- **Loading States**: Built-in loading and empty states

### Usage
```jsx
import DataTable from '../components/DataTable';

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'status', label: 'Status', type: 'status' },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'cost', label: 'Cost', type: 'currency' }
];

const actions = [
  { icon: Eye, label: 'View', handler: (row) => console.log('View', row) },
  { icon: Edit, label: 'Edit', handler: (row) => console.log('Edit', row) }
];

<DataTable
  data={data}
  columns={columns}
  actions={actions}
  onBulkDelete={handleBulkDelete}
  onBulkExport={handleBulkExport}
  searchFields={searchFields}
  filterOptions={filterOptions}
/>
```

## 🔍 Advanced Search

### Features
- **Quick Search**: Instant search across all fields
- **Field-specific Search**: Search within specific columns
- **Date Range Filtering**: Built-in date range picker
- **Multiple Filter Types**: Select, multiselect, text, and number filters
- **Keyboard Shortcut**: `Ctrl+K` to focus search

### Filter Types
```jsx
const filterOptions = {
  status: {
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]
  },
  categories: {
    label: 'Categories',
    type: 'multiselect',
    options: [/* ... */]
  },
  minCost: {
    label: 'Minimum Cost',
    type: 'number',
    placeholder: 'Enter minimum cost'
  }
};
```

## 📤 Import/Export System

### Features
- **Multiple Formats**: CSV, Excel, PDF support
- **Template Download**: Provide templates for data import
- **Validation**: Real-time validation with error reporting
- **Progress Tracking**: Visual progress indicators
- **Bulk Operations**: Export selected items or all data

### Usage
```jsx
import ImportExport from '../components/ImportExport';

<ImportExport
  onImport={handleImport}
  onExport={handleExport}
  supportedFormats={['csv', 'excel']}
  templateUrl="/templates/equipment-template.csv"
  entityType="equipment"
/>
```

## 🖨️ Advanced Printing

### Features
- **Print Options**: Customizable page setup and content options
- **Multiple Formats**: Portrait/landscape, different paper sizes
- **Content Control**: Include/exclude charts, data, or specific sections
- **Print Preview**: Generated print-friendly layouts
- **Custom Styles**: Inject custom CSS for print layouts

### Usage
```jsx
import PrintButton from '../components/PrintButton';

<PrintButton
  content={printableContent}
  title="Equipment Report"
  includeCharts={true}
  includeData={true}
  customStyles="/* Custom print CSS */"
/>
```

## 🔄 Bulk Operations

### Features
- **Multi-selection**: Select individual items or all items
- **Batch Actions**: Delete, update, or export multiple items
- **Confirmation Dialogs**: Safe bulk operations with confirmations
- **Progress Tracking**: Visual feedback for long-running operations
- **Custom Actions**: Add domain-specific bulk operations

### Usage
```jsx
import BulkOperations from '../components/BulkOperations';

const customActions = [
  {
    label: 'Archive Selected',
    icon: Archive,
    handler: (selectedItems) => handleArchive(selectedItems)
  }
];

<BulkOperations
  selectedItems={selectedItems}
  onBulkDelete={handleBulkDelete}
  onBulkExport={handleBulkExport}
  onBulkUpdate={handleBulkUpdate}
  customActions={customActions}
/>
```

## 🎯 Loading States

### Multiple Variants
- **Spinner**: Traditional loading spinner
- **Dots**: Animated dots for subtle loading
- **Skeleton**: Content placeholder loading
- **Progress**: Progress bar with percentage
- **Overlay**: Full-screen loading overlay

### Usage
```jsx
import LoadingSpinner, { LoadingOverlay, ButtonSpinner } from '../components/LoadingSpinner';

// Different loading states
<LoadingSpinner variant="spinner" message="Loading..." />
<LoadingSpinner variant="dots" size="lg" />
<LoadingSpinner variant="skeleton" />
<LoadingSpinner variant="progress" message="Uploading..." />

// Full page overlay
<LoadingOverlay visible={loading} message="Processing..." />

// Button loading state
<button disabled={loading}>
  {loading ? <ButtonSpinner /> : 'Save'}
</button>
```

## 🛡️ Error Boundary

### Features
- **Graceful Error Handling**: Catches JavaScript errors in component tree
- **Error Reporting**: Integrates with error monitoring services
- **Recovery Options**: Retry, reload, or navigate home
- **Error Details**: Expandable error information for debugging
- **Custom Fallbacks**: Support for custom error UI components

### Usage
```jsx
import ErrorBoundary from '../components/ErrorBoundary';

<ErrorBoundary
  showDetails={process.env.NODE_ENV === 'development'}
  onError={(error, errorInfo) => {
    // Send to error reporting service
    console.error('Error caught:', error, errorInfo);
  }}
>
  <MyComponent />
</ErrorBoundary>
```

## 💾 Local Storage Hook

### Features
- **Automatic Persistence**: Automatically saves to localStorage
- **Cross-tab Sync**: Syncs changes across browser tabs
- **Error Handling**: Graceful handling of localStorage errors
- **Type Safety**: Maintains data types through JSON serialization

### Usage
```jsx
import useLocalStorage from '../hooks/useLocalStorage';

function MyComponent() {
  const [settings, setSettings] = useLocalStorage('user-settings', {
    theme: 'system',
    notifications: true
  });
  
  return (
    <div>
      <input
        type="checkbox"
        checked={settings.notifications}
        onChange={(e) => setSettings(prev => ({
          ...prev,
          notifications: e.target.checked
        }))}
      />
    </div>
  );
}
```

## 📈 Performance Monitoring

### Features
- **Render Tracking**: Monitor component render counts and times
- **Memory Usage**: Track JavaScript heap usage
- **Development Mode**: Only active in development environment
- **Console Logging**: Detailed performance logs

### Usage
```jsx
import usePerformanceMonitor from '../hooks/usePerformanceMonitor';

function MyComponent() {
  const { renderCount, markRender } = usePerformanceMonitor('MyComponent');
  
  // Component logic...
  
  return <div>Render count: {renderCount}</div>;
}
```

## 🏗️ App Integration

### Complete Setup
```jsx
import AppWrapper from '../components/AppWrapper';
import ErrorBoundary from '../components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AppWrapper>
        {/* Your app components */}
      </AppWrapper>
    </ErrorBoundary>
  );
}
```

The `AppWrapper` component provides:
- Theme context
- Notification system
- Keyboard shortcuts manager
- Global error handling

## 🎨 Styling Guidelines

### Dark Mode Support
All components support dark mode through Tailwind CSS classes:
```jsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content that adapts to theme
</div>
```

### Responsive Design
Components use responsive Tailwind classes:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Responsive grid layout
</div>
```

### Accessibility
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast support
- Focus management

## 🚀 Best Practices

### Performance
- Use React.memo for expensive components
- Implement virtualization for large lists
- Lazy load components when possible
- Optimize re-renders with useCallback and useMemo

### User Experience
- Provide immediate feedback for user actions
- Use loading states for async operations
- Implement proper error handling
- Maintain consistent navigation patterns

### Accessibility
- Test with screen readers
- Ensure keyboard navigation works
- Provide alternative text for images
- Use semantic HTML elements

## 📝 Examples

See `frontend/src/examples/EnhancedFeaturesDemo.jsx` for a comprehensive demonstration of all features working together.

## 🔧 Customization

All components accept className props and can be styled with Tailwind CSS or custom CSS. The theme system automatically handles dark mode variants.

## 🐛 Troubleshooting

### Common Issues
1. **Theme not persisting**: Check localStorage permissions
2. **Shortcuts not working**: Ensure KeyboardShortcutsManager is mounted
3. **Notifications not showing**: Verify NotificationProvider wraps your app
4. **Table performance**: Consider pagination for large datasets

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'true');
```

This comprehensive feature set provides a solid foundation for building modern, accessible, and user-friendly manufacturing system interfaces.