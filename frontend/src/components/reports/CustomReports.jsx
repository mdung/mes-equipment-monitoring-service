import { useState } from 'react';
import { PieChart } from 'lucide-react';

function CustomReports() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">My Custom Reports</h2>
        <p className="text-gray-600">View and manage your custom-built reports</p>
      </div>
      <div className="bg-white p-12 rounded-lg shadow text-center">
        <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Reports</h3>
        <p className="text-gray-600">Save and reuse your custom report configurations</p>
      </div>
    </div>
  );
}

export default CustomReports;
