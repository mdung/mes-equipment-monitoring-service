import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, ClipboardList, Menu, Bell, ClipboardCheck, Users, LogOut, User as UserIcon, BarChart3, Package, AlertTriangle, Shield, Link2, Activity, Wrench, Clock, Award, Moon, Sun, Globe, X, Factory, Zap, Target, Gauge, Grid, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/I18nContext';
import LanguageSelector from './LanguageSelector';
import KeyboardShortcuts from './KeyboardShortcuts';

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, hasRole } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { t } = useTranslation();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setShowMobileMenu(false);
    }, [location.pathname]);



    // Main navigation items for sidebar
    const navItems = [
        { path: '/dashboard', label: t('navigation.dashboard'), icon: Home, category: 'main' },
        { path: '/realtime', label: 'Real-Time Monitoring', icon: Activity, category: 'main' },
        { path: '/visualizations', label: 'Data Visualization', icon: BarChart3, category: 'main' },
        { path: '/equipment', label: t('navigation.equipment'), icon: Factory, category: 'operations' },
        { path: '/orders', label: t('navigation.production_orders'), icon: ClipboardList, category: 'operations' },
        { path: '/production', label: t('navigation.production_management'), icon: Package, category: 'operations' },
        { path: '/quality', label: t('navigation.quality_checks'), icon: ClipboardCheck, category: 'quality' },
        { path: '/quality-management', label: t('navigation.quality_management'), icon: Award, category: 'quality' },
        { path: '/maintenance', label: t('navigation.maintenance'), icon: Wrench, category: 'maintenance' },
        { path: '/shifts', label: t('navigation.shift_management'), icon: Clock, category: 'management' },
        { path: '/alerts', label: t('navigation.alert_management'), icon: AlertTriangle, category: 'management' },
        { path: '/audit', label: t('navigation.audit_compliance'), icon: Shield, category: 'management' },
        { path: '/integrations', label: t('navigation.integration_apis'), icon: Link2, category: 'system' },
        { path: '/oee', label: t('navigation.oee_dashboard'), icon: Gauge, category: 'analytics' },
        { path: '/reports', label: t('navigation.analytics_reports'), icon: BarChart3, category: 'analytics' },
        { path: '/reports-analytics', label: t('navigation.reports_analytics'), icon: BarChart3, category: 'analytics' },
        { path: '/settings', label: t('navigation.settings'), icon: Settings, category: 'system' },
        { path: '/users', label: t('navigation.user_management'), icon: Users, adminOnly: true, category: 'system' },
    ].filter(item => !item.adminOnly || hasRole('ADMIN'));

    // Bottom navigation items (mobile-style)
    const bottomNavItems = [
        { path: '/dashboard', label: 'Overview', icon: Grid },
        { path: '/equipment', label: 'Machines', icon: Factory },
        { path: '/alerts', label: 'Alerts', icon: Bell },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-slate-900 text-white">
            {/* Mobile Menu Overlay */}
            {showMobileMenu && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 z-40 lg:hidden"
                    onClick={() => setShowMobileMenu(false)}
                />
            )}

            {/* Dark Sidebar - Mobile & Desktop */}
            <aside className={`fixed inset-y-0 left-0 w-72 bg-slate-800 border-r border-slate-700 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
                showMobileMenu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}>
                {/* Sidebar Header */}
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-xl">
                                <Factory size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">MES Pro</h1>
                                <p className="text-xs text-slate-400">Equipment Monitoring</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowMobileMenu(false)}
                            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {/* Main Section */}
                    <div className="mb-6">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">Main</h3>
                        {navItems.filter(item => item.category === 'main').map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setShowMobileMenu(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg'
                                            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="font-medium">{item.label}</span>
                                    {isActive && <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full"></div>}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Operations Section */}
                    <div className="mb-6">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">Operations</h3>
                        {navItems.filter(item => item.category === 'operations').map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setShowMobileMenu(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span className="text-sm">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Quality & Maintenance */}
                    <div className="mb-6">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">Quality & Maintenance</h3>
                        {navItems.filter(item => ['quality', 'maintenance'].includes(item.category)).map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setShowMobileMenu(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span className="text-sm">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Analytics & Reports */}
                    <div className="mb-6">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">Analytics</h3>
                        {navItems.filter(item => item.category === 'analytics').map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setShowMobileMenu(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span className="text-sm">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Management & System */}
                    <div>
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">System</h3>
                        {navItems.filter(item => ['management', 'system'].includes(item.category)).map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setShowMobileMenu(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                            ? 'bg-slate-600/50 text-slate-200 border border-slate-500/30'
                                            : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span className="text-sm">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-700 space-y-3">
                    {/* User Profile */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-3 w-full p-3 hover:bg-slate-700/50 rounded-xl transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-white">{user?.fullName || user?.username}</p>
                                <p className="text-xs text-slate-400">{user?.role}</p>
                            </div>
                        </button>
                        
                        {showUserMenu && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-700 border border-slate-600 rounded-xl shadow-2xl overflow-hidden">
                                <button 
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        navigate('/profile');
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-slate-600 flex items-center gap-3 text-sm text-white transition-colors"
                                >
                                    <UserIcon size={16} />
                                    {t('navigation.profile')}
                                </button>
                                <button 
                                    onClick={async () => {
                                        await logout();
                                        navigate('/login');
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-slate-600 flex items-center gap-3 text-sm text-red-400 transition-colors"
                                >
                                    <LogOut size={16} />
                                    {t('navigation.logout')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:ml-72">
                {/* Mobile Top Bar */}
                <header className="lg:hidden h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
                    <button 
                        onClick={() => setShowMobileMenu(true)}
                        className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-500 rounded-lg">
                            <Factory size={20} className="text-white" />
                        </div>
                        <h1 className="text-lg font-bold text-white">MES Pro</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => navigate('/notifications')}
                            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg relative transition-colors"
                        >
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                            {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-slate-900">
                    <Outlet />
                </main>

                {/* Mobile Bottom Navigation */}
                <div className="lg:hidden bg-slate-800 border-t border-slate-700 px-4 py-2">
                    <div className="grid grid-cols-4 gap-1">
                        {bottomNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${isActive
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="text-xs font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;
