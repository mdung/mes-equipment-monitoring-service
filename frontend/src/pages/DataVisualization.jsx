import React, { useState, useEffect } from 'react';
import { BarChart3, Grid, List } from 'lucide-react';
import EquipmentUtilizationHeatmap from '../components/visualizations/EquipmentUtilizationHeatmap';
import MaterialFlowSankey from '../components/visualizations/MaterialFlowSankey';
import EquipmentNetworkDiagram from '../components/visualizations/EquipmentNetworkDiagram';
import FactoryFloor3D from '../components/visualizations/FactoryFloor3D';
import InteractiveTimeline from '../components/visualizations/InteractiveTimeline';
import api from '../services/api';

const DataVisualization = () => {
  const [activeTab, setActiveTab] = useState('heatmap');
  const [equipment, setEquipment] = useState([]);
  const [orders, setOrders] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [equipmentRes, ordersRes] = await Promise.all([
        api.get('/equipment'),
        api.get('/orders?status=IN_PROGRESS'),
      ]);
      setEquipment(equipmentRes.data || []);
      setOrders(ordersRes.data || []);
      
      // Generate sample events for timeline
      generateTimelineEvents();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const generateTimelineEvents = () => {
    const sampleEvents = [
      {
        id: 1,
        type: 'PRODUCTION',
        title: 'Order PO-001 Started',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        equipmentName: 'CNC Machine 1',
      },
      {
        id: 2,
        type: 'MAINTENANCE',
        title: 'Scheduled Maintenance',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        equipmentName: 'Assembly Line 1',
      },
      {
        id: 3,
        type: 'QUALITY',
        title: 'Quality Check Passed',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        equipmentName: 'Quality Control',
      },
      {
        id: 4,
        type: 'ALERT',
        title: 'High Temperature Alert',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        equipmentName: 'CNC Machine 2',
      },
      {
        id: 5,
        type: 'PRODUCTION',
        title: 'Order PO-002 Completed',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        equipmentName: 'Packaging Station',
      },
    ];
    setEvents(sampleEvents);
  };

  const tabs = [
    { id: 'heatmap', label: 'Utilization Heatmap', icon: Grid },
    { id: 'sankey', label: 'Material Flow', icon: BarChart3 },
    { id: 'network', label: 'Network Diagram', icon: List },
    { id: '3d', label: '3D Factory Floor', icon: Grid },
    { id: 'timeline', label: 'Interactive Timeline', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-200 flex items-center gap-2">
          <BarChart3 size={24} />
          Data Visualization
        </h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-accent text-white'
                  : 'bg-white dark:bg-slate-800 text-secondary dark:text-slate-300 border dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="card">
        {activeTab === 'heatmap' && (
          <div className="space-y-4">
            {equipment.length > 0 ? (
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-slate-200">
                  Select Equipment:
                </label>
                <select
                  value={selectedEquipment?.id || ''}
                  onChange={(e) => {
                    const eq = equipment.find(e => e.id === parseInt(e.target.value));
                    setSelectedEquipment(eq);
                  }}
                  className="w-full md:w-auto px-4 py-2 border dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg mb-4"
                >
                  <option value="">Select Equipment</option>
                  {equipment.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name}</option>
                  ))}
                </select>
                {selectedEquipment && (
                  <EquipmentUtilizationHeatmap equipmentId={selectedEquipment.id} />
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-secondary dark:text-slate-400">
                No equipment available
              </div>
            )}
          </div>
        )}

        {activeTab === 'sankey' && (
          <div className="space-y-4">
            {orders.length > 0 ? (
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-slate-200">
                  Select Production Order:
                </label>
                <select
                  value={selectedOrder?.id || ''}
                  onChange={(e) => {
                    const order = orders.find(o => o.id === parseInt(e.target.value));
                    setSelectedOrder(order);
                  }}
                  className="w-full md:w-auto px-4 py-2 border dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg mb-4"
                >
                  <option value="">Select Order</option>
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>{order.orderNumber}</option>
                  ))}
                </select>
                {selectedOrder && (
                  <MaterialFlowSankey orderId={selectedOrder.id} />
                )}
              </div>
            ) : (
              <MaterialFlowSankey orderId={null} />
            )}
          </div>
        )}

        {activeTab === 'network' && (
          <EquipmentNetworkDiagram selectedEquipmentId={selectedEquipment?.id} />
        )}

        {activeTab === '3d' && (
          <FactoryFloor3D />
        )}

        {activeTab === 'timeline' && (
          <InteractiveTimeline
            events={events}
            startDate={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
            endDate={new Date()}
            onEventClick={(event) => console.log('Event clicked:', event)}
          />
        )}
      </div>
    </div>
  );
};

export default DataVisualization;

