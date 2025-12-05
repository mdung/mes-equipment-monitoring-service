import React, { useState, useEffect } from 'react';
import { TrendingUp, Package, Target } from 'lucide-react';
import websocketService from '../../services/websocket';
import { useTranslation } from 'react-i18next';

const RealTimeProductionCounter = ({ orderId, initialQuantity = 0, targetQuantity = 0 }) => {
  const { t } = useTranslation();
  const [producedQuantity, setProducedQuantity] = useState(initialQuantity);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [trend, setTrend] = useState(0); // Positive or negative change

  useEffect(() => {
    // Subscribe to production metrics updates
    const subscription = websocketService.subscribe('/topic/production-metrics', (update) => {
      if (update.orderId === orderId) {
        const oldQuantity = producedQuantity;
        const newQuantity = update.producedQuantity || 0;
        setProducedQuantity(newQuantity);
        setTrend(newQuantity - oldQuantity);
        setLastUpdate(new Date());
        
        // Clear trend indicator after 3 seconds
        setTimeout(() => setTrend(0), 3000);
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
  }, [orderId, producedQuantity]);

  const progressPercentage = targetQuantity > 0 
    ? Math.min((producedQuantity / targetQuantity) * 100, 100) 
    : 0;

  const remaining = Math.max(0, targetQuantity - producedQuantity);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package size={20} className="text-accent" />
          <span className="font-semibold dark:text-slate-200">Production Counter</span>
        </div>
        {isConnected && (
          <div className="flex items-center gap-1 text-xs text-success">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-accent dark:text-accent">
            {producedQuantity.toLocaleString()}
            {trend > 0 && (
              <span className="ml-2 text-success text-lg animate-pulse">+{trend}</span>
            )}
          </div>
          <div className="text-xs text-secondary dark:text-slate-400 mt-1">Produced</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold dark:text-slate-200">{targetQuantity.toLocaleString()}</div>
          <div className="text-xs text-secondary dark:text-slate-400 mt-1">Target</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-warning dark:text-warning">{remaining.toLocaleString()}</div>
          <div className="text-xs text-secondary dark:text-slate-400 mt-1">Remaining</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary dark:text-slate-400">Progress</span>
          <span className="font-semibold dark:text-slate-200">{progressPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-accent h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
            style={{ width: `${progressPercentage}%` }}
          >
            {progressPercentage > 10 && (
              <Target size={12} className="text-white" />
            )}
          </div>
        </div>
      </div>

      {lastUpdate && (
        <div className="text-xs text-secondary dark:text-slate-400 text-center">
          Last update: {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      {trend > 0 && (
        <div className="flex items-center justify-center gap-1 text-success text-sm animate-pulse">
          <TrendingUp size={16} />
          <span>+{trend} units produced</span>
        </div>
      )}
    </div>
  );
};

export default RealTimeProductionCounter;

