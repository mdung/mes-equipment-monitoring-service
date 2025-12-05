import { useState, useEffect } from 'react';
import { Calendar, Wrench, CheckSquare, Package, DollarSign, History } from 'lucide-react';
import MaintenanceCalendar from '../components/maintenance/MaintenanceCalendar';
import PreventiveScheduler from '../components/maintenance/PreventiveScheduler';
import TaskChecklist from '../components/maintenance/TaskChecklist';
import SparePartsManagement from '../components/maintenance/SparePartsManagement';
import CostTracking from '../components/maintenance/CostTracking';
import MaintenanceHistory from '../components/maintenance/MaintenanceHistory';

function Maintenance() {
  const [activeTab, setActiveTab] = useState('calendar');

  const tabs = [
    { id: 'calendar', name: 'Calendar View', icon: Calendar },
    { id: 'scheduler', name: 'Preventive Scheduler', icon: Wrench },
    { id: 'tasks', name: 'Task Checklist', icon: CheckSquare },
    { id: 'parts', name: 'Spare Parts', icon: Package },
    { id: 'costs', name: 'Cost Tracking', icon: DollarSign },
    { id: 'history', name: 'History', icon: History },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Maintenance Management</h1>
        <p className="text-gray-600 mt-1">Manage equipment maintenance schedules, tasks, and spare parts</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'calendar' && <MaintenanceCalendar />}
        {activeTab === 'scheduler' && <PreventiveScheduler />}
        {activeTab === 'tasks' && <TaskChecklist />}
        {activeTab === 'parts' && <SparePartsManagement />}
        {activeTab === 'costs' && <CostTracking />}
        {activeTab === 'history' && <MaintenanceHistory />}
      </div>
    </div>
  );
}

export default Maintenance;
