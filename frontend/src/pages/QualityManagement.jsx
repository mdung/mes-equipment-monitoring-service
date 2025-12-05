import { useState } from 'react';
import { ClipboardCheck, FileText, AlertTriangle, Search, TrendingUp, BarChart3 } from 'lucide-react';
import QualityControlPlans from '../components/quality/QualityControlPlans';
import InspectionChecklists from '../components/quality/InspectionChecklists';
import DefectManagement from '../components/quality/DefectManagement';
import RootCauseAnalysis from '../components/quality/RootCauseAnalysis';
import QualityTrends from '../components/quality/QualityTrends';
import SpcCharts from '../components/quality/SpcCharts';

function QualityManagement() {
  const [activeTab, setActiveTab] = useState('plans');

  const tabs = [
    { id: 'plans', name: 'Control Plans', icon: FileText },
    { id: 'checklists', name: 'Inspection Checklists', icon: ClipboardCheck },
    { id: 'defects', name: 'Defect Management', icon: AlertTriangle },
    { id: 'rca', name: 'Root Cause Analysis', icon: Search },
    { id: 'trends', name: 'Quality Trends', icon: TrendingUp },
    { id: 'spc', name: 'SPC Charts', icon: BarChart3 },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quality Management</h1>
        <p className="text-gray-600 mt-1">Comprehensive quality control and analysis</p>
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
        {activeTab === 'plans' && <QualityControlPlans />}
        {activeTab === 'checklists' && <InspectionChecklists />}
        {activeTab === 'defects' && <DefectManagement />}
        {activeTab === 'rca' && <RootCauseAnalysis />}
        {activeTab === 'trends' && <QualityTrends />}
        {activeTab === 'spc' && <SpcCharts />}
      </div>
    </div>
  );
}

export default QualityManagement;
