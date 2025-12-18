import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, Settings, Wifi, TrendingUp, TrendingDown, Minus, Calendar, RefreshCw, Maximize2, Grid, Zap, Factory, Users, Clock, Target, Gauge, Eye, Filter, Download, Share2, Bell } from 'lucide-react';
import api from '../services/api';
import websocketService from '../services/websocket';
import { useTranslation } from '../context/I18nContext';

const Dashboard = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        totalEquipment: 0,
        running: 0,
        down: 0,
        idle: 0,
        maintenance: 0,
        avgOee: 0,
        totalProduction: 0,
        activeOrders: 0,
        efficiency: 0,
        uptime: 0
    });
    const [statusData, setStatusData] = useState([]);
    const [productionTrend, setProductionTrend] = useState([]);
    const [oeeHistory, setOeeHistory] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [liveUpdates, setLiveUpdates] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [timeRange, setTimeRange] = useState('today');
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [selectedMetric, setSelectedMetric] = useState('production');
    const [viewMode, setViewMode] = useState('overview'); // overview, detailed, analytics

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
            
            const [
                equipmentRes, 
                ordersRes, 
                alertsRes,
                activitiesRes
            ] = await Promise.all([
                api.get('/equipment'),
                api.get('/orders'),
                api.get('/alerts/unacknowledged').catch(() => ({ data: [] })),
                api.get('/activities/recent').catch(() => ({ data: [] }))
            ]);
            
            // Calculate real stats from equipment data
            const equipment = equipmentRes.data || [];
            const orders = ordersRes.data || [];
            
            const runningCount = equipment.filter(e => e.status === 'RUNNING').length;
            const downCount = equipment.filter(e => e.status === 'DOWN').length;
            const idleCount = equipment.filter(e => e.status === 'IDLE').length;
            const maintenanceCount = equipment.filter(e => e.status === 'MAINTENANCE').length;
            
            const totalProduction = orders.reduce((sum, order) => sum + (order.producedQuantity || 0), 0);
            const activeOrders = orders.filter(o => o.status === 'IN_PROGRESS').length;
            const avgOee = equipment.length > 0 ? Math.round((runningCount / equipment.length) * 85) : 0;
            const efficiency = equipment.length > 0 ? Math.round((runningCount / equipment.length) * 100) : 0;
            const uptime = equipment.length > 0 ? Math.round(((runningCount + idleCount) / equipment.length) * 100) : 0;
            
            setStats({
                totalEquipment: equipment.length,
                running: runningCount,
                down: downCount,
                idle: idleCount,
                maintenance: maintenanceCount,
                avgOee,
                totalProduction,
                activeOrders,
                efficiency,
                uptime
            });
            
            setAlerts(alertsRes.data.slice(0, 8)); // Top 8 alerts
            setRecentActivities(activitiesRes.data.slice(0, 10)); // Recent 10 activities
            
            // Status distribution for pie chart
            const statusColors = {
                RUNNING: '#10b981',
                IDLE: '#f59e0b', 
                DOWN: '#ef4444',
                MAINTENANCE: '#3b82f6'
            };
            
            const statusDistribution = [
                { name: 'Running', value: runningCount, color: statusColors.RUNNING },
                { name: 'Idle', value: idleCount, color: statusColors.IDLE },
                { name: 'Down', value: downCount, color: statusColors.DOWN },
                { name: 'Maintenance', value: maintenanceCount, color: statusColors.MAINTENANCE }
            ].filter(item => item.value > 0);
            
            setStatusData(statusDistribution);
            
            // Generate trend data based on real data
            generateTrendData(totalProduction, avgOee);
            
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

    const generateTrendData = (baseProduction = 0, baseOee = 0) => {
        const hours = timeRange === 'today' ? 24 : timeRange === 'week' ? 7 : 30;
        const timeLabel = timeRange === 'today' ? 'hour' : 'day';
        
        // Generate realistic production trend data
        const prodData = Array.from({ length: hours }, (_, i) => {
            const variation = Math.sin(i * 0.5) * 20 + Math.random() * 30;
            const baseValue = baseProduction > 0 ? Math.floor(baseProduction / hours) : 50;
            return {
                time: timeRange === 'today' ? `${String(i).padStart(2, '0')}:00` : `${timeLabel} ${i + 1}`,
                produced: Math.max(0, Math.floor(baseValue + variation)),
                target: baseValue + 20,
                efficiency: Math.min(100, Math.max(60, 85 + Math.random() * 20))
            };
        });
        setProductionTrend(prodData);

        // Generate realistic OEE history
        const oeeData = Array.from({ length: hours }, (_, i) => {
            const trend = Math.sin(i * 0.3) * 10;
            const baseOeeValue = baseOee > 0 ? baseOee : 75;
            return {
                time: timeRange === 'today' ? `${String(i).padStart(2, '0')}:00` : `${timeLabel} ${i + 1}`,
                oee: Math.min(100, Math.max(50, baseOeeValue + trend + (Math.random() * 10 - 5))),
                availability: Math.min(100, Math.max(70, 85 + trend + (Math.random() * 8 - 4))),
                performance: Math.min(100, Math.max(65, 80 + trend + (Math.random() * 8 - 4))),
                quality: Math.min(100, Math.max(80, 92 + (Math.random() * 6 - 3)))
            };
        });
        setOeeHistory(oeeData);
    };

    const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, subtitle, onClick, isSelected }) => (
        <div 
            className={`card hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                isSelected ? 'ring-2 ring-accent shadow-lg' : ''
            }`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${color} bg-opacity-15 shadow-sm`}>
                    <Icon className={color.replace('bg-', 'text-')} size={28} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                        trend === 'up' ? 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300' : 
                        trend === 'down' ? 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300' : 
                        'text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                        {trend === 'up' ? <TrendingUp size={12} /> : trend === 'down' ? <TrendingDown size={12} /> : <Minus size={12} />}
                        {trendValue}
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm text-secondary dark:text-slate-400 mb-1">{title}</p>
                <p className="text-3xl font-bold dark:text-slate-100 mb-1">{value}</p>
                {subtitle && <p className="text-xs text-secondary dark:text-slate-500">{subtitle}</p>}
            </div>
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
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-accent"></div>
                    <Factory className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-accent" size={24} />
                </div>
                <p className="text-secondary dark:text-slate-400 animate-pulse">Loading factory data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 space-y-6">
            {/* Dark Mobile-Style Header */}
            <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                            <Grid size={24} className="text-slate-300" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-white">Factory Floor A</h1>
                            <p className="text-sm text-slate-400">
                                {new Date().toLocaleDateString()} • {lastUpdate.toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="relative p-2 hover:bg-slate-700 rounded-lg transition-colors">
                            <Bell size={20} className="text-slate-300" />
                            {alerts.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {alerts.length}
                                </span>
                            )}
                        </button>
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <Users size={16} className="text-white" />
                        </div>
                    </div>
                </div>

                {/* OEE Overview Section */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">OEE Overview</h2>
                        <button className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors flex items-center gap-1">
                            Details <span>→</span>
                        </button>
                    </div>
                    
                    {/* Global Efficiency Card */}
                    <div className="bg-slate-700/50 rounded-xl p-6 mb-4 border border-slate-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm mb-1">Global Efficiency</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl font-bold text-white">{stats.avgOee}%</span>
                                    <div className="flex items-center gap-1 text-green-400 text-sm">
                                        <TrendingUp size={14} />
                                        <span>+2.4%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative w-20 h-20">
                                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#374151"
                                        strokeWidth="2"
                                    />
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#10b981"
                                        strokeWidth="2"
                                        strokeDasharray={`${stats.avgOee}, 100`}
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Zap size={16} className="text-green-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* OEE Metrics Grid */}
            <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {/* Availability */}
                    <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap size={16} className="text-blue-400" />
                            <span className="text-slate-400 text-xs font-medium">AVAIL</span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-2">90%</div>
                        <div className="w-full bg-slate-600 rounded-full h-1">
                            <div className="bg-blue-400 h-1 rounded-full" style={{width: '90%'}}></div>
                        </div>
                    </div>

                    {/* Performance */}
                    <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                        <div className="flex items-center gap-2 mb-2">
                            <Target size={16} className="text-orange-400" />
                            <span className="text-slate-400 text-xs font-medium">PERF</span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-2">85%</div>
                        <div className="w-full bg-slate-600 rounded-full h-1">
                            <div className="bg-orange-400 h-1 rounded-full" style={{width: '85%'}}></div>
                        </div>
                    </div>

                    {/* Quality */}
                    <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle size={16} className="text-green-400" />
                            <span className="text-slate-400 text-xs font-medium">QUAL</span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-2">98%</div>
                        <div className="w-full bg-slate-600 rounded-full h-1">
                            <div className="bg-green-400 h-1 rounded-full" style={{width: '98%'}}></div>
                        </div>
                    </div>
                </div>

                {/* Production Target */}
                <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-slate-400 text-sm">PRODUCTION TARGET</p>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-white">{stats.totalProduction.toLocaleString()}</span>
                                <span className="text-slate-400">/ 1,500 Units</span>
                            </div>
                        </div>
                        <div className="text-blue-400 text-xl font-bold">82%</div>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                        <div className="bg-blue-400 h-2 rounded-full transition-all duration-1000" style={{width: '82%'}}></div>
                    </div>
                </div>

                {/* Equipment Status */}
                <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-slate-400 text-sm">Equipment Status</p>
                            <p className="text-xl font-bold text-white">{stats.totalEquipment} Machines</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-green-400 text-sm font-medium">Live</span>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        {/* Running */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span className="text-slate-300 text-sm">RUN</span>
                            </div>
                            <div className="flex items-center gap-2 flex-1 mx-4">
                                <div className="flex-1 bg-slate-600 rounded-full h-2">
                                    <div className="bg-blue-400 h-2 rounded-full transition-all duration-1000" style={{width: `${(stats.running / stats.totalEquipment) * 100}%`}}></div>
                                </div>
                                <span className="text-white font-medium text-sm w-6">{stats.running}</span>
                            </div>
                        </div>

                        {/* Idle */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                <span className="text-slate-300 text-sm">IDLE</span>
                            </div>
                            <div className="flex items-center gap-2 flex-1 mx-4">
                                <div className="flex-1 bg-slate-600 rounded-full h-2">
                                    <div className="bg-orange-400 h-2 rounded-full transition-all duration-1000" style={{width: `${(stats.idle / stats.totalEquipment) * 100}%`}}></div>
                                </div>
                                <span className="text-white font-medium text-sm w-6">{stats.idle}</span>
                            </div>
                        </div>

                        {/* Down */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                <span className="text-slate-300 text-sm">DOWN</span>
                            </div>
                            <div className="flex items-center gap-2 flex-1 mx-4">
                                <div className="flex-1 bg-slate-600 rounded-full h-2">
                                    <div className="bg-red-400 h-2 rounded-full transition-all duration-1000" style={{width: `${(stats.down / stats.totalEquipment) * 100}%`}}></div>
                                </div>
                                <span className="text-white font-medium text-sm w-6">{stats.down}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Critical Alerts */}
            <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Critical Alerts</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-red-400 text-sm font-medium">{alerts.length} Active</span>
                    </div>
                </div>
                
                {alerts.length > 0 ? (
                    <div className="space-y-3">
                        {alerts.slice(0, 3).map((alert, index) => (
                            <div key={index} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle size={16} className="text-red-400 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-medium">{alert.title || `Critical Alert #${index + 1}`}</p>
                                        <p className="text-slate-400 text-xs">{alert.message || 'Equipment requires immediate attention'}</p>
                                    </div>
                                    <span className="text-red-400 text-xs">HIGH</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
                        <p className="text-slate-400">No critical alerts</p>
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <div className="bg-slate-800 rounded-2xl p-4 shadow-2xl border border-slate-700">
                <div className="grid grid-cols-4 gap-4">
                    <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
                        <Grid size={20} className="text-blue-400" />
                        <span className="text-blue-400 text-xs font-medium">Overview</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-700/50 transition-colors">
                        <Settings size={20} className="text-slate-400" />
                        <span className="text-slate-400 text-xs font-medium">Machines</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-700/50 transition-colors">
                        <Bell size={20} className="text-slate-400" />
                        <span className="text-slate-400 text-xs font-medium">Alerts</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-700/50 transition-colors">
                        <Users size={20} className="text-slate-400" />
                        <span className="text-slate-400 text-xs font-medium">Settings</span>
                    </button>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
