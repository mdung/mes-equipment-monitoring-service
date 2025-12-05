import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, Settings, Wifi, TrendingUp, TrendingDown, Minus, Calendar, RefreshCw, Maximize2, Grid } from 'lucide-react';
import api from '../services/api';
import websocketService from '../services/websocket';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalEquipment: 0,
        running: 0,
        down: 0,
        avgOee: 0,
    });
    const [statusData, setStatusData] = useState([]);
    const [productionTrend, setProductionTrend] = useState([]);
    const [oeeHistory, setOeeHistory] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [liveUpdates, setLiveUpdates] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [timeRange, setTimeRange] = useState('today');
    const [lastUpdate, setLastUpdate] = useState(new Date());

    useEffect(() => {
        fetchDashboardData();
        
        // Subscribe to real-time dashboard updates
        const subscription = websocketService.subscribe('/topic/dashboard', () => {
            if (autoRefresh) {
                fetchDashboardData();
            }
        });

        // Auto-refresh every 30 seconds
        const interval = autoRefresh ? setInterval(() => {
            fetchDashboardData();
        }, 30000) : null;

        return () => {
            if (subscription) subscription.unsubscribe();
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh, timeRange]);

    const fetchDashboardData = async () => {
        try {
            const dateRange = getDateRange(timeRange);
            
            const [statsRes, statusRes, alertsRes] = await Promise.all([
                api.get('/dashboard/stats'),
                api.get('/dashboard/equipment-status-distribution'),
                api.get('/alerts/unacknowledged').catch(() => ({ data: [] }))
            ]);
            
            setStats(statsRes.data);
            setAlerts(alertsRes.data.slice(0, 5)); // Top 5 alerts
            
            const statusColors = {
                RUNNING: '#22c55e',
                IDLE: '#eab308',
                DOWN: '#ef4444',
                MAINTENANCE: '#3b82f6'
            };
            
            const formattedStatus = Object.entries(statusRes.data).map(([name, value]) => ({
                name,
                value,
                color: statusColors[name] || '#6b7280'
            }));
            
            setStatusData(formattedStatus);
            
            // Generate mock trend data (replace with real API calls)
            generateTrendData();
            
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    const getDateRange = (range) => {
        const end = new Date();
        let start = new Date();
        
        switch (range) {
            case 'today':
                start.setHours(0, 0, 0, 0);
                break;
            case 'week':
                start.setDate(start.getDate() - 7);
                break;
            case 'month':
                start.setMonth(start.getMonth() - 1);
                break;
            default:
                start.setHours(0, 0, 0, 0);
        }
        
        return { start, end };
    };

    const generateTrendData = () => {
        // Generate production trend data
        const hours = timeRange === 'today' ? 24 : timeRange === 'week' ? 7 : 30;
        const prodData = Array.from({ length: hours }, (_, i) => ({
            time: timeRange === 'today' ? `${i}:00` : `Day ${i + 1}`,
            produced: Math.floor(Math.random() * 100) + 50,
            target: 120
        }));
        setProductionTrend(prodData);

        // Generate OEE history
        const oeeData = Array.from({ length: hours }, (_, i) => ({
            time: timeRange === 'today' ? `${i}:00` : `Day ${i + 1}`,
            oee: Math.floor(Math.random() * 30) + 60,
            availability: Math.floor(Math.random() * 20) + 75,
            performance: Math.floor(Math.random() * 20) + 70,
            quality: Math.floor(Math.random() * 15) + 80
        }));
        setOeeHistory(oeeData);
    };

    const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
        <div className="card">
            <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
                    <Icon className={color.replace('bg-', 'text-')} size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-semibold ${
                        trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                        {trend === 'up' ? <TrendingUp size={14} /> : trend === 'down' ? <TrendingDown size={14} /> : <Minus size={14} />}
                        {trendValue}
                    </div>
                )}
            </div>
            <p className="text-secondary text-sm mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    );

    const TimeRangeSelector = () => (
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
            {['today', 'week', 'month'].map((range) => (
                <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        timeRange === range
                            ? 'bg-white text-accent shadow-sm'
                            : 'text-secondary hover:text-primary'
                    }`}
                >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
            ))}
        </div>
    );

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header with Controls */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Factory Overview</h2>
                    <p className="text-sm text-secondary">Last updated: {lastUpdate.toLocaleTimeString()}</p>
                </div>
                <div className="flex items-center gap-3">
                    <TimeRangeSelector />
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`p-2 rounded-lg border ${autoRefresh ? 'bg-green-50 border-green-200' : 'bg-slate-50'}`}
                        title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
                    >
                        <RefreshCw size={18} className={autoRefresh ? 'text-green-600' : 'text-gray-600'} />
                    </button>
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                        <Wifi size={16} className={liveUpdates ? 'text-green-500' : 'text-gray-400'} />
                        <span className="text-sm text-secondary">
                            {liveUpdates ? 'Live' : 'Offline'}
                        </span>
                    </div>
                </div>
            </div>

            {/* KPI Cards with Trends */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Total Equipment" 
                    value={stats.totalEquipment} 
                    icon={Settings} 
                    color="text-blue-600" 
                    trend="stable"
                    trendValue="0%"
                />
                <StatCard 
                    title="Running" 
                    value={stats.running} 
                    icon={Activity} 
                    color="text-green-600" 
                    trend="up"
                    trendValue="+5%"
                />
                <StatCard 
                    title="Down" 
                    value={stats.down} 
                    icon={AlertTriangle} 
                    color="text-red-600" 
                    trend="down"
                    trendValue="-2%"
                />
                <StatCard 
                    title="Avg OEE" 
                    value={`${stats.avgOee}%`} 
                    icon={CheckCircle} 
                    color="text-purple-600" 
                    trend="up"
                    trendValue="+3%"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Equipment Status Distribution */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Equipment Status</h3>
                        <button className="p-1 hover:bg-slate-100 rounded" title="Expand">
                            <Maximize2 size={16} />
                        </button>
                    </div>
                    <div className="h-80">
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-secondary">No data</div>
                        )}
                    </div>
                </div>

                {/* Production Trend */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Production Trend</h3>
                        <button className="p-1 hover:bg-slate-100 rounded" title="Expand">
                            <Maximize2 size={16} />
                        </button>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={productionTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="produced" fill="#3b82f6" name="Produced" />
                                <Bar dataKey="target" fill="#e5e7eb" name="Target" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* OEE History */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">OEE History</h3>
                        <button className="p-1 hover:bg-slate-100 rounded" title="Expand">
                            <Maximize2 size={16} />
                        </button>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={oeeHistory}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="oee" stroke="#8b5cf6" strokeWidth={2} name="OEE" />
                                <Line type="monotone" dataKey="availability" stroke="#3b82f6" strokeWidth={1} name="Availability" />
                                <Line type="monotone" dataKey="performance" stroke="#10b981" strokeWidth={1} name="Performance" />
                                <Line type="monotone" dataKey="quality" stroke="#f59e0b" strokeWidth={1} name="Quality" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Alerts */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Recent Alerts</h3>
                        <span className="text-xs text-secondary">{alerts.length} unacknowledged</span>
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {alerts.length > 0 ? alerts.map((alert, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
                                <AlertTriangle size={18} className="text-red-500 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{alert.title}</p>
                                    <p className="text-xs text-secondary truncate">{alert.message}</p>
                                    <p className="text-xs text-secondary mt-1">
                                        {new Date(alert.triggeredAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-secondary text-sm">
                                <CheckCircle className="mx-auto mb-2 text-green-500" size={32} />
                                No active alerts
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
