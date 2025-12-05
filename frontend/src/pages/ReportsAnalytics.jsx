import { useState } from 'react';
import { FileText, Calendar, Settings, Clock, BarChart3, PieChart } from 'lucide-react';
import ReportTemplates from '../components/reports/ReportTemplates';
import ReportBuilder from '../components/reports/ReportBuilder';
import ScheduledReports from '../components/reports/ScheduledReports';
import ReportViewer from '../components/reports/ReportViewer';
import CustomReports from '../components/reports/CustomReports';

function ReportsAnalytics() {
  const [activeTab, setActiveTab] = useState('templates');

  const tabs = [
    { id: 'templates', name: 'Report Templates', icon: FileText },
    { id: 'builder', name: 'Report Builder', icon: Settings },
    { id: 'viewer', name: 'Generate & View', icon: BarChart3 },
    { id: 'custom', name: 'Custom Reports', icon: PieChart },
    { id: 'scheduled', name: 'Scheduled Reports', icon: Clock },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Generate, schedule, and export comprehensive reports</p>
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
        {activeTab === 'templates' && <ReportTemplates />}
        {activeTab === 'builder' && <ReportBuilder />}
        {activeTab === 'viewer' && <ReportViewer />}
        {activeTab === 'custom' && <CustomReports />}
        {activeTab === 'scheduled' && <ScheduledReports />}
      </div>
    </div>
  );
}

export default ReportsAnalytics;
