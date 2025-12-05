import React, { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff } from 'lucide-react';
import websocketService from '../../services/websocket';
import { useTranslation } from 'react-i18next';

const LiveEquipmentStatus = ({ equipmentId, equipmentName }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState(null);
  const [sensorData, setSensorData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    // Subscribe to equipment status updates
    const subscription = websocketService.subscribe('/topic/equipment-status', (update) => {
      if (update.equipmentId === equipmentId) {
        setStatus(update.status);
        setSensorData({
          temperature: update.temperature,
          vibration: update.vibration,
          outputCount: update.outputCount,
        });
        setLastUpdate(new Date(update.timestamp || Date.now()));
      }
    });

    // Check connection status
    const checkConnection = () => {
      setIsConnected(websocketService.isConnected());
    };
    checkConnection();
    const interval = setInterval(checkConnection, 1000);

    return () => {
      if (subscription) subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [equipmentId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'RUNNING': return 'bg-success';
      case 'IDLE': return 'bg-warning';
      case 'DOWN': return 'bg-danger';
      case 'MAINTENANCE': return 'bg-accent';
      default: return 'bg-secondary';
    }
  };

  const getStatusPulse = (status) => {
    return status === 'RUNNING' ? 'animate-pulse' : '';
  };

  if (!status) {
    return (
      <div className="flex items-center gap-2 text-secondary dark:text-slate-400">
        <WifiOff size={16} />
        <span className="text-sm">Waiting for status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(status)} ${getStatusPulse(status)}`}></div>
          <span className="font-medium dark:text-slate-200">{equipmentName || `Equipment ${equipmentId}`}</span>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi size={14} className="text-success" />
          ) : (
            <WifiOff size={14} className="text-danger" />
          )}
          {lastUpdate && (
            <span className="text-xs text-secondary dark:text-slate-400">
              {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {sensorData && (
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
            <div className="text-secondary dark:text-slate-400">Temp</div>
            <div className="font-semibold dark:text-slate-200">{sensorData.temperature?.toFixed(1) || 'N/A'}°C</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
            <div className="text-secondary dark:text-slate-400">Vibration</div>
            <div className="font-semibold dark:text-slate-200">{sensorData.vibration?.toFixed(2) || 'N/A'} mm/s</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
            <div className="text-secondary dark:text-slate-400">Output</div>
            <div className="font-semibold dark:text-slate-200">{sensorData.outputCount || 0}</div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 text-xs text-secondary dark:text-slate-400">
        <Activity size={12} />
        <span>Live Status: {status}</span>
      </div>
    </div>
  );
};

export default LiveEquipmentStatus;

