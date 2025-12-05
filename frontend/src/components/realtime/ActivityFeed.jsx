import React, { useState, useEffect } from 'react';
import { Activity, Clock, User, Package, Settings, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import websocketService from '../../services/websocket';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import { format, formatDistanceToNow } from 'date-fns';

const ActivityFeed = ({ filter = 'ALL', limit = 50 }) => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();

    // Subscribe to real-time activity updates
    const subscription = websocketService.subscribe('/topic/activities', (activity) => {
      setActivities(prev => [activity, ...prev].slice(0, limit));
    });

    const checkConnection = () => {
      setIsConnected(websocketService.isConnected());
    };
    checkConnection();
    const interval = setInterval(checkConnection, 1000);

    return () => {
      if (subscription) subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [limit]);

  const loadActivities = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'ALL') params.append('type', filter);
      params.append('limit', limit.toString());
      
      const res = await api.get(`/activities?${params.toString()}`).catch(() => ({ data: [] }));
      setActivities(res.data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'EQUIPMENT':
        return <Settings size={16} className="text-accent" />;
      case 'PRODUCTION':
        return <Package size={16} className="text-success" />;
      case 'ALERT':
        return <AlertTriangle size={16} className="text-danger" />;
      case 'QUALITY':
        return <CheckCircle size={16} className="text-success" />;
      case 'MAINTENANCE':
        return <Settings size={16} className="text-warning" />;
      default:
        return <Activity size={16} className="text-secondary" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'EQUIPMENT':
        return 'bg-accent/10 border-accent/20';
      case 'PRODUCTION':
        return 'bg-success/10 border-success/20';
      case 'ALERT':
        return 'bg-danger/10 border-danger/20';
      case 'QUALITY':
        return 'bg-success/10 border-success/20';
      case 'MAINTENANCE':
        return 'bg-warning/10 border-warning/20';
      default:
        return 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700';
    }
  };

  const formatActivityTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMinutes = (now - date) / (1000 * 60);
      
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${Math.floor(diffMinutes)}m ago`;
      if (diffMinutes < 1440) return formatDistanceToNow(date, { addSuffix: true });
      return format(date, 'MMM d, HH:mm');
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-secondary dark:text-slate-400">
        Loading activities...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg dark:text-slate-200 flex items-center gap-2">
          <Activity size={20} />
          Activity Feed
        </h3>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-1 text-xs text-success">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-danger">
              <div className="w-2 h-2 bg-danger rounded-full"></div>
              <span>Offline</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-secondary dark:text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
            <Activity size={48} className="mx-auto mb-2 text-slate-400" />
            <p>No activities yet</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div
              key={activity.id || index}
              className={`p-3 rounded-lg border ${getActivityColor(activity.type || activity.activityType)} flex items-start gap-3`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type || activity.activityType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium dark:text-slate-200">
                      {activity.title || activity.message || 'Activity'}
                    </div>
                    {activity.description && (
                      <div className="text-xs text-secondary dark:text-slate-400 mt-1">
                        {activity.description}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-secondary dark:text-slate-400">
                      {activity.userName && (
                        <div className="flex items-center gap-1">
                          <User size={12} />
                          <span>{activity.userName}</span>
                        </div>
                      )}
                      {activity.timestamp && (
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{formatActivityTime(activity.timestamp)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {activity.status && (
                    <div className="flex-shrink-0">
                      {activity.status === 'SUCCESS' && (
                        <CheckCircle size={16} className="text-success" />
                      )}
                      {activity.status === 'ERROR' && (
                        <XCircle size={16} className="text-danger" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Auto-refresh indicator */}
      {isConnected && activities.length > 0 && (
        <div className="text-xs text-center text-secondary dark:text-slate-400 pt-2 border-t dark:border-slate-700">
          <div className="flex items-center justify-center gap-1">
            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
            <span>Live updates enabled</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;

