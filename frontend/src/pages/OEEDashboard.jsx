import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Activity, Award, Calendar, RefreshCw } from 'lucide-react';
import api from '../services/api';
import Toast from '../components/Toast';

const OEEDashboard = () => {
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [equipment, setEquipment] = useState([]);
    const [oeeBreakdown, setOeeBreakdown] = useState(null);
    const [oeeTrends, setOeeTrends] = useState([]);
    const [benchmark, setBenchmark] = useState(null);
    const [targetVsActual, setTargetVsActual] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchEquipment();
    }, []);

    useEffect(() => {
        if (selectedEquipment) {
            fetchOEEData();
        }
    }, [selectedEquipment, dateRange]);

    const fetchEquipment = async () => {
        try {
            const response = await api.get('/equipment');
            setEquipment(response.data);
            if (response.data.length > 0) {
                setSelectedEquipment(response.data[0].id);
            }
        } catch (error) {
            showToast('Failed to fetch equipment', 'error');
        }
    };

    const fetchOEEData = async () => {
        if (!selectedEquipment) return;
        
        setLoading(true);
        try {
            const startDate = new Date(dateRange.start).toISOString();
            const endDate = new Date(dateRange.end).toISOString();

            // Fetch OEE breakdown
            const breakdownResponse = await api.get(
                `/oee/breakdown/${selectedEquipment}?start=${startDate}&end=${endDate}`
            );
            setOeeBreakdown(breakdownResponse.data);

            // Fetch trends
            const trendsResponse = await api.get(
                `/oee/trends/${selectedEquipment}?period=DAILY&start=${startDate}&end=${endDate}`
            );
            setOeeTrends(trendsResponse.data);

            // Fetch benchmark
            const benchmarkResponse = await api.get(`/oee/benchmark/${selectedEquipment}`);
            setBenchmark(benchmarkResponse.data);

            // Fetch target vs actual
            const targetResponse = await api.get(
                `/oee/target-vs-actual/${selectedEquipment}?start=${startDate}&end=${endDate}`
            );
            setTargetVsActual(targetResponse.data);

        } catch (error) {
            console.error('Failed to fetch OEE data', error);
            showToast('Failed to fetch OEE data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const calculateOEE = async () => {
        if (!selectedEquipment) return;
        
        setLoading(true);
        try {
            const startDate = new Date(dateRange.start).toISOString();
            const endDate = new Date(dateRange.end).toISOString();

            await api.post(`/oee/calculate/${selectedEquipment}?start=${startDate}&end=${endDate}`);
            showToast('OEE calculated successfully');
            fetchOEEData();
        } catch (error) {
            showToast('Failed to calculate OEE', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const getOEEColor = (value) => {
        if (value >= 85) return 'text-green-600 bg-green-100';
        if (value >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getMetricColor = (value) => {
        if (value >= 90) return 'text-green-600';
        if (value >= 75) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">OEE Dashboard</h2>
                <button onClick={calculateOEE} disabled={loading} 
                        className="btn btn-primary flex items-center gap-2 disabled:opacity-50">
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    Calculate OEE
                </button>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium mb-1">Equipment</label>
                        <select value={selectedEquipment || ''} 
                                onChange={(e) => setSelectedEquipment(Number(e.target.value))}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent">
                            {equipment.map(eq => (
                                <option key={eq.id} value={eq.id}>{eq.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <input type="date" value={dateRange.start}
                               onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                               className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <input type="date" value={dateRange.end}
                               onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                               className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                </div>
            </div>

            {loading && !oeeBreakdown ? (
                <div className="text-center py-10">Loading OEE data...</div>
            ) : oeeBreakdown ? (
                <>
                    {/* OEE Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="card">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-secondary">Overall OEE</span>
                                <Activity className="text-accent" size={20} />
                            </div>
                            <div className={`text-3xl font-bold mb-1 ${getMetricColor(oeeBreakdown.oee)}`}>
                                {oeeBreakdown.oee?.toFixed(1)}%
                            </div>
                            <div className={`text-xs px-2 py-1 rounded inline-block ${getOEEColor(oeeBreakdown.oee)}`}>
                                {oeeBreakdown.oee >= 85 ? 'World Class' : oeeBreakdown.oee >= 60 ? 'Good' : 'Needs Improvement'}
                            </div>
                        </div>

                        <div className="card">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-secondary">Availability</span>
                                <TrendingUp className="text-blue-500" size={20} />
                            </div>
                            <div className={`text-3xl font-bold ${getMetricColor(oeeBreakdown.availability)}`}>
                                {oeeBreakdown.availability?.toFixed(1)}%
                            </div>
                            <div className="text-xs text-secondary mt-1">
                                Operating Time / Planned Time
                            </div>
                        </div>

                        <div className="card">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-secondary">Performance</span>
                                <Target className="text-purple-500" size={20} />
                            </div>
                            <div className={`text-3xl font-bold ${getMetricColor(oeeBreakdown.performance)}`}>
                                {oeeBreakdown.performance?.toFixed(1)}%
                            </div>
                            <div className="text-xs text-secondary mt-1">
                                Actual / Ideal Production
                            </div>
                        </div>

                        <div className="card">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-secondary">Quality</span>
                                <Award className="text-green-500" size={20} />
                            </div>
                            <div className={`text-3xl font-bold ${getMetricColor(oeeBreakdown.quality)}`}>
                                {oeeBreakdown.quality?.toFixed(1)}%
                            </div>
                            <div className="text-xs text-secondary mt-1">
                                Good Pieces / Total Pieces
                            </div>
                        </div>
                    </div>

                    {/* Benchmark Comparison */}
                    {benchmark && (
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Award size={20} />
                                Benchmark Comparison
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-slate-50 rounded-lg">
                                    <div className="text-sm text-secondary mb-1">Current OEE</div>
                                    <div className="text-2xl font-bold text-accent">
                                        {benchmark.current?.toFixed(1)}%
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-sm text-secondary mb-1">Target</div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {benchmark.target?.toFixed(1)}%
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-sm text-secondary mb-1">World Class</div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {benchmark.worldClass?.toFixed(1)}%
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <div className="text-sm text-secondary mb-1">Industry Avg</div>
                                    <div className="text-2xl font-bold text-purple-600">
                                        {benchmark.industryBenchmark?.toFixed(1) || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* OEE Trends */}
                    {oeeTrends && oeeTrends.length > 0 && (
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <TrendingUp size={20} />
                                OEE Trends
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="p-3 text-left">Period</th>
                                            <th className="p-3 text-right">Avg OEE</th>
                                            <th className="p-3 text-right">Availability</th>
                                            <th className="p-3 text-right">Performance</th>
                                            <th className="p-3 text-right">Quality</th>
                                            <th className="p-3 text-center">Trend</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {oeeTrends.map((trend, index) => (
                                            <tr key={index} className="hover:bg-slate-50">
                                                <td className="p-3">
                                                    {new Date(trend.periodStart).toLocaleDateString()}
                                                </td>
                                                <td className={`p-3 text-right font-semibold ${getMetricColor(trend.avgOee)}`}>
                                                    {trend.avgOee?.toFixed(1)}%
                                                </td>
                                                <td className="p-3 text-right">{trend.avgAvailability?.toFixed(1)}%</td>
                                                <td className="p-3 text-right">{trend.avgPerformance?.toFixed(1)}%</td>
                                                <td className="p-3 text-right">{trend.avgQuality?.toFixed(1)}%</td>
                                                <td className="p-3 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        trend.trendDirection === 'IMPROVING' ? 'bg-green-100 text-green-700' :
                                                        trend.trendDirection === 'DECLINING' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {trend.trendDirection}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Target vs Actual */}
                    {targetVsActual && targetVsActual.dataPoints && targetVsActual.dataPoints.length > 0 && (
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Target size={20} />
                                Target vs Actual Tracking
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="p-3 text-left">Timestamp</th>
                                            <th className="p-3 text-right">Actual OEE</th>
                                            <th className="p-3 text-right">Target OEE</th>
                                            <th className="p-3 text-right">Variance</th>
                                            <th className="p-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {targetVsActual.dataPoints.map((point, index) => (
                                            <tr key={index} className="hover:bg-slate-50">
                                                <td className="p-3">
                                                    {new Date(point.timestamp).toLocaleString()}
                                                </td>
                                                <td className={`p-3 text-right font-semibold ${getMetricColor(point.actual)}`}>
                                                    {point.actual?.toFixed(1)}%
                                                </td>
                                                <td className="p-3 text-right text-blue-600">
                                                    {point.target?.toFixed(1)}%
                                                </td>
                                                <td className={`p-3 text-right font-semibold ${
                                                    point.variance >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {point.variance >= 0 ? '+' : ''}{point.variance?.toFixed(1)}%
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        point.variance >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {point.variance >= 0 ? 'Above Target' : 'Below Target'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* OEE Formula Explanation */}
                    <div className="card bg-blue-50 border-blue-200">
                        <h3 className="text-lg font-semibold mb-3">OEE Calculation Formula</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">OEE =</span>
                                <span className="text-blue-600">Availability</span>
                                <span>×</span>
                                <span className="text-purple-600">Performance</span>
                                <span>×</span>
                                <span className="text-green-600">Quality</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div className="bg-white p-3 rounded">
                                    <div className="font-semibold text-blue-600 mb-1">Availability</div>
                                    <div className="text-xs text-secondary">
                                        Operating Time ÷ Planned Production Time
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded">
                                    <div className="font-semibold text-purple-600 mb-1">Performance</div>
                                    <div className="text-xs text-secondary">
                                        Actual Production ÷ Ideal Production
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded">
                                    <div className="font-semibold text-green-600 mb-1">Quality</div>
                                    <div className="text-xs text-secondary">
                                        Good Pieces ÷ Total Pieces Produced
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="card text-center py-10">
                    <Calendar className="mx-auto text-secondary mb-4" size={48} />
                    <p className="text-secondary">Select equipment and date range to view OEE data</p>
                </div>
            )}
        </div>
    );
};

export default OEEDashboard;
