import * as XLSX from 'xlsx';
import Papa from 'papaparse';

/**
 * Export data to CSV
 */
export const exportToCSV = (data, filename = 'export') => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data to Excel
 */
export const exportToExcel = (data, filename = 'export', sheetName = 'Sheet1') => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * Import data from CSV file
 */
export const importFromCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

/**
 * Import data from Excel file
 */
export const importFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Generic import function that detects file type
 */
export const importData = async (file) => {
  const extension = file.name.split('.').pop().toLowerCase();
  
  if (extension === 'csv') {
    return await importFromCSV(file);
  } else if (extension === 'xlsx' || extension === 'xls') {
    return await importFromExcel(file);
  } else {
    throw new Error('Unsupported file format. Please use CSV or Excel files.');
  }
};

