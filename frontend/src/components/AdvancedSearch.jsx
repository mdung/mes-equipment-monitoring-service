import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, X } from 'lucide-react';

const AdvancedSearch = ({ onSearch, onFilter, filters = [], placeholder }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState({});

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...filterValues, [filterKey]: value };
    setFilterValues(newFilters);
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  const clearFilters = () => {
    setFilterValues({});
    if (onFilter) {
      onFilter({});
    }
  };

  const hasActiveFilters = Object.values(filterValues).some(v => v !== '' && v !== null && v !== undefined);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary dark:text-slate-400" size={18} />
          <input
            type="text"
            placeholder={placeholder || t('common.search')}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        {filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border dark:border-slate-700 rounded-lg flex items-center gap-2 ${
              hasActiveFilters
                ? 'bg-accent text-white border-accent'
                : 'bg-white dark:bg-slate-800 text-secondary dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Filter size={18} />
            {t('common.filter')}
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 dark:bg-slate-700 rounded text-xs">
                {Object.values(filterValues).filter(v => v !== '' && v !== null && v !== undefined).length}
              </span>
            )}
          </button>
        )}
      </div>

      {showFilters && filters.length > 0 && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">{t('filters.title')}</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-accent hover:underline flex items-center gap-1"
              >
                <X size={14} />
                {t('filters.clear')}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-xs font-medium mb-1 text-secondary dark:text-slate-400">
                  {filter.label}
                </label>
                {filter.type === 'select' ? (
                  <select
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2 border dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">{t('common.selectAll')}</option>
                    {filter.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : filter.type === 'date' ? (
                  <input
                    type="date"
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2 border dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                ) : (
                  <input
                    type="text"
                    placeholder={filter.placeholder}
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2 border dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;

