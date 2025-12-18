import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider } from './context/I18nContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import EquipmentList from './pages/EquipmentList';
import EquipmentDetails from './pages/EquipmentDetails';
import ProductionOrders from './pages/ProductionOrders';
import QualityChecks from './pages/QualityChecks';
import UserManagement from './pages/UserManagement';
import Reports from './pages/Reports';
import ReportsAnalytics from './pages/ReportsAnalytics';
import ProductionManagement from './pages/ProductionManagement';
import AlertManagement from './pages/AlertManagement';
import AuditCompliance from './pages/AuditCompliance';
import IntegrationAPIs from './pages/IntegrationAPIs';
import OEEDashboard from './pages/OEEDashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Maintenance from './pages/Maintenance';
import ShiftManagement from './pages/ShiftManagement';
import QualityManagement from './pages/QualityManagement';
import NotificationCenter from './pages/NotificationCenter';
import QRScanner from './pages/QRScanner';
import RealtimeMonitoring from './pages/RealtimeMonitoring';
import DataVisualization from './pages/DataVisualization';
import AlertNotifications from './components/AlertNotifications';
import OfflineIndicator from './components/OfflineIndicator';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import websocketService from './services/websocket';

function AppContent() {
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  useEffect(() => {
    // Initialize WebSocket connection
    websocketService.connect(
      () => console.log('Real-time monitoring connected'),
      (error) => console.error('WebSocket connection error:', error)
    );

    return () => {
      websocketService.disconnect();
    };
  }, []);

  return (
    <>
      <AlertNotifications />
      <OfflineIndicator />
      <PWAInstallPrompt />
      <KeyboardShortcutsHelp />
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="equipment" element={<EquipmentList />} />
            <Route path="equipment/:id" element={<EquipmentDetails />} />
            <Route path="orders" element={<ProductionOrders />} />
            <Route path="quality" element={<QualityChecks />} />
            <Route path="production" element={<ProductionManagement />} />
            <Route path="alerts" element={<AlertManagement />} />
            <Route path="audit" element={<AuditCompliance />} />
            <Route path="integrations" element={<IntegrationAPIs />} />
            <Route path="oee" element={<OEEDashboard />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="shifts" element={<ShiftManagement />} />
            <Route path="quality-management" element={<QualityManagement />} />
            <Route path="notifications" element={<NotificationCenter />} />
            <Route path="scan" element={<QRScanner />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="reports" element={<Reports />} />
            <Route path="reports-analytics" element={<ReportsAnalytics />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="realtime" element={<RealtimeMonitoring />} />
            <Route path="visualizations" element={<DataVisualization />} />
          </Route>
        </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
