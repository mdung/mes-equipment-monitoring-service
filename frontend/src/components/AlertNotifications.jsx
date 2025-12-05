import React, { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import websocketService from '../services/websocket';

const AlertNotifications = () => {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const subscription = websocketService.subscribe('/topic/alerts', (alert) => {
            setAlerts(prev => [{ ...alert, id: Date.now() }, ...prev].slice(0, 5));
            
            // Auto-remove after 10 seconds
            setTimeout(() => {
                setAlerts(prev => prev.filter(a => a.id !== alert.id));
            }, 10000);
        });

        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, []);

    const removeAlert = (id) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    const getAlertIcon = (type) => {
        switch (type) {
            case 'ERROR':
                return <AlertCircle size={20} className="text-red-500" />;
            case 'WARNING':
                return <AlertTriangle size={20} className="text-yellow-500" />;
            case 'INFO':
                return <Info size={20} className="text-blue-500" />;
            default:
                return <Info size={20} />;
        }
    };

    const getAlertColor = (type) => {
        switch (type) {
            case 'ERROR':
                return 'bg-red-50 border-red-200';
            case 'WARNING':
                return 'bg-yellow-50 border-yellow-200';
            case 'INFO':
                return 'bg-blue-50 border-blue-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    if (alerts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
            {alerts.map((alert) => (
                <div
                    key={alert.id}
                    className={`${getAlertColor(alert.type)} border rounded-lg shadow-lg p-4 animate-slide-in`}
                >
                    <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                            <h4 className="font-semibold text-sm">{alert.title}</h4>
                            <p className="text-sm text-secondary mt-1">{alert.message}</p>
                            {alert.equipmentName && (
                                <p className="text-xs text-secondary mt-1">
                                    Equipment: {alert.equipmentName}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => removeAlert(alert.id)}
                            className="text-secondary hover:text-primary"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AlertNotifications;
