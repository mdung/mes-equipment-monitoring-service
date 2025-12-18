import { useState } from 'react';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
import { useNotifications } from '../components/NotificationSystem';
import { useTheme } from '../context/ThemeContext';
import DataTable from '../components/DataTable';
import LoadingSpinner, { LoadingOverlay, ButtonSpinner } from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';
import useLocalStorage from '../hooks/useLocalStorage';
import usePerformanceMonitor from '../hooks/usePerformanceMonitor';

function EnhancedFeaturesDemo() {
  const { success, error, warning, info } = useNotifications();
  const { isDark, themeMode, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState(generateSampleData());
  const [preferences, setPreferences] = useLocalStorage('demo-preferences', {
    autoRefresh: true,
    notifications: true
  });
  
  // Performance monitoring
  usePerformanceMonitor('EnhancedFeaturesDemo');

  // Sample data generator
  function generateSampleData() {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `Equipment ${i + 1}`,
      status: ['active', 'maintenance', 'inactive'][Math.floor(Math.random() * 3)],
      lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      cost: Math.floor(Math.random() * 10000) + 1000,
      location: `Building ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`
    }));
  }

  // Table configuration
  const columns = [
    { key: 'name', label: 'Equipment Name', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'lastMaintenance', label: 'Last Maintenance', type: 'date', sortable: true },
    { key: 'cost', label: 'Cost', type: 'currency', sortable: true },
    { key: 'location', label: 'Location', sortable: true }
  ];

  const actions = [
    {
      icon: Eye,
      label: 'View',
      handler: (row) => info(`Viewing ${row.name}`)
    },
    {
      icon: Edit,
      label: 'Edit',
      handler: (row) => warning(`Editing ${row.name}`)
    },
    {
      icon: Trash2,
      label: 'Delete',
      handler: (row) => error(`Deleting ${row.name}`, { duration: 3000 }),
      className: 'text-red-600 hover:text-red-800'
    }
  ];

  const searchFields = [
    { value: 'name', label: 'Equipment Name' },
    { value: 'location', label: 'Location' },
    { value: 'status', label: 'Status' }
  ];

  const filterOptions = {
    status: {
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'inactive', label: 'Inactive' }
      ]
    },
    location: {
      label: 'Location',
      type: 'multiselect',
      options: [
        { value: 'Building A', label: 'Building A' },
        { value: 'Building B', label: 'Building B' },
        { value: 'Building C', label: 'Building C' }
      ]
    },
    costRange: {
      label: 'Min Cost',
      type: 'number',
      placeholder: 'Enter minimum cost'
    }
  };

  // Event handlers
  const handleSearch = (searchParams) => {
    console.log('Search params:', searchParams);
    success('Search applied successfully');
  };

  const handleBulkDelete = async (selectedItems) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTableData(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setLoading(false);
    success(`Deleted ${selectedItems.length} items`);
  };

  const handleBulkExport = async (selectedItems, format) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    success(`Exported ${selectedItems.length} items as ${format.toUpperCase()}`);
  };

  const handleRowClick = (row) => {
    info(`Clicked on ${row.name}`);
  };

  const simulateError = () => {
    throw new Error('This is a simulated error for testing the ErrorBoundary');
  };

  return (
    <ErrorBoundary showDetails={true}>
      <div className="p-6 space-y-6">
        <LoadingOverlay visible={loading} message="Processing your request..." />
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Enhanced Features Demo
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Demonstrating all the advanced UI features
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Theme: {themeMode} ({isDark ? 'Dark' : 'Light'})
            </div>
            <button
              onClick={() => setTheme(themeMode === 'dark' ? 'light' : 'dark')}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Toggle Theme
            </button>
          </div>
        </div>

        {/* Notification Demo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Notification System Demo
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => success('Operation completed successfully!')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Success
            </button>
            <button
              onClick={() => error('Something went wrong!', { duration: 0 })}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Error
            </button>
            <button
              onClick={() => warning('Please check your input')}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Warning
            </button>
            <button
              onClick={() => info('Here\'s some helpful information', {
                actions: [
                  { label: 'Learn More', handler: () => console.log('Learn more clicked') }
                ]
              })}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Info with Action
            </button>
          </div>
        </div>

        {/* Loading States Demo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Loading States Demo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Spinner</h3>
              <LoadingSpinner message="Loading..." />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Dots</h3>
              <LoadingSpinner variant="dots" message="Processing..." />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Progress</h3>
              <LoadingSpinner variant="progress" message="Uploading files..." />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Skeleton</h3>
              <LoadingSpinner variant="skeleton" />
            </div>
          </div>
        </div>

        {/* Preferences Demo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Local Storage Preferences
          </h2>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.autoRefresh}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  autoRefresh: e.target.checked
                }))}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">Auto-refresh data</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.notifications}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  notifications: e.target.checked
                }))}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">Enable notifications</span>
            </label>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Preferences are automatically saved to localStorage
            </div>
          </div>
        </div>

        {/* Error Boundary Demo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Error Boundary Demo
          </h2>
          <button
            onClick={simulateError}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Trigger Error (Test Error Boundary)
          </button>
        </div>

        {/* Advanced Data Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Advanced Data Table
            </h2>
            <button
              onClick={() => setTableData(generateSampleData())}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Refresh Data</span>
            </button>
          </div>
          
          <DataTable
            data={tableData}
            columns={columns}
            actions={actions}
            searchFields={searchFields}
            filterOptions={filterOptions}
            onSearch={handleSearch}
            onBulkDelete={handleBulkDelete}
            onBulkExport={handleBulkExport}
            onRowClick={handleRowClick}
          />
        </div>

        {/* Keyboard Shortcuts Info */}
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Keyboard Shortcuts Available:
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <div><kbd className="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded">Ctrl+K</kbd> - Focus search</div>
            <div><kbd className="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded">Ctrl+?</kbd> - Show shortcuts help</div>
            <div><kbd className="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded">Ctrl+S</kbd> - Save (if save button present)</div>
            <div><kbd className="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded">Esc</kbd> - Close modals</div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default EnhancedFeaturesDemo;