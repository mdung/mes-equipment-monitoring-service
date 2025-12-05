import { useState } from 'react';
import { Settings } from 'lucide-react';

function ReportBuilder() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Custom Report Builder</h2>
        <p className="text-gray-600">Build custom reports with drag-and-drop interface</p>
      </div>
      <div className="bg-white p-12 rounded-lg shadow text-center">
        <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Builder</h3>
        <p className="text-gray-600">Interactive report builder - Select data sources, fields, filters, and visualizations</p>
      </div>
    </div>
  );
}

export default ReportBuilder;
