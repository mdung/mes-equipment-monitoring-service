import { useState } from 'react';
import { Trash2, Download, Edit, Check, X, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../context/I18nContext';
import Modal from './Modal';

function BulkOperations({ 
  selectedItems = [], 
  onSelectAll, 
  onClearSelection, 
  onBulkDelete, 
  onBulkExport, 
  onBulkUpdate,
  totalItems = 0,
  customActions = []
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateFields, setUpdateFields] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const { t } = useTranslation();

  const selectedCount = selectedItems.length;
  const isAllSelected = selectedCount === totalItems && totalItems > 0;

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    try {
      await onBulkDelete?.(selectedItems);
      setShowDeleteConfirm(false);
      onClearSelection?.();
    } catch (error) {
      console.error('Bulk delete failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkExport = async (format = 'csv') => {
    setIsProcessing(true);
    try {
      await onBulkExport?.(selectedItems, format);
    } catch (error) {
      console.error('Bulk export failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkUpdate = async () => {
    setIsProcessing(true);
    try {
      await onBulkUpdate?.(selectedItems, updateFields);
      setShowUpdateModal(false);
      setUpdateFields({});
      onClearSelection?.();
    } catch (error) {
      console.error('Bulk update failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedCount === 0) {
    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={(e) => e.target.checked ? onSelectAll?.() : onClearSelection?.()}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              {t('common.select_all')}
            </span>
          </label>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {t('bulk_operations.select_items')}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900 border-b border-blue-200 dark:border-blue-700">
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={(e) => e.target.checked ? onSelectAll?.() : onClearSelection?.()}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-medium text-blue-900 dark:text-blue-100">
              {t('common.selected_items', { count: selectedCount })}
            </span>
          </label>
          
          <button
            onClick={onClearSelection}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            {t('common.clear_all')}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Export Actions */}
          <div className="relative group">
            <button
              disabled={isProcessing}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{t('bulk_operations.export_selected')}</span>
            </button>
            
            {/* Export Dropdown */}
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => handleBulkExport('csv')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              >
                Export as CSV
              </button>
              <button
                onClick={() => handleBulkExport('excel')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              >
                Export as Excel
              </button>
              <button
                onClick={() => handleBulkExport('pdf')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              >
                Export as PDF
              </button>
            </div>
          </div>

          {/* Update Action */}
          {onBulkUpdate && (
            <button
              onClick={() => setShowUpdateModal(true)}
              disabled={isProcessing}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              <Edit className="w-4 h-4" />
              <span>{t('bulk_operations.update_selected')}</span>
            </button>
          )}

          {/* Custom Actions */}
          {customActions.map((action, index) => (
            <button
              key={index}
              onClick={() => action.handler(selectedItems)}
              disabled={isProcessing}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              {action.icon && <action.icon className="w-4 h-4" />}
              <span>{action.label}</span>
            </button>
          ))}

          {/* Delete Action */}
          {onBulkDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isProcessing}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('bulk_operations.delete_selected')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Bulk Delete"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <p className="text-gray-700 dark:text-gray-300">
              {t('bulk_operations.confirm_delete', { count: selectedCount })}
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isProcessing ? t('common.loading') : t('common.delete')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Update Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title="Bulk Update"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Update {selectedCount} selected items
          </p>
          
          {/* Update fields would be dynamic based on the entity type */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={updateFields.status || ''}
                onChange={(e) => setUpdateFields({ ...updateFields, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">No change</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={updateFields.priority || ''}
                onChange={(e) => setUpdateFields({ ...updateFields, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">No change</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowUpdateModal(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleBulkUpdate}
              disabled={isProcessing}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isProcessing ? t('common.loading') : t('common.update')}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default BulkOperations;