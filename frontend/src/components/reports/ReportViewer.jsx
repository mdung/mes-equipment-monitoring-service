import { useState, useEffect } from 'react';
import { Download, Calendar, Play, FileSpreadsheet, FileText, File } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import Toast from '../Toast';

function ReportViewer() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchTemplates();
    // Set default dates (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setEndDate(end.toISOString().slice(0, 16));
    setStartDate(start.toISOString().slice(0, 16));
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/reports/templates/active');
      setTemplates(response.data);
      if (response.data.length > 0) {
        setSelectedTemplate(response.data[0].templateCode);
      }
    } catch (error) {
      setToast({ message: 'Error fetching templates', type: 'error' });
    }
  };

  const generateReport = async () => {
    if (!selectedTemplate || !startDate || !endDate) {
      setToast({ message: 'Please select template and date range', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/reports/generate/${selectedTemplate}`, {
        params: { startDate, endDate }
      });
      setReportData(response.data);
      setToast({ message: 'Report generated successfully', type: 'success' });
    } catch (error) {
      setToast({ message: 'Error generating report', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    if (!selectedTemplate || !startDate || !endDate) {
      setToast({ message: 'Please generate report first', type: 'error' });
      return;
    }

    try {
      const response = await api.get(`/reports/export/${selectedTemplate}/${format}`, {
        params: { startDate, endDate },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'excel' ? 'xlsx' : format;
      link.setAttribute('download', `${selectedTemplate}_${Date.now()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setToast({ message: `Report exported as ${format.toUpperCase()}`, type: 'success' });
    } catch (error) {
      setToast({ message: 'Error exporting report', type: 'error' });
    }
  };

  const renderDataTable = (data) => {
    if (!data || data.length === 0) return null;

    const keys = Object.keys(data[0]);

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {keys.map(key => (
                <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index}>
                {keys.map(key => (
                  <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof row[key] === 'number' ? row[key].toFixed(2) : row[key] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h2 className="text-xl font-semibold">Generate & View Reports</h2>
        <p className="text-gray-600">Select a template, date range, and generate your report</p>
      </div>

      {/* Report Configuration */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              {templates.map(template => (
                <option key={template.id} value={template.templateCode}>
                  {template.templateName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>

        {/* Export Buttons */}
        {reportData && (
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <button
              onClick={() => exportReport('excel')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export Excel
            </button>
            <button
              onClick={() => exportReport('csv')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <File className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => exportReport('pdf')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        )}
      </div>

      {/* Report Display */}
      {reportData && reportData.data && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{reportData.template?.templateName}</h3>
            <p className="text-sm text-gray-600">
              Generated: {new Date(reportData.generatedAt).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              Period: {new Date(reportData.startDate).toLocaleDateString()} - {new Date(reportData.endDate).toLocaleDateString()}
            </p>
          </div>

          {/* Data Table */}
          {Array.isArray(reportData.data) && reportData.data.length > 0 && (
            <div>
              {renderDataTable(reportData.data)}
            </div>
          )}

          {/* No Data Message */}
          {Array.isArray(reportData.data) && reportData.data.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No data available for the selected date range
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!reportData && (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Report Generated</h3>
          <p className="text-gray-600">Select a template and date range, then click Generate to view your report</p>
        </div>
      )}
    </div>
  );
}

export default ReportViewer;
