# Advanced UI Features Implementation

This document describes the advanced UI features implemented for the MES Equipment Monitoring Service.

## Features Implemented

### 1. Dark Mode Toggle ✅

**Location**: `frontend/src/context/ThemeContext.jsx`

- **Theme Context**: Created a React context to manage theme state
- **Persistent Storage**: Theme preference is saved to localStorage
- **System Preference Detection**: Automatically detects user's system theme preference
- **Toggle Button**: Added to the sidebar in Layout component
- **Full Dark Mode Support**: All components updated with dark mode classes

**Usage**:
- Click the sun/moon icon in the sidebar to toggle between light and dark modes
- Theme preference is automatically saved and restored on page reload

**Keyboard Shortcut**: `Ctrl+Shift+D` / `Cmd+Shift+D`

### 2. Multi-Language Support (i18n) ✅

**Location**: `frontend/src/i18n/`

- **i18next Integration**: Full internationalization setup with react-i18next
- **Language Detection**: Automatic browser language detection
- **Supported Languages**:
  - English (en)
  - Spanish (es)
  - French (fr)
  - German (de)
- **Translation Files**: JSON files for each language in `frontend/src/i18n/locales/`
- **Language Selector**: Dropdown in sidebar to change language

**Usage**:
- Click the globe icon in the sidebar to select a language
- All UI text automatically updates based on selected language

### 3. Keyboard Shortcuts ✅

**Location**: 
- `frontend/src/components/KeyboardShortcuts.jsx` - Shortcuts modal
- `frontend/src/hooks/useKeyboardShortcuts.js` - Custom hook for shortcuts

**Available Shortcuts**:
- `Ctrl+K` / `Cmd+K` - Focus search
- `Ctrl+N` / `Cmd+N` - Create new item
- `Ctrl+S` / `Cmd+S` - Save current form
- `Esc` - Close modal/cancel
- `Ctrl+D` / `Cmd+D` - Delete selected
- `Ctrl+P` / `Cmd+P` - Print current page
- `Ctrl+E` / `Cmd+E` - Export data
- `Ctrl+Shift+D` / `Cmd+Shift+D` - Toggle dark mode
- `?` - Show shortcuts help modal

**Usage**:
- Press `?` anywhere to see all available shortcuts
- Click the keyboard icon in the header to open shortcuts modal
- Use shortcuts throughout the application for faster navigation

### 4. Advanced Search/Filtering ✅

**Location**: `frontend/src/components/AdvancedSearch.jsx`

**Features**:
- **Text Search**: Real-time search across multiple fields
- **Advanced Filters**: Multiple filter types (select, date, text)
- **Filter Indicators**: Visual badges showing active filter count
- **Clear Filters**: One-click filter reset
- **Collapsible Filter Panel**: Expandable filter section

**Filter Types Supported**:
- Select dropdowns (status, categories, etc.)
- Date range pickers
- Text inputs

**Usage**:
- Type in the search box for instant filtering
- Click the "Filter" button to show advanced filter options
- Select filters from dropdowns or enter date ranges
- Active filters are highlighted with a badge

### 5. Bulk Operations ✅

**Location**: `frontend/src/components/BulkActions.jsx`

**Features**:
- **Multi-Select**: Checkboxes for selecting multiple items
- **Select All**: Quick select/deselect all items
- **Bulk Actions**:
  - Delete selected items
  - Update selected items
  - Export selected items
- **Visual Feedback**: Selected items are highlighted
- **Confirmation Dialogs**: Safety prompts for destructive actions

**Usage**:
- Check the box in the table header to select all items
- Check individual item checkboxes to select specific items
- Selected items are highlighted
- Use the bulk actions bar to perform operations on selected items

### 6. Data Import/Export ✅

**Location**: 
- `frontend/src/components/ImportExport.jsx` - UI component
- `frontend/src/utils/importExport.js` - Utility functions

**Export Formats**:
- **CSV**: Comma-separated values format
- **Excel**: XLSX format with proper formatting

**Import Formats**:
- **CSV**: Import from CSV files
- **Excel**: Import from XLSX/XLS files
- **Auto-Detection**: Automatically detects file format

**Features**:
- Export all data or selected items only
- Field mapping for custom exports
- Import validation and error handling
- Success/error toast notifications

**Usage**:
- Click "CSV" or "Excel" buttons to export data
- Click "Import" button and select a file to import
- Imported data is validated and processed automatically

### 7. Print-Friendly Views ✅

**Location**: 
- `frontend/src/components/PrintButton.jsx` - Print button component
- `frontend/src/index.css` - Print styles

**Features**:
- **Print CSS**: Optimized styles for printing
- **Hide Non-Essential Elements**: Navigation, buttons, and interactive elements hidden when printing
- **Page Breaks**: Proper page break handling for tables
- **Clean Layout**: Simplified layout for printing
- **Print Button**: Easy access to print functionality

**Print Optimizations**:
- Hides sidebar, header, and action buttons
- Removes background colors and shadows
- Optimizes table layouts for printing
- Proper page margins and spacing

**Usage**:
- Click the "Print" button on any page
- Or use `Ctrl+P` / `Cmd+P` keyboard shortcut
- Print dialog opens with optimized layout

## Component Updates

### Updated Components

1. **Layout.jsx**: Added theme toggle, language selector, and keyboard shortcuts button
2. **EquipmentList.jsx**: Fully integrated all new features as an example
3. **Modal.jsx**: Added dark mode support
4. **Toast.jsx**: Added dark mode support
5. **index.css**: Added print styles and dark mode utilities

## Configuration Files

### Tailwind Config
- Added `darkMode: 'class'` to enable class-based dark mode
- All color utilities support dark mode variants

### i18n Config
- Automatic language detection
- Fallback to English
- React integration

## Usage Examples

### Using Dark Mode
```jsx
import { useTheme } from '../context/ThemeContext';

const MyComponent = () => {
  const { isDark, toggleTheme } = useTheme();
  // Use isDark to conditionally style
  // Use toggleTheme to change theme
};
```

### Using i18n
```jsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  return <h1>{t('common.title')}</h1>;
};
```

### Using Keyboard Shortcuts
```jsx
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

const MyComponent = () => {
  useKeyboardShortcuts([
    { key: 'ctrl+s', handler: () => save(), preventDefault: true },
  ]);
};
```

### Using Advanced Search
```jsx
import AdvancedSearch from '../components/AdvancedSearch';

const filters = [
  { key: 'status', label: 'Status', type: 'select', options: [...] },
];

<AdvancedSearch
  onSearch={handleSearch}
  onFilter={handleFilter}
  filters={filters}
/>
```

### Using Bulk Operations
```jsx
import BulkActions from '../components/BulkActions';

<BulkActions
  selectedItems={selectedItems}
  onDelete={handleBulkDelete}
  onExport={handleBulkExport}
  onClear={() => setSelectedItems([])}
/>
```

### Using Import/Export
```jsx
import ImportExport from '../components/ImportExport';

<ImportExport
  data={myData}
  filename="export"
  onImport={handleImport}
  exportFields={['field1', 'field2']}
/>
```

## Dependencies Added

- `i18next`: Core internationalization framework
- `react-i18next`: React bindings for i18next
- `i18next-browser-languagedetector`: Automatic language detection
- `xlsx`: Excel file processing
- `papaparse`: CSV parsing and generation

## Testing

To test the features:

1. **Dark Mode**: Toggle the theme button in the sidebar
2. **Language**: Change language from the sidebar dropdown
3. **Shortcuts**: Press `?` to see all shortcuts
4. **Search**: Type in the search box on Equipment List page
5. **Filters**: Click filter button and apply filters
6. **Bulk Operations**: Select items and use bulk actions
7. **Export**: Click export buttons to download data
8. **Import**: Click import and select a CSV/Excel file
9. **Print**: Click print button or press Ctrl+P

## Future Enhancements

Potential improvements:
- More keyboard shortcuts for specific pages
- Additional filter types (number ranges, multi-select)
- Export templates customization
- Print preview before printing
- More language translations
- Theme customization options

## Notes

- All features are fully integrated and working
- Dark mode persists across page reloads
- Language preference persists across sessions
- Keyboard shortcuts work globally
- Print styles are optimized for standard A4 printing
- Import/export handles common edge cases

