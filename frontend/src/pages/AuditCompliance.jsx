import React, { useState, useEffect } from 'react';
import { FileText, History, Shield, Database, Download, Calendar, Filter, Search } from 'lucide-react';
import api from '../services/api';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const AuditCompliance = () => {
    const [activeTab, setActiveTab] = useState('audit-trail');
    const [auditTrail, setAuditTrail] = useState([]);
    const [userActivity, setUserActivity] = useState([]);
    const [changeHistory, setChangeHistory] = useState([]);
    const [retentionPolicies, setRetentionPolicies] = useState([]);
    const [complianceReports, setComplianceReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const { user } = useAuth();

    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const startDate = new Date(dateRange.start).toISOString();
            const endDate = new Date(dateRange.end).toISOString();

            switch (activeTab) {
                case 'audit-trail':
                    const auditResponse = await api.get(`/audit/date-range?start=${startDate}&end=${endDate}`);
                    setAuditTrail(auditResponse.data);
                    break;
                case 'user-activity':
                    const activityResponse = await api.get(`/user-activity/date-range?start=${startDate}&end=${endDate}`);
                    setUserActivity(activityResponse.data);
                    break;
                case 'change-history':
                    const changeResponse = await api.get(`/change-history/date-range?start=${startDate}&end=${endDate}`);
                    setChangeHistory(changeResponse.data);
                    break;
                case 'retention':
                    const retentionResponse = await api.get('/data-retention/policies');
                    setRetentionPolicies(retentionResponse.data);
                    break;
                case 'reports':
                    const reportsResponse = await api.get('/compliance/reports');
                    setComplianceReports(reportsResponse.data);
                    break;
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
            showToast('Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const generateReport = async (reportType) => {
        try {
            const startDate = new Date(dateRange.start).toISOString();
            const endDate = new Date(dateRange.end).toISOString();
            
            await api.post(`/compliance/reports/${reportType}?startDate=${startDate}&endDate=${endDate}`, {});
            showToast('Report generated successfully');
            if (activeTab === 'reports') {
                fetchData();
            }
        } catch (error) {
            showToast('Failed to generate report', 'error');
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE': return 'text-green-600 bg-green-100';
            case 'UPDATE': return 'text-blue-600 bg-blue-100';
            case 'DELETE': return 'text-red-600 bg-red-100';
            case 'LOGIN': return 'text-purple-600 bg-purple-100';
            case 'LOGOUT': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const tabs = [
        { id: 'audit-trail', label: 'Audit Trail', icon: FileText },
        { id: 'user-activity', label: 'User Activity', icon: History },
        { id: 'change-history', label: 'Change History', icon: Shield },
        { id: 'retention', label: 'Data Retention', icon: Database },
        { id: 'reports', label: 'Compliance Reports', icon: Download }
    ];

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Audit & Compliance</h2>
                <div className="flex gap-2">
                    <button onClick={() => generateReport('audit-trail')} className="btn btn-primary flex items-center gap-2">
                        <Download size={18} /> Export Audit Trail
                    </button>
                </div>
            </div>

            {/* Date Range Filter */}
            {activeTab !== 'retention' && activeTab !== 'reports' && (
                <div className="card">
                    <div className="flex items-center gap-4">
                        <Calendar size={20} className="text-secondary" />
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">From:</label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">To:</label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                        </div>
                        <button onClick={fetchData} className="btn btn-primary flex items-center gap-2">
                            <Filter size={18} /> Apply Filter
                        </button>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="flex gap-2 border-b pb-4 mb-4">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-accent text-white'
                                        : 'bg-slate-100 hover:bg-slate-200'
                                }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : (
                    <>
                        {/* Audit Trail Tab */}
                        {activeTab === 'audit-trail' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="p-3">Timestamp</th>
                                            <th className="p-3">User</th>
                                            <th className="p-3">Action</th>
                                            <th className="p-3">Entity</th>
                                            <th className="p-3">Changes</th>
                                            <th className="p-3">IP Address</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {auditTrail.map(audit => (
                                            <tr key={audit.id} className="hover:bg-slate-50">
                                                <td className="p-3">{new Date(audit.timestamp).toLocaleString()}</td>
                                                <td className="p-3 font-medium">{audit.username}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getActionColor(audit.action)}`}>
                                                        {audit.action}
                                                    </span>
                                                </td>
                                                <td className="p-3">{audit.entityType} #{audit.entityId}</td>
                                                <td className="p-3 text-secondary text-xs">{audit.changesSummary || 'N/A'}</td>
                                                <td className="p-3 text-secondary text-xs">{audit.ipAddress || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {auditTrail.length === 0 && (
                                    <div className="text-center py-10 text-secondary">No audit records found</div>
                                )}
                            </div>
                        )}

                        {/* User Activity Tab */}
                        {activeTab === 'user-activity' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="p-3">Timestamp</th>
                                            <th className="p-3">User</th>
                                            <th className="p-3">Activity</th>
                                            <th className="p-3">Description</th>
                                            <th className="p-3">Resource</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {userActivity.map(activity => (
                                            <tr key={activity.id} className="hover:bg-slate-50">
                                                <td className="p-3">{new Date(activity.timestamp).toLocaleString()}</td>
                                                <td className="p-3 font-medium">{activity.username}</td>
                                                <td className="p-3">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                                        {activity.activityType}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-secondary">{activity.activityDescription}</td>
                                                <td className="p-3 text-xs">
                                                    {activity.resourceType ? `${activity.resourceType} #${activity.resourceId}` : 'N/A'}
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        activity.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {activity.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {userActivity.length === 0 && (
                                    <div className="text-center py-10 text-secondary">No activity records found</div>
                                )}
                            </div>
                        )}

                        {/* Change History Tab */}
                        {activeTab === 'change-history' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="p-3">Changed At</th>
                                            <th className="p-3">Entity</th>
                                            <th className="p-3">Field</th>
                                            <th className="p-3">Old Value</th>
                                            <th className="p-3">New Value</th>
                                            <th className="p-3">Changed By</th>
                                            <th className="p-3">Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {changeHistory.map(change => (
                                            <tr key={change.id} className="hover:bg-slate-50">
                                                <td className="p-3">{new Date(change.changedAt).toLocaleString()}</td>
                                                <td className="p-3">{change.entityType} #{change.entityId}</td>
                                                <td className="p-3 font-medium">{change.fieldName}</td>
                                                <td className="p-3 text-red-600">{change.oldValue || 'N/A'}</td>
                                                <td className="p-3 text-green-600">{change.newValue}</td>
                                                <td className="p-3">{change.changedByUsername}</td>
                                                <td className="p-3 text-secondary text-xs">{change.changeReason || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {changeHistory.length === 0 && (
                                    <div className="text-center py-10 text-secondary">No change records found</div>
                                )}
                            </div>
                        )}

                        {/* Data Retention Tab */}
                        {activeTab === 'retention' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="p-3">Entity Type</th>
                                            <th className="p-3">Retention Days</th>
                                            <th className="p-3">Archive Enabled</th>
                                            <th className="p-3">Delete After Archive</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Last Execution</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {retentionPolicies.map(policy => (
                                            <tr key={policy.id} className="hover:bg-slate-50">
                                                <td className="p-3 font-medium">{policy.entityType}</td>
                                                <td className="p-3">{policy.retentionDays} days</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        policy.archiveEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {policy.archiveEnabled ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        policy.deleteAfterArchive ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {policy.deleteAfterArchive ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        policy.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {policy.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-xs text-secondary">
                                                    {policy.lastExecution ? new Date(policy.lastExecution).toLocaleString() : 'Never'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {retentionPolicies.length === 0 && (
                                    <div className="text-center py-10 text-secondary">No retention policies configured</div>
                                )}
                            </div>
                        )}

                        {/* Compliance Reports Tab */}
                        {activeTab === 'reports' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <button
                                        onClick={() => generateReport('audit-trail')}
                                        className="p-4 border rounded-lg hover:bg-slate-50 text-left"
                                    >
                                        <FileText className="text-accent mb-2" size={24} />
                                        <h3 className="font-semibold">Audit Trail Report</h3>
                                        <p className="text-sm text-secondary">Complete audit trail for selected period</p>
                                    </button>
                                    <button
                                        onClick={() => generateReport('user-activity')}
                                        className="p-4 border rounded-lg hover:bg-slate-50 text-left"
                                    >
                                        <History className="text-accent mb-2" size={24} />
                                        <h3 className="font-semibold">User Activity Report</h3>
                                        <p className="text-sm text-secondary">User activity logs and statistics</p>
                                    </button>
                                    <button
                                        onClick={() => generateReport('change-history')}
                                        className="p-4 border rounded-lg hover:bg-slate-50 text-left"
                                    >
                                        <Shield className="text-accent mb-2" size={24} />
                                        <h3 className="font-semibold">Change History Report</h3>
                                        <p className="text-sm text-secondary">Detailed change tracking report</p>
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b">
                                            <tr>
                                                <th className="p-3">Report Name</th>
                                                <th className="p-3">Type</th>
                                                <th className="p-3">Generated At</th>
                                                <th className="p-3">Period</th>
                                                <th className="p-3">Records</th>
                                                <th className="p-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {complianceReports.map(report => (
                                                <tr key={report.id} className="hover:bg-slate-50">
                                                    <td className="p-3 font-medium">{report.reportName}</td>
                                                    <td className="p-3">
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                                            {report.reportType}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">{new Date(report.generatedAt).toLocaleString()}</td>
                                                    <td className="p-3 text-xs text-secondary">
                                                        {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-3">{report.totalRecords}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                            report.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                            {report.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {complianceReports.length === 0 && (
                                        <div className="text-center py-10 text-secondary">No reports generated yet</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AuditCompliance;
