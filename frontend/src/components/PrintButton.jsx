import React from 'react';
import { useTranslation } from 'react-i18next';
import { Printer } from 'lucide-react';

const PrintButton = ({ className = '' }) => {
  const { t } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className={`px-3 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 ${className}`}
    >
      <Printer size={16} />
      {t('common.print')}
    </button>
  );
};

export default PrintButton;

