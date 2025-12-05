import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { exportToCSV, exportToExcel, importData } from '../utils/importExport';
import Toast from './Toast';

const ImportExport = ({ data, filename, onImport, exportFields }) => {
  const { t } = useTranslation();
  const [toast, setToast] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = (format) => {
    try {
      // Prepare data for export
      let exportData = data;
      if (exportFields && Array.isArray(exportFields)) {
        exportData = data.map(item => {
          const filtered = {};
          exportFields.forEach(field => {
            if (typeof field === 'string') {
              filtered[field] = item[field];
            } else if (typeof field === 'object' && field.key) {
              filtered[field.label || field.key] = item[field.key];
            }
          });
          return filtered;
        });
      }

      if (format === 'csv') {
        exportToCSV(exportData, filename || 'export');
      } else if (format === 'excel') {
        exportToExcel(exportData, filename || 'export');
      }
      showToast(t('importExport.exportSuccess'));
    } catch (error) {
      console.error('Export error:', error);
      showToast(error.message || t('importExport.exportError'), 'error');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const importedData = await importData(file);
      if (onImport) {
        await onImport(importedData);
      }
      showToast(t('importExport.importSuccess'));
    } catch (error) {
      console.error('Import error:', error);
      showToast(error.message || t('importExport.importError'), 'error');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="flex gap-2">
        {/* Export Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="px-3 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
            disabled={!data || data.length === 0}
          >
            <FileText size={16} />
            {t('importExport.csv')}
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="px-3 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
            disabled={!data || data.length === 0}
          >
            <FileSpreadsheet size={16} />
            {t('importExport.excel')}
          </button>
        </div>

        {/* Import Button */}
        <label className="px-3 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/90 cursor-pointer flex items-center gap-2">
          <Upload size={16} />
          {isImporting ? t('common.loading') : t('importExport.import')}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleImport}
            className="hidden"
            disabled={isImporting}
          />
        </label>
      </div>
    </>
  );
};

export default ImportExport;

