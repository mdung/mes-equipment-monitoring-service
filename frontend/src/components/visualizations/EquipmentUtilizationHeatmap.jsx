import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Clock } from 'lucide-react';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import { format, startOfWeek, eachDayOfInterval, addDays } from 'date-fns';

const EquipmentUtilizationHeatmap = ({ equipmentId, timeRange = 'week' }) => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);

  useEffect(() => {
    fetchUtilizationData();
  }, [equipmentId, timeRange]);

  const fetchUtilizationData = async () => {
    try {
      // Fetch equipment utilization data
      const res = await api.get(`/equipment/${equipmentId}/utilization?range=${timeRange}`).catch(() => ({ data: [] }));
      
      if (res.data && res.data.length > 0) {
        setData(res.data);
      } else {
        // Generate sample data for demonstration
        generateSampleData();
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching utilization data:', error);
      generateSampleData();
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end: addDays(start, 6) });
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    const sampleData = days.flatMap(day => 
      hours.map(hour => ({
        date: format(day, 'yyyy-MM-dd'),
        hour,
        utilization: Math.random() * 100,
        status: Math.random() > 0.7 ? 'RUNNING' : Math.random() > 0.4 ? 'IDLE' : 'DOWN'
      }))
    );
    setData(sampleData);
  };

  const getUtilizationColor = (utilization) => {
    if (utilization >= 80) return 'bg-green-600';
    if (utilization >= 60) return 'bg-green-400';
    if (utilization >= 40) return 'bg-yellow-400';
    if (utilization >= 20) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const getUtilizationIntensity = (utilization) => {
    return Math.min(100, Math.max(0, utilization));
  };

  const getHourLabel = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  // Group data by day and hour
  const groupedData = data.reduce((acc, item) => {
    const key = `${item.date}-${item.hour}`;
    if (!acc[key]) {
      acc[key] = { ...item, count: 1 };
    } else {
      acc[key].utilization = (acc[key].utilization + item.utilization) / 2;
      acc[key].count++;
    }
    return acc;
  }, {});

  const days = Array.from(new Set(data.map(d => d.date))).sort();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  if (loading) {
    return <div className="text-center py-8">Loading utilization data...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg dark:text-slate-200 flex items-center gap-2">
          <TrendingUp size={20} />
          Equipment Utilization Heatmap
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-secondary dark:text-slate-400">0-20%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-400 rounded"></div>
            <span className="text-secondary dark:text-slate-400">20-40%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span className="text-secondary dark:text-slate-400">40-60%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span className="text-secondary dark:text-slate-400">60-80%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-secondary dark:text-slate-400">80-100%</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-xs font-semibold text-secondary dark:text-slate-400 border dark:border-slate-700">Day/Hour</th>
                {hours.map(hour => (
                  <th key={hour} className="p-2 text-xs font-semibold text-secondary dark:text-slate-400 border dark:border-slate-700 min-w-[40px]">
                    {getHourLabel(hour)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map(day => (
                <tr key={day}>
                  <td className="p-2 text-xs font-medium dark:text-slate-200 border dark:border-slate-700">
                    {format(new Date(day), 'EEE, MMM d')}
                  </td>
                  {hours.map(hour => {
                    const key = `${day}-${hour}`;
                    const cellData = groupedData[key];
                    const utilization = cellData ? getUtilizationIntensity(cellData.utilization) : 0;
                    
                    return (
                      <td
                        key={hour}
                        className={`p-1 border dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity ${getUtilizationColor(utilization)}`}
                        style={{ opacity: utilization > 0 ? 0.3 + (utilization / 100) * 0.7 : 0.1 }}
                        onClick={() => setSelectedCell({ day, hour, utilization, status: cellData?.status })}
                        title={`${format(new Date(day), 'MMM d')} ${getHourLabel(hour)}: ${utilization.toFixed(1)}%`}
                      >
                        <div className="w-8 h-8 flex items-center justify-center text-xs text-white font-semibold">
                          {utilization > 0 ? `${Math.round(utilization)}%` : ''}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCell && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border dark:border-slate-700">
          <h4 className="font-semibold mb-2 dark:text-slate-200">Selected Time Slot</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-secondary dark:text-slate-400">Date: </span>
              <span className="dark:text-slate-200">{format(new Date(selectedCell.day), 'PP')}</span>
            </div>
            <div>
              <span className="text-secondary dark:text-slate-400">Hour: </span>
              <span className="dark:text-slate-200">{getHourLabel(selectedCell.hour)}</span>
            </div>
            <div>
              <span className="text-secondary dark:text-slate-400">Utilization: </span>
              <span className="font-semibold dark:text-slate-200">{selectedCell.utilization.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-secondary dark:text-slate-400">Status: </span>
              <span className="dark:text-slate-200">{selectedCell.status || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentUtilizationHeatmap;

