import React, { useState, useRef, useEffect } from 'react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, differenceInDays } from 'date-fns';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

const GanttChart = ({ orders, onOrderUpdate, viewMode = 'week' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [zoom, setZoom] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const scrollContainerRef = useRef(null);

  const getViewDates = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const getOrderPosition = (order) => {
    if (!order.scheduledStart || !order.scheduledEnd) return null;
    
    const start = new Date(order.scheduledStart);
    const end = new Date(order.scheduledEnd);
    const viewStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const viewEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    
    if (end < viewStart || start > viewEnd) return null;
    
    const daysFromStart = Math.max(0, differenceInDays(start, viewStart));
    const duration = differenceInDays(end, start) + 1;
    const maxDuration = differenceInDays(viewEnd, viewStart) + 1;
    
    return {
      left: (daysFromStart / maxDuration) * 100,
      width: (duration / maxDuration) * 100,
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-success';
      case 'IN_PROGRESS': return 'bg-accent';
      case 'PLANNED': return 'bg-slate-400';
      case 'CANCELLED': return 'bg-danger';
      case 'DELAYED': return 'bg-warning';
      default: return 'bg-secondary';
    }
  };

  const getPriorityColor = (priority) => {
    if (priority >= 8) return 'border-l-4 border-red-500';
    if (priority >= 5) return 'border-l-4 border-orange-500';
    return 'border-l-4 border-blue-500';
  };

  const handlePrevious = () => {
    setCurrentDate(addDays(currentDate, -7));
  };

  const handleNext = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const dates = getViewDates();
  const groupedOrders = orders.reduce((acc, order) => {
    const equipmentName = order.equipment?.name || 'Unassigned';
    if (!acc[equipmentName]) acc[equipmentName] = [];
    acc[equipmentName].push(order);
    return acc;
  }, {});

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border dark:border-slate-700">
      {/* Header Controls */}
      <div className="p-4 border-b dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleToday}
            className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90"
          >
            Today
          </button>
          <button
            onClick={handleNext}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            <ChevronRight size={20} />
          </button>
          <span className="ml-4 font-semibold dark:text-slate-200">
            {format(dates[0], 'MMM d')} - {format(dates[dates.length - 1], 'MMM d, yyyy')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            <ZoomOut size={20} />
          </button>
          <span className="text-sm dark:text-slate-300">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            <ZoomIn size={20} />
          </button>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="overflow-x-auto" ref={scrollContainerRef}>
        <div className="min-w-full">
          {/* Timeline Header */}
          <div className="flex border-b dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
            <div className="w-64 p-3 border-r dark:border-slate-700 font-semibold dark:text-slate-200">
              Equipment / Order
            </div>
            <div className="flex-1 flex">
              {dates.map((date, index) => (
                <div
                  key={index}
                  className="flex-1 p-3 border-r dark:border-slate-700 text-center min-w-[120px]"
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                >
                  <div className="text-xs text-secondary dark:text-slate-400">
                    {format(date, 'EEE')}
                  </div>
                  <div className="text-sm font-semibold dark:text-slate-200">
                    {format(date, 'd')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gantt Rows */}
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {Object.entries(groupedOrders).map(([equipmentName, equipmentOrders]) => (
              <div key={equipmentName} className="relative">
                {/* Equipment Row */}
                <div className="flex border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                  <div className="w-64 p-3 border-r dark:border-slate-700 font-medium dark:text-slate-200">
                    {equipmentName}
                  </div>
                  <div className="flex-1 relative" style={{ minHeight: '60px' }}>
                    {equipmentOrders.map((order) => {
                      const position = getOrderPosition(order);
                      if (!position) return null;
                      
                      return (
                        <div
                          key={order.id}
                          className={`absolute top-2 h-8 rounded ${getStatusColor(order.status)} ${getPriorityColor(order.priority || 0)} text-white text-xs flex items-center px-2 cursor-pointer hover:opacity-80 transition-opacity`}
                          style={{
                            left: `${position.left}%`,
                            width: `${position.width}%`,
                            minWidth: '80px',
                          }}
                          onClick={() => setSelectedOrder(order)}
                          title={`${order.orderNumber} - ${order.productName}`}
                        >
                          <span className="truncate">{order.orderNumber}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-slate-200">Order Details</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Order:</strong> {selectedOrder.orderNumber}</div>
              <div><strong>Product:</strong> {selectedOrder.productName}</div>
              <div><strong>Status:</strong> {selectedOrder.status}</div>
              <div><strong>Priority:</strong> {selectedOrder.priority || 0}</div>
              {selectedOrder.scheduledStart && (
                <div><strong>Start:</strong> {format(new Date(selectedOrder.scheduledStart), 'PPp')}</div>
              )}
              {selectedOrder.scheduledEnd && (
                <div><strong>End:</strong> {format(new Date(selectedOrder.scheduledEnd), 'PPp')}</div>
              )}
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-4 px-4 py-2 bg-accent text-white rounded hover:bg-accent/90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GanttChart;

