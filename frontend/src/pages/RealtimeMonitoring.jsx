import React, { useState, useEffect } from 'react';
import { Activity, Wifi, MessageSquare, FileText, BarChart3, RefreshCw, Maximize2, TrendingUp, Zap, Clock, AlertCircle } from 'lucide-react';
import LiveEquipmentStatus from '../components/realtime/LiveEquipmentStatus';
import RealTimeProductionCounter from '../components/realtime/RealTimeProductionCounter';
import ShiftHandoverChat from '../components/realtime/ShiftHandoverChat';
import CollaborativeNotes from '../components/realtime/CollaborativeNotes';
import ActivityFeed from '../components/realtime/ActivityFeed';
import api from '../services/api';
import websocketService from '../services/websocket';

const RealtimeMonitoring = () => {
  const [equipment, setEquipment] = useState([]);
  const [orders, setOrders] = useState([]);
  const [currentShift, setCurrentShift] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveStatus, setLiveStatus] = useState('connected');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [stats, setStats] = useState({
    activeEquipment: 0,
    activeOrders: 0,
    totalProduction: 0,
    efficiency: 0
  });

  useEffect(() => {
    fetchData();
    
    // Subscribe to real-time updates
    const subscription = websocketService.subscribe('/topic/realtime', (message) => {
      handleRealtimeUpdate(message);
    });

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => {
      if (subscription) subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleRealtimeUpdate = (message) => {
    setLastUpdate(new Date());
    // Handle different types of real-time updates
    if (message.type === 'EQUIPMENT_STATUS') {
      fetchData();
    } else if (message.type === 'PRODUCTION_UPDATE') {
      fetchData();
    }
  };

  const fetchData = async () => {
    try {
      const [equipmentRes, ordersRes, shiftRes] = await Promise.all([
        api.get('/equipment'),
        api.get('/orders?status=IN_PROGRESS'),
        api.get('/shifts/current').catch(() => ({ data: null })),
      ]);
      
      const equipmentData = equipmentRes.data || [];
      const ordersData = ordersRes.data || [];
      
      setEquipment(equipmentData);
      setOrders(ordersData);
      setCurrentShift(shiftRes.data);
      
      // Calculate stats
      const activeEq = equipmentData.filter(e => e.status === 'RUNNING').length;
      const totalProd = ordersData.reduce((sum, o) => sum + (o.producedQuantity || 0), 0);
      const avgEfficiency = equipmentData.length > 0 
        ? Math.round(activeEq / equipmentData.length * 100) 
        : 0;
      
      setStats({
        activeEquipment: activeEq,
        activeOrders: ordersData.length,
        totalProduction: totalProd,
        efficiency: avgEfficiency
      });
      
      setLastUpdate(new Date());
      setLiveStatus('connected');
    } catch (error) {
      console.error('Error fetching data:', error);
      setLiveStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-secondary dark:text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold dark:text-slate-100">{value}</p>
          {subtitle && <p className="text-xs text-secondary mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          <Icon className={color.replace('bg-', 'text-')} size={24} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Live Status */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-slate-200 flex items-center gap-2">
            <Activity size={28} className="text-accent" />
            Real-Time Monitoring
          </h2>
          <p className="text-sm text-secondary dark:text-slate-400 mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Refresh data"
          >
            <RefreshCw size={18} className="text-secondary" />
          </button>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            liveStatus === 'connected' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              liveStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span className={`text-sm font-medium ${
              liveStatus === 'connected' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
            }`}>
              {liveStatus === 'connected' ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active Equipment" 
          value={stats.activeEquipment}
          subtitle={`of ${equipment.length} total`}
          icon={Zap} 
          color="text-green-600" 
        />
        <StatCard 
          title="Active Orders" 
          value={stats.activeOrders}
          subtitle="in progress"
          icon={BarChart3} 
          color="text-blue-600" 
        />
        <StatCard 
          title="Total Production" 
          value={stats.totalProduction}
          subtitle="units today"
          icon={TrendingUp} 
          color="text-purple-600" 
        />
        <StatCard 
          title="Efficiency" 
          value={`${stats.efficiency}%`}
          subtitle="equipment utilization"
          icon={Activity} 
          color="text-orange-600" 
        />
      </div>

      {/* Activity Feed */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg dark:text-slate-200 flex items-center gap-2">
            <Clock size={20} className="text-accent" />
            Activity Feed
          </h3>
          <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded" title="Expand">
            <Maximize2 size={16} />
          </button>
        </div>
        <ActivityFeed filter="ALL" limit={20} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Equipment Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg dark:text-slate-200 flex items-center gap-2">
              <Wifi size={20} className="text-green-500" />
              Live Equipment Status
            </h3>
            <span className="text-xs text-secondary">{equipment.length} devices</span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {equipment.length > 0 ? equipment.map((eq) => (
              <div 
                key={eq.id}
                onClick={() => setSelectedEquipment(eq)}
                className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-3 rounded-lg transition-colors border border-transparent hover:border-accent"
              >
                <LiveEquipmentStatus
                  equipmentId={eq.id}
                  equipmentName={eq.name}
                />
              </div>
            )) : (
              <div className="text-center py-8 text-secondary">
                <AlertCircle className="mx-auto mb-2" size={32} />
                <p>No equipment found</p>
              </div>
            )}
          </div>
        </div>

        {/* Real-Time Production Counters */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg dark:text-slate-200 flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-500" />
              Real-Time Production
            </h3>
            <span className="text-xs text-secondary">{orders.length} active</span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {orders.length > 0 ? orders.map((order) => (
              <div 
                key={order.id} 
                onClick={() => setSelectedOrder(order)}
                className="p-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-accent cursor-pointer transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="font-medium dark:text-slate-200">{order.orderNumber}</div>
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                    {order.productName}
                  </span>
                </div>
                <RealTimeProductionCounter
                  orderId={order.id}
                  initialQuantity={order.producedQuantity || 0}
                  targetQuantity={order.targetQuantity}
                />
              </div>
            )) : (
              <div className="text-center py-8 text-secondary">
                <AlertCircle className="mx-auto mb-2" size={32} />
                <p>No active production orders</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shift Handover Chat */}
      {currentShift && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={20} className="text-accent" />
            <h3 className="font-semibold text-lg dark:text-slate-200">Shift Handover</h3>
            <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
              {currentShift.name}
            </span>
          </div>
          <ShiftHandoverChat shiftId={currentShift.id} currentShift={currentShift} />
        </div>
      )}

      {/* Collaborative Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {selectedOrder && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={20} className="text-accent" />
              <h3 className="font-semibold text-lg dark:text-slate-200">Order Notes</h3>
              <span className="text-xs text-secondary">#{selectedOrder.orderNumber}</span>
            </div>
            <CollaborativeNotes orderId={selectedOrder.id} noteType="ORDER" />
          </div>
        )}
        {selectedEquipment && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={20} className="text-accent" />
              <h3 className="font-semibold text-lg dark:text-slate-200">Equipment Notes</h3>
              <span className="text-xs text-secondary">{selectedEquipment.name}</span>
            </div>
            <CollaborativeNotes equipmentId={selectedEquipment.id} noteType="EQUIPMENT" />
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimeMonitoring;

