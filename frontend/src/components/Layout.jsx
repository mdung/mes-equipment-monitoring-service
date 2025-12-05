import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, ClipboardList, Menu, Bell, ClipboardCheck, Users, LogOut, User as UserIcon, BarChart3, Package, AlertTriangle, Shield, Link2, Activity, Wrench, Clock, Award, Moon, Sun, Globe, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import KeyboardShortcuts from './KeyboardShortcuts';

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, hasRole } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { i18n, t } = useTranslation();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setShowMobileMenu(false);
    }, [location.pathname]);

    const languages = [
        { code: 'en', name: t('language.english') },
        { code: 'es', name: t('language.spanish') },
        { code: 'fr', name: t('language.french') },
        { code: 'de', name: t('language.german') },
    ];

    const changeLanguage = (langCode) => {
        i18n.changeLanguage(langCode);
        setShowLanguageMenu(false);
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/realtime', label: 'Real-Time Monitoring', icon: Activity },
        { path: '/visualizations', label: 'Data Visualization', icon: BarChart3 },
        { path: '/equipment', label: 'Equipment', icon: Settings },
        { path: '/orders', label: 'Production Orders', icon: ClipboardList },
        { path: '/production', label: 'Production Management', icon: Package },
        { path: '/quality', label: 'Quality Checks', icon: ClipboardCheck },
        { path: '/quality-management', label: 'Quality Management', icon: Award },
        { path: '/maintenance', label: 'Maintenance', icon: Wrench },
        { path: '/shifts', label: 'Shift Management', icon: Clock },
        { path: '/alerts', label: 'Alert Management', icon: AlertTriangle },
        { path: '/audit', label: 'Audit & Compliance', icon: Shield },
        { path: '/integrations', label: 'Integration APIs', icon: Link2 },
        { path: '/oee', label: 'OEE Dashboard', icon: Activity },
        { path: '/reports', label: 'Analytics & Reports', icon: BarChart3 },
        { path: '/reports-analytics', label: 'Reports & Analytics', icon: BarChart3 },
        { path: '/users', label: 'User Management', icon: Users, adminOnly: true },
    ].filter(item => !item.adminOnly || hasRole('ADMIN'));

    return (
        <div className="flex h-screen bg-background dark:bg-slate-900">
            {/* Mobile Menu Overlay */}
            {showMobileMenu && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setShowMobileMenu(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-surface dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
                showMobileMenu ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-accent">MES Pro</h1>
                        <p className="text-xs text-secondary dark:text-slate-400">Equipment Monitoring</p>
                    </div>
                    <button
                        onClick={() => setShowMobileMenu(false)}
                        className="p-2 text-secondary dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                    >
                        <X size={20} />
                    </button>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setShowMobileMenu(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[44px] ${isActive
                                        ? 'bg-accent/10 text-accent font-medium'
                                        : 'text-secondary dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <Icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-secondary dark:text-slate-300 min-h-[44px]"
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        <span className="text-sm">{isDark ? t('theme.lightMode') : t('theme.darkMode')}</span>
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-secondary dark:text-slate-300 min-h-[44px]"
                        >
                            <Globe size={18} />
                            <span className="text-sm flex-1 text-left">{t('language.language')}</span>
                        </button>
                        {showLanguageMenu && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => changeLanguage(lang.code)}
                                        className={`w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-sm min-h-[44px] ${
                                            i18n.language === lang.code ? 'bg-accent/10 text-accent' : ''
                                        }`}
                                    >
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <button 
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-3 w-full hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-lg transition-colors min-h-[44px]"
                        >
                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium dark:text-slate-200">{user?.fullName || user?.username}</p>
                                <p className="text-xs text-secondary dark:text-slate-400">{user?.role}</p>
                            </div>
                        </button>
                        {showUserMenu && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
                                <button 
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        navigate('/profile');
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-sm dark:text-slate-200 min-h-[44px]"
                                >
                                    <UserIcon size={16} />
                                    Profile
                                </button>
                                <button 
                                    onClick={async () => {
                                        await logout();
                                        navigate('/login');
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 min-h-[44px]"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Desktop Sidebar */}
            <aside className="w-64 bg-surface dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h1 className="text-2xl font-bold text-accent">MES Pro</h1>
                    <p className="text-xs text-secondary dark:text-slate-400 mt-1">Equipment Monitoring</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[44px] ${isActive
                                        ? 'bg-accent/10 text-accent font-medium'
                                        : 'text-secondary dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <Icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-secondary dark:text-slate-300"
                        title={isDark ? t('theme.lightMode') : t('theme.darkMode')}
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        <span className="text-sm">{isDark ? t('theme.lightMode') : t('theme.darkMode')}</span>
                    </button>

                    {/* Language Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-secondary dark:text-slate-300"
                        >
                            <Globe size={18} />
                            <span className="text-sm flex-1 text-left">{t('language.language')}</span>
                        </button>
                        {showLanguageMenu && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => changeLanguage(lang.code)}
                                        className={`w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-sm ${
                                            i18n.language === lang.code ? 'bg-accent/10 text-accent' : ''
                                        }`}
                                    >
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-3 w-full hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-lg transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium dark:text-slate-200">{user?.fullName || user?.username}</p>
                                <p className="text-xs text-secondary dark:text-slate-400">{user?.role}</p>
                            </div>
                        </button>
                        
                        {showUserMenu && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
                                <button 
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        navigate('/profile');
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-sm dark:text-slate-200"
                                >
                                    <UserIcon size={16} />
                                    Profile
                                </button>
                                <button 
                                    onClick={async () => {
                                        await logout();
                                        navigate('/login');
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navbar */}
                <header className="h-16 bg-surface dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-6">
                    <button 
                        onClick={() => setShowMobileMenu(true)}
                        className="md:hidden p-2 text-secondary dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Open menu"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="md:hidden flex-1">
                        <h1 className="text-lg font-bold text-accent">MES Pro</h1>
                    </div>
                    <div className="flex items-center gap-4 ml-auto">
                        <KeyboardShortcuts />
                        <button 
                            onClick={() => navigate('/notifications')}
                            className="p-2 text-secondary dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full relative"
                        >
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-4 md:p-6 bg-background dark:bg-slate-900">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
