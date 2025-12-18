import { useState, useRef } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useTranslation } from '../context/I18nContext';
import Modal from './Modal';

function ImportExport({ 
  onImport, 
  onExport, 
  supportedFormats = ['csv', 'excel'], 
  templateUrl,
  entityType = 'data'
}) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importFormat, setImportFormat] = useState('csv');
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportOptions, setExportOptions] = useState({
    includeHeaders: true,
    dateRange: { from: '', to: '' },
    filters: {}
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);
  const { t } = useTranslation();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImportFile(file);
      // Auto-detect format from file extension
      const extension = file.name.split('.').pop().toLowerCase();
      if (supportedFormats.includes(extension)) {
        setImportFormat(extension);
      }
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setIsProcessing(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('format', importFormat);

      const result = await onImport?.(formData);
      setImportResult({
        success: true,
        message: result.message || t('import_export.import_success'),
        stats: result.stats
      });
      
      // Reset form
      setImportFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: error.message || t('import_export.import_error'),
        errors: error.errors
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    setIsProcessing(true);

    try {
      const exportParams = {
        format: exportFormat,
        options: exportOptions
      };

      await onExport?.(exportParams);
      setShowExportModal(false);
      setImportResult({
        success: true,
        message: t('import_export.export_success')
      });
    } catch (error) {
      setImportResult({
        success: false,
        message: error.message || t('import_export.export_error')
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    if (templateUrl) {
      const link = document.createElement('a');
      link.href = templateUrl;
      link.download = `${entityType}_template.${importFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Upload className="w-4 h-4" />
          <span>{t('import_export.import_data')}</span>
        </button>
        
        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Download className="w-4 h-4" />
          <span>{t('import_export.export_data')}</span>
        </button>
      </div>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title={t('import_export.import_data')}
      >
        <div className="space-y-4">
          {/* File Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('import_export.select_file')}
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept=".csv,.xlsx,.xls"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Click to select file or drag and drop
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {t('import_export.supported_formats')}
                </span>
              </label>
            </div>
            
            {importFile && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {importFile.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({(importFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('import_export.file_format')}
            </label>
            <select
              value={importFormat}
              onChange={(e) => setImportFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {supportedFormats.map((format) => (
                <option key={format} value={format}>
                  {format.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Template Download */}
          {templateUrl && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800 dark:text-blue-200">
                  Need a template?
                </span>
                <button
                  onClick={downloadTemplate}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                >
                  {t('import_export.download_template')}
                </button>
              </div>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className={`p-3 rounded-md ${
              importResult.success 
                ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200' 
                : 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {importResult.success ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-sm">{importResult.message}</span>
              </div>
              
              {importResult.stats && (
                <div className="mt-2 text-xs">
                  <div>Imported: {importResult.stats.imported}</div>
                  <div>Skipped: {importResult.stats.skipped}</div>
                  <div>Errors: {importResult.stats.errors}</div>
                </div>
              )}
              
              {importResult.errors && (
                <div className="mt-2 text-xs">
                  <div className="font-medium">Errors:</div>
                  <ul className="list-disc list-inside">
                    {importResult.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                  {importResult.errors.length > 5 && (
                    <div>... and {importResult.errors.length - 5} more</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowImportModal(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleImport}
              disabled={!importFile || isProcessing}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isProcessing ? t('common.loading') : t('common.import')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title={t('import_export.export_data')}
      >
        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('import_export.file_format')}
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="pdf">PDF</option>
            </select>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeHeaders}
                onChange={(e) => setExportOptions({
                  ...exportOptions,
                  includeHeaders: e.target.checked
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Include column headers
              </span>
            </label>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('search.date_range')} (Optional)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                value={exportOptions.dateRange.from}
                onChange={(e) => setExportOptions({
                  ...exportOptions,
                  dateRange: { ...exportOptions.dateRange, from: e.target.value }
                })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <input
                type="date"
                value={exportOptions.dateRange.to}
                onChange={(e) => setExportOptions({
                  ...exportOptions,
                  dateRange: { ...exportOptions.dateRange, to: e.target.value }
                })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowExportModal(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleExport}
              disabled={isProcessing}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isProcessing ? t('common.loading') : t('common.export')}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ImportExport;