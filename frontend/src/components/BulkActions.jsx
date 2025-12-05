import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Edit, Download, X } from 'lucide-react';

const BulkActions = ({ selectedItems, onDelete, onUpdate, onExport, onClear, customActions = [] }) => {
  const { t } = useTranslation();
  const count = selectedItems.length;

  if (count === 0) return null;

  const handleDelete = () => {
    if (window.confirm(t('bulkOperations.confirmDelete', { count }))) {
      onDelete(selectedItems);
    }
  };

  return (
    <div className="bg-accent/10 dark:bg-accent/20 border border-accent/30 dark:border-accent/40 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-medium text-sm">
            {t('bulkOperations.selected', { count })}
          </span>
          <div className="flex gap-2">
            {onDelete && (
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 bg-danger text-white rounded-md text-sm hover:bg-danger/90 flex items-center gap-1.5"
              >
                <Trash2 size={16} />
                {t('bulkOperations.deleteSelected')}
              </button>
            )}
            {onUpdate && (
              <button
                onClick={() => onUpdate(selectedItems)}
                className="px-3 py-1.5 bg-accent text-white rounded-md text-sm hover:bg-accent/90 flex items-center gap-1.5"
              >
                <Edit size={16} />
                {t('bulkOperations.updateSelected')}
              </button>
            )}
            {onExport && (
              <button
                onClick={() => onExport(selectedItems)}
                className="px-3 py-1.5 bg-success text-white rounded-md text-sm hover:bg-success/90 flex items-center gap-1.5"
              >
                <Download size={16} />
                {t('bulkOperations.exportSelected')}
              </button>
            )}
            {customActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => action.onClick(selectedItems)}
                  className={`px-3 py-1.5 ${action.className || 'bg-accent'} text-white rounded-md text-sm hover:opacity-90 flex items-center gap-1.5`}
                >
                  {Icon && <Icon size={16} />}
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
        <button
          onClick={onClear}
          className="p-1.5 text-secondary dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default BulkActions;

