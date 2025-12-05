import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <CheckCircle size={20} className="text-green-500" />,
        error: <AlertCircle size={20} className="text-red-500" />
    };

    const bgColors = {
        success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800',
        error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
    };

    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${bgColors[type]}`}>
            {icons[type]}
            <span className="text-sm font-medium dark:text-slate-200">{message}</span>
            <button onClick={onClose} className="ml-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100">
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;
