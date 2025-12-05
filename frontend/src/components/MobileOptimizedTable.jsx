import React from 'react';
import { useTranslation } from 'react-i18next';

const MobileOptimizedTable = ({ data, columns, renderRow, onRowClick, className = '' }) => {
  const { t } = useTranslation();

  // Mobile card view
  const MobileCardView = () => (
    <div className="space-y-4 md:hidden">
      {data.map((item, index) => (
        <div
          key={item.id || index}
          onClick={() => onRowClick && onRowClick(item)}
          className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700 active:bg-slate-50 dark:active:bg-slate-700"
        >
          {columns.map((col) => (
            <div key={col.key} className="flex justify-between items-start py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
              <span className="text-sm font-medium text-secondary dark:text-slate-400">{col.label}:</span>
              <span className="text-sm text-right flex-1 ml-4 dark:text-slate-200">
                {col.render ? col.render(item[col.key], item) : item[col.key]}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  // Desktop table view
  const DesktopTableView = () => (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="p-4 font-semibold text-secondary dark:text-slate-300">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {data.map((item, index) => (
            <tr
              key={item.id || index}
              onClick={() => onRowClick && onRowClick(item)}
              className="hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              {renderRow ? (
                renderRow(item, index)
              ) : (
                columns.map((col) => (
                  <td key={col.key} className="p-4 dark:text-slate-200">
                    {col.render ? col.render(item[col.key], item) : item[col.key]}
                  </td>
                ))
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-secondary dark:text-slate-400">
        {t('common.noData')}
      </div>
    );
  }

  return (
    <div className={className}>
      <MobileCardView />
      <DesktopTableView />
    </div>
  );
};

export default MobileOptimizedTable;

