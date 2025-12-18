import { useState, useEffect } from 'react';
import { Printer, Settings } from 'lucide-react';
import { useTranslation } from '../context/I18nContext';
import Modal from './Modal';

function PrintButton({ 
  content, 
  title = 'Print Document',
  includeCharts = true,
  includeData = true,
  customStyles = ''
}) {
  const [showOptions, setShowOptions] = useState(false);
  const [printOptions, setPrintOptions] = useState({
    includeCharts: includeCharts,
    includeData: includeData,
    orientation: 'portrait',
    paperSize: 'A4',
    margins: 'normal'
  });
  const { t } = useTranslation();

  useEffect(() => {
    const handlePrintEvent = () => {
      handlePrint();
    };

    window.addEventListener('print-page', handlePrintEvent);
    return () => window.removeEventListener('print-page', handlePrintEvent);
  }, []);

  const handlePrint = () => {
    // Create print window
    const printWindow = window.open('', '_blank');
    
    // Generate print content
    const printContent = generatePrintContent();
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const generatePrintContent = () => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            @media print {
              @page {
                size: ${printOptions.paperSize} ${printOptions.orientation};
                margin: ${getPrintMargins()};
              }
              
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 12px;
                line-height: 1.4;
                color: #000;
                background: #fff;
              }
              
              .print-header {
                border-bottom: 2px solid #000;
                padding-bottom: 10px;
                margin-bottom: 20px;
              }
              
              .print-title {
                font-size: 18px;
                font-weight: bold;
                margin: 0;
              }
              
              .print-meta {
                font-size: 10px;
                color: #666;
                margin-top: 5px;
              }
              
              .print-content {
                margin-bottom: 20px;
              }
              
              .print-footer {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                border-top: 1px solid #ccc;
                padding-top: 10px;
                font-size: 10px;
                text-align: center;
                color: #666;
              }
              
              .no-print {
                display: none !important;
              }
              
              ${!printOptions.includeCharts ? '.chart, .graph, canvas, svg { display: none !important; }' : ''}
              ${!printOptions.includeData ? '.data-table, .data-grid { display: none !important; }' : ''}
              
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 15px;
              }
              
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              
              th {
                background-color: #f5f5f5;
                font-weight: bold;
              }
              
              .page-break {
                page-break-before: always;
              }
              
              ${customStyles}
            }
            
            /* Screen styles for preview */
            @media screen {
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: #f5f5f5;
              }
              
              .print-preview {
                background: white;
                padding: 40px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                min-height: 800px;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-preview">
            <div class="print-header">
              <h1 class="print-title">${title}</h1>
              <div class="print-meta">
                Generated on ${currentDate} at ${currentTime}
              </div>
            </div>
            
            <div class="print-content">
              ${content || document.querySelector('.print-content')?.innerHTML || 'No content available for printing'}
            </div>
            
            <div class="print-footer">
              Page <span class="page-number"></span> of <span class="page-count"></span>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const getPrintMargins = () => {
    switch (printOptions.margins) {
      case 'narrow': return '0.5in';
      case 'wide': return '1.5in';
      default: return '1in';
    }
  };

  const handlePrintWithOptions = () => {
    setShowOptions(false);
    handlePrint();
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          <Printer className="w-4 h-4" />
          <span>{t('common.print')}</span>
        </button>
        
        <button
          onClick={() => setShowOptions(true)}
          className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Print Options Modal */}
      <Modal
        isOpen={showOptions}
        onClose={() => setShowOptions(false)}
        title={t('print.print_options')}
      >
        <div className="space-y-4">
          {/* Content Options */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Content Options
            </h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={printOptions.includeCharts}
                  onChange={(e) => setPrintOptions({
                    ...printOptions,
                    includeCharts: e.target.checked
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {t('print.include_charts')}
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={printOptions.includeData}
                  onChange={(e) => setPrintOptions({
                    ...printOptions,
                    includeData: e.target.checked
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {t('print.include_data')}
                </span>
              </label>
            </div>
          </div>

          {/* Page Setup */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Page Setup
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t('print.page_orientation')}
                </label>
                <select
                  value={printOptions.orientation}
                  onChange={(e) => setPrintOptions({
                    ...printOptions,
                    orientation: e.target.value
                  })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="portrait">{t('print.portrait')}</option>
                  <option value="landscape">{t('print.landscape')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Paper Size
                </label>
                <select
                  value={printOptions.paperSize}
                  onChange={(e) => setPrintOptions({
                    ...printOptions,
                    paperSize: e.target.value
                  })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                  <option value="Legal">Legal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Margins */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Margins
            </label>
            <select
              value={printOptions.margins}
              onChange={(e) => setPrintOptions({
                ...printOptions,
                margins: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="narrow">Narrow (0.5")</option>
              <option value="normal">Normal (1")</option>
              <option value="wide">Wide (1.5")</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowOptions(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handlePrintWithOptions}
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
            >
              {t('print.print_ready')}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default PrintButton;