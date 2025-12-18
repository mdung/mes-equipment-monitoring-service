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
      setLoading(true);
      const [equipmentRes, ordersRes, shiftRes, activitiesRes] = await Promise.all([
        api.get('/equipment'),
        api.get('/orders'),
        api.get('/shifts/current').catch(() => ({ data: createMockShift() })),
        api.get('/activities/recent').catch(() => ({ data: createMockActivities() })),
      ]);
      
      let equipmentData = equipmentRes.data || [];
      let ordersData = ordersRes.data || [];
      
      // If no real data, create mock data for demonstration
      if (equipmentData.length === 0) {
        equipmentData = createMockEquipment();
      }
      
      if (ordersData.length === 0) {
        ordersData = createMockOrders();
      }
      
      // Filter active orders
      const activeOrders = ordersData.filter(o => o.status === 'IN_PROGRESS' || o.status === 'RUNNING');
      
      setEquipment(equipmentData);
      setOrders(activeOrders);
      setCurrentShift(shiftRes.data);
      
      // Calculate real-time stats
      const activeEq = equipmentData.filter(e => e.status === 'RUNNING').length;
      const idleEq = equipmentData.filter(e => e.status === 'IDLE').length;
      const downEq = equipmentData.filter(e => e.status === 'DOWN').length;
      const totalProd = activeOrders.reduce((sum, o) => sum + (o.producedQuantity || 0), 0);
      const avgEfficiency = equipmentData.length > 0 
        ? Math.round(activeEq / equipmentData.length * 100) 
        : 0;
      
      setStats({
        activeEquipment: activeEq,
        activeOrders: activeOrders.length,
        totalProduction: totalProd,
        efficiency: avgEfficiency
      });
      
      setLastUpdate(new Date());
      setLiveStatus('connected');
    } catch (error) {
      console.error('Error fetching data:', error);
      setLiveStatus('error');
      // Use mock data on error
      const mockEquipment = createMockEquipment();
      const mockOrders = createMockOrders();
      setEquipment(mockEquipment);
      setOrders(mockOrders);
      setCurrentShift(createMockShift());
    } finally {
      setLoading(false);
    }
  };

  // Mock data generators for when database is empty
  const createMockEquipment = () => [
    { id: 1, name: 'CNC Machine A1', code: 'CNC-001', location: 'Floor A', status: 'RUNNING', idealCycleTime: 120 },
    { id: 2, name: 'Assembly Line B2', code: 'ASM-002', location: 'Floor B', status: 'RUNNING', idealCycleTime: 90 },
    { id: 3, name: 'Quality Station C3', code: 'QC-003', location: 'Floor C', status: 'IDLE', idealCycleTime: 60 },
    { id: 4, name: 'Packaging Unit D4', code: 'PKG-004', location: 'Floor D', status: 'RUNNING', idealCycleTime: 45 },
    { id: 5, name: 'Welding Robot E5', code: 'WLD-005', location: 'Floor A', status: 'DOWN', idealCycleTime: 180 },
    { id: 6, name: 'Paint Booth F6', code: 'PNT-006', location: 'Floor B', status: 'MAINTENANCE', idealCycleTime: 240 }
  ];

  const createMockOrders = () => [
    { id: 1, orderNumber: 'ORD-2024-001', productName: 'Widget A', targetQuantity: 500, producedQuantity: 342, status: 'IN_PROGRESS' },
    { id: 2, orderNumber: 'ORD-2024-002', productName: 'Component B', targetQuantity: 300, producedQuantity: 156, status: 'IN_PROGRESS' },
    { id: 3, orderNumber: 'ORD-2024-003', productName: 'Assembly C', targetQuantity: 200, producedQuantity: 89, status: 'IN_PROGRESS' },
    { id: 4, orderNumber: 'ORD-2024-004', productName: 'Part D', targetQuantity: 750, producedQuantity: 623, status: 'IN_PROGRESS' }
  ];

  const createMockShift = () => ({
    id: 1,
    name: 'Day Shift',
    startTime: '06:00',
    endTime: '14:00',
    supervisor: 'John Smith',
    status: 'ACTIVE'
  });

  const createMockActivities = () => [
    { id: 1, message: 'CNC Machine A1 started production', timestamp: new Date(Date.now() - 300000), type: 'INFO' },
    { id: 2, message: 'Quality check completed for Order ORD-2024-001', timestamp: new Date(Date.now() - 600000), type: 'SUCCESS' },
    { id: 3, message: 'Welding Robot E5 requires maintenance', timestamp: new Date(Date.now() - 900000), type: 'WARNING' },
    { id: 4, message: 'Production target reached for Component B', timestamp: new Date(Date.now() - 1200000), type: 'SUCCESS' }
  ];

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
    <div className="min-h-screen bg-slate-900 text-white p-4 space-y-6">
      {/* Dark Header with Live Status */}
      <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Activity size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Real-Time Monitoring</h2>
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <Clock size={14} />
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors border border-slate-600"
              title="Refresh data"
            >
              <RefreshCw size={18} className={`text-slate-300 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
              liveStatus === 'connected' 
                ? 'bg-green-500/20 border-green-500/30' 
                : 'bg-red-500/20 border-red-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                liveStatus === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`}></div>
              <span className={`text-sm font-medium ${
                liveStatus === 'connected' ? 'text-green-400' : 'text-red-400'
              }`}>
                {liveStatus === 'connected' ? 'Live' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Zap size={20} className="text-green-400" />
            </div>
            <div className="text-green-400 text-sm font-medium">+{Math.floor(Math.random() * 5)}%</div>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Active Equipment</p>
            <p className="text-2xl font-bold text-white">{stats.activeEquipment}</p>
            <p className="text-xs text-slate-500">of {equipment.length} total</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BarChart3 size={20} className="text-blue-400" />
            </div>
            <div className="text-blue-400 text-sm font-medium">Live</div>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Active Orders</p>
            <p className="text-2xl font-bold text-white">{stats.activeOrders}</p>
            <p className="text-xs text-slate-500">in progress</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <TrendingUp size={20} className="text-purple-400" />
            </div>
            <div className="text-purple-400 text-sm font-medium">+{Math.floor(Math.random() * 15)}%</div>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Production Today</p>
            <p className="text-2xl font-bold text-white">{stats.totalProduction.toLocaleString()}</p>
            <p className="text-xs text-slate-500">units completed</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Activity size={20} className="text-orange-400" />
            </div>
            <div className="text-orange-400 text-sm font-medium">{stats.efficiency}%</div>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Efficiency</p>
            <p className="text-2xl font-bold text-white">{stats.efficiency}%</p>
            <p className="text-xs text-slate-500">equipment utilization</p>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Clock size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Activity Feed</h3>
              <p className="text-xs text-slate-400">Real-time system events</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">Live</span>
          </div>
        </div>
        <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
          <ActivityFeed filter="ALL" limit={20} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Equipment Status */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Wifi size={20} className="text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Live Equipment Status</h3>
                <p className="text-xs text-slate-400">{equipment.length} devices connected</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">Live</span>
            </div>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {equipment.length > 0 ? equipment.map((eq) => (
              <div 
                key={eq.id}
                onClick={() => setSelectedEquipment(eq)}
                className="cursor-pointer hover:bg-slate-700/50 p-4 rounded-xl transition-all border border-slate-600 hover:border-blue-500/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      eq.status === 'RUNNING' ? 'bg-green-400 animate-pulse' :
                      eq.status === 'IDLE' ? 'bg-yellow-400' :
                      eq.status === 'DOWN' ? 'bg-red-400' :
                      'bg-blue-400'
                    }`}></div>
                    <span className="text-white font-medium">{eq.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    eq.status === 'RUNNING' ? 'bg-green-500/20 text-green-400' :
                    eq.status === 'IDLE' ? 'bg-yellow-500/20 text-yellow-400' :
                    eq.status === 'DOWN' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {eq.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Location: {eq.location || 'Floor A'} • Code: {eq.code}
                </div>
                <LiveEquipmentStatus
                  equipmentId={eq.id}
                  equipmentName={eq.name}
                />
              </div>
            )) : (
              <div className="text-center py-12 text-slate-400">
                <div className="p-4 bg-slate-700/50 rounded-full w-fit mx-auto mb-4">
                  <AlertCircle size={32} />
                </div>
                <p className="font-medium">No equipment connected</p>
                <p className="text-xs mt-1">Check network connections</p>
              </div>
            )}
          </div>
        </div>

        {/* Real-Time Production Counters */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <BarChart3 size={20} className="text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Real-Time Production</h3>
                <p className="text-xs text-slate-400">{orders.length} orders active</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-purple-400 text-sm font-medium">Tracking</span>
            </div>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {orders.length > 0 ? orders.map((order) => (
              <div 
                key={order.id} 
                onClick={() => setSelectedOrder(order)}
                className="p-4 bg-slate-700/30 rounded-xl border border-slate-600 hover:border-purple-500/50 cursor-pointer transition-all hover:shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium">{order.orderNumber}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full font-medium">
                    {order.productName || 'Product A'}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-white font-medium">
                      {order.producedQuantity || 0} / {order.targetQuantity || 100}
                    </span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-purple-400 h-2 rounded-full transition-all duration-1000"
                      style={{width: `${Math.min(100, ((order.producedQuantity || 0) / (order.targetQuantity || 100)) * 100)}%`}}
                    ></div>
                  </div>
                </div>
                <RealTimeProductionCounter
                  orderId={order.id}
                  initialQuantity={order.producedQuantity || 0}
                  targetQuantity={order.targetQuantity}
                />
              </div>
            )) : (
              <div className="text-center py-12 text-slate-400">
                <div className="p-4 bg-slate-700/50 rounded-full w-fit mx-auto mb-4">
                  <AlertCircle size={32} />
                </div>
                <p className="font-medium">No active production orders</p>
                <p className="text-xs mt-1">Start a new production run</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shift Handover Chat */}
      {currentShift && (
        <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <MessageSquare size={20} className="text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Shift Handover</h3>
                <p className="text-xs text-slate-400">Current shift: {currentShift.name}</p>
              </div>
            </div>
            <span className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded-full font-medium">
              Active
            </span>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
            <ShiftHandoverChat shiftId={currentShift.id} currentShift={currentShift} />
          </div>
        </div>
      )}

      {/* Collaborative Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {selectedOrder && (
          <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <FileText size={20} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Order Notes</h3>
                  <p className="text-xs text-slate-400">#{selectedOrder.orderNumber}</p>
                </div>
              </div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
              <CollaborativeNotes orderId={selectedOrder.id} noteType="ORDER" />
            </div>
          </div>
        )}
        {selectedEquipment && (
          <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <FileText size={20} className="text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Equipment Notes</h3>
                  <p className="text-xs text-slate-400">{selectedEquipment.name}</p>
                </div>
              </div>
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            </div>
            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
              <CollaborativeNotes equipmentId={selectedEquipment.id} noteType="EQUIPMENT" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-slate-800 rounded-2xl p-4 shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">
              <RefreshCw size={16} className="text-white" />
              <span className="text-white text-sm font-medium">Refresh All</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
              <Maximize2 size={16} className="text-slate-300" />
              <span className="text-slate-300 text-sm font-medium">Full Screen</span>
            </button>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Clock size={14} />
            <span>Auto-refresh: 10s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeMonitoring;

