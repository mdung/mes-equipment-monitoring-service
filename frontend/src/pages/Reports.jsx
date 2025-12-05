import React, { useState } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';
import Toast from '../components/Toast';

const Reports = () => {
    const [reportType, setReportType] = useState('production-efficiency');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [toast, setToast] = useState(null);

    const reportTypes = [
        { value: 'production-efficiency', label: 'Production Efficiency', icon: TrendingUp },
        { value: 'equipment-utilization', label: 'Equipment Utilization', icon: BarChart3 },
        { value: 'downtime-analysis', label: 'Downtime Analysis', icon: AlertCircle },
        { value: 'quality-trends', label: 'Quality Trends', icon: CheckCircle },
    ];

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const generateReport = async () => {
        if (!startDate || !endDate) {
            showToast('Please select both start and end dates', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await api.get(`/analytics/${reportType}`, {
                params: {
                    startDate: new Date(startDate).toISOString(),
                    endDate: new Date(endDate).toISOString()
                }
            });
            setReportData(response.data);
            showToast('Report generated successfully');
        } catch (error) {
            console.error('Failed to generate report', error);
            showToast('Failed to generate report', 'error');
        } finally {
            setLoading(false);
        }
    };

    const exportReport = async (format) => {
        if (!startDate || !endDate) {
            showToast('Please select dates and generate report first', 'error');
            return;
        }

        try {
            const response = await api.get(`/analytics/export/${reportType}/${format}`, {
                params: {
                    startDate: new Date(startDate).toISOString(),
                    endDate: new Date(endDate).toISOString()
                },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${reportType}-${Date.now()}.${format === 'excel' ? 'xlsx' : format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            showToast(`Report exported as ${format.toUpperCase()}`);
        } catch (error) {
            console.error('Failed to export report', error);
            showToast('Failed to export report', 'error');
        }
    };

    const renderReportTable = () => {
        if (!reportData || reportData.length === 0) {
            return (
                <div className="text-center py-10 text-secondary">
                    No data available for the selected date range
                </div>
            );
        }

        const keys = Object.keys(reportData[0]);

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            {keys.map(key => (
                                <th key={key} className="p-3 font-semibold text-secondary">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {reportData.map((row, index) => (
                            <tr key={index} className="hover:bg-slate-50">
                                {keys.map(key => (
                                    <td key={key} className="p-3">
                                        {typeof row[key] === 'number' 
                                            ? row[key].toFixed(2)
                                            : row[key] || '-'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Analytics & Reports</h2>
            </div>

            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {reportTypes.map(type => {
                        const Icon = type.icon;
                        return (
                            <button
                                key={type.value}
                                onClick={() => setReportType(type.value)}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    reportType === type.value
                                        ? 'border-accent bg-accent/10'
                                        : 'border-slate-200 hover:border-accent/50'
                                }`}
                            >
                                <Icon className={`mx-auto mb-2 ${reportType === type.value ? 'text-accent' : 'text-secondary'}`} size={24} />
                                <p className="text-sm font-medium text-center">{type.label}</p>
                            </button>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Start Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" size={18} />
                            <input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">End Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" size={18} />
                            <input
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                        </div>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={generateReport}
                            disabled={loading}
                            className="w-full btn btn-primary disabled:opacity-50"
                        >
                            {loading ? 'Generating...' : 'Generate Report'}
                        </button>
                    </div>
                </div>

                {reportData && (
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => exportReport('excel')}
                            className="btn bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                        >
                            <Download size={16} />
                            Export Excel
                        </button>
                        <button
                            onClick={() => exportReport('csv')}
                            className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                        >
                            <Download size={16} />
                            Export CSV
                        </button>
                        <button
                            onClick={() => exportReport('pdf')}
                            className="btn bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                        >
                            <Download size={16} />
                            Export PDF
                        </button>
                    </div>
                )}
            </div>

            {reportData && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">
                        {reportTypes.find(t => t.value === reportType)?.label} Report
                    </h3>
                    {renderReportTable()}
                </div>
            )}
        </div>
    );
};

export default Reports;
