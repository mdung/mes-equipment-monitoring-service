import { useState, useEffect } from 'react';
import { FileText, Eye } from 'lucide-react';
import api from '../../services/api';
import Toast from '../Toast';

function ReportTemplates() {
  const [templates, setTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [toast, setToast] = useState(null);

  const categories = ['ALL', 'PRODUCTION', 'QUALITY', 'MAINTENANCE', 'EQUIPMENT'];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/reports/templates/active');
      setTemplates(response.data);
    } catch (error) {
      setToast({ message: 'Error fetching templates', type: 'error' });
    }
  };

  const filteredTemplates = selectedCategory === 'ALL' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const getCategoryColor = (category) => {
    const colors = {
      PRODUCTION: 'bg-blue-100 text-blue-800',
      QUALITY: 'bg-green-100 text-green-800',
      MAINTENANCE: 'bg-yellow-100 text-yellow-800',
      EQUIPMENT: 'bg-purple-100 text-purple-800',
      CUSTOM: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getReportTypeIcon = (type) => {
    switch (type) {
      case 'DASHBOARD': return '📊';
      case 'CHART': return '📈';
      case 'TABLE': return '📋';
      default: return '📄';
    }
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Pre-Built Report Templates</h2>
        <p className="text-gray-600 mb-4">Select from professionally designed report templates</p>

        {/* Category Filter */}
        <div className="flex gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-white p-6 rounded-lg shadow border hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getReportTypeIcon(template.reportType)}</span>
                <div>
                  <h3 className="font-semibold text-lg">{template.templateName}</h3>
                  <span className={`inline-block px-2 py-1 text-xs rounded mt-1 ${getCategoryColor(template.category)}`}>
                    {template.category}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{template.description}</p>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>Type: {template.reportType}</span>
              <span>Code: {template.templateCode}</span>
            </div>

            <button
              onClick={() => window.location.href = `#viewer?template=${template.templateCode}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Eye className="w-4 h-4" />
              Generate Report
            </button>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No templates found in this category</p>
        </div>
      )}
    </div>
  );
}

export default ReportTemplates;
