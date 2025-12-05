import React, { useState, useEffect } from 'react';
import { Activity, Wifi, MessageSquare, FileText, BarChart3 } from 'lucide-react';
import LiveEquipmentStatus from '../components/realtime/LiveEquipmentStatus';
import RealTimeProductionCounter from '../components/realtime/RealTimeProductionCounter';
import ShiftHandoverChat from '../components/realtime/ShiftHandoverChat';
import CollaborativeNotes from '../components/realtime/CollaborativeNotes';
import ActivityFeed from '../components/realtime/ActivityFeed';
import api from '../services/api';

const RealtimeMonitoring = () => {
  const [equipment, setEquipment] = useState([]);
  const [orders, setOrders] = useState([]);
  const [currentShift, setCurrentShift] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [equipmentRes, ordersRes, shiftRes] = await Promise.all([
        api.get('/equipment'),
        api.get('/orders?status=IN_PROGRESS'),
        api.get('/shifts/current').catch(() => ({ data: null })),
      ]);
      setEquipment(equipmentRes.data);
      setOrders(ordersRes.data);
      setCurrentShift(shiftRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-200 flex items-center gap-2">
          <Activity size={24} />
          Real-Time Monitoring
        </h2>
      </div>

      {/* Activity Feed */}
      <div className="card">
        <ActivityFeed filter="ALL" limit={20} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Equipment Status */}
        <div className="card">
          <h3 className="font-semibold text-lg mb-4 dark:text-slate-200 flex items-center gap-2">
            <Wifi size={20} />
            Live Equipment Status
          </h3>
          <div className="space-y-4">
            {equipment.slice(0, 5).map((eq) => (
              <LiveEquipmentStatus
                key={eq.id}
                equipmentId={eq.id}
                equipmentName={eq.name}
              />
            ))}
          </div>
        </div>

        {/* Real-Time Production Counters */}
        <div className="card">
          <h3 className="font-semibold text-lg mb-4 dark:text-slate-200 flex items-center gap-2">
            <BarChart3 size={20} />
            Real-Time Production
          </h3>
          <div className="space-y-4">
            {orders.slice(0, 3).map((order) => (
              <div key={order.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded border dark:border-slate-700">
                <div className="font-medium mb-2 dark:text-slate-200">{order.orderNumber}</div>
                <RealTimeProductionCounter
                  orderId={order.id}
                  initialQuantity={order.producedQuantity || 0}
                  targetQuantity={order.targetQuantity}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shift Handover Chat */}
      {currentShift && (
        <div className="card">
          <ShiftHandoverChat shiftId={currentShift.id} currentShift={currentShift} />
        </div>
      )}

      {/* Collaborative Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {selectedOrder && (
          <div className="card">
            <CollaborativeNotes orderId={selectedOrder.id} noteType="ORDER" />
          </div>
        )}
        {selectedEquipment && (
          <div className="card">
            <CollaborativeNotes equipmentId={selectedEquipment.id} noteType="EQUIPMENT" />
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimeMonitoring;

