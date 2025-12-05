import { useState, useEffect } from 'react';
import { Save, Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';
import api from '../../services/api';
import Toast from '../Toast';

function NotificationPreferences({ userId }) {
  const [preferences, setPreferences] = useState([]);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const notificationTypes = [
    { value: 'ALERT', label: 'Alerts', description: 'Equipment alerts and critical notifications', icon: Bell },
    { value: 'SYSTEM', label: 'System', description: 'System updates and maintenance notices', icon: Bell },
    { value: 'REPORT', label: 'Reports', description: 'Scheduled reports and analytics', icon: Bell },
    { value: 'MAINTENANCE', label: 'Maintenance', description: 'Maintenance tasks and schedules', icon: Bell },
    { value: 'QUALITY', label: 'Quality', description: 'Quality checks and defect notifications', icon: Bell },
  ];

  const severityLevels = [
    { value: 'INFO', label: 'All (Info and above)' },
    { value: 'WARNING', label: 'Warning and above' },
    { value: 'ERROR', label: 'Error and above' },
    { value: 'CRITICAL', label: 'Critical only' },
  ];

  useEffect(() => {
    fetchPreferences();
  }, [userId]);

  const fetchPreferences = async () => {
    try {
      const response = await api.get(`/notifications/preferences/user/${userId}`);
      setPreferences(response.data);
    } catch (error) {
      setToast({ message: 'Error fetching preferences', type: 'error' });
    }
  };

  const updatePreference = async (preference) => {
    setSaving(true);
    try {
      await api.put(`/notifications/preferences/${preference.id}`, preference);
      setToast({ message: 'Preferences saved successfully', type: 'success' });
      fetchPreferences();
    } catch (error) {
      setToast({ message: 'Error saving preferences', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (prefId, field) => {
    const updatedPrefs = preferences.map(pref => {
      if (pref.id === prefId) {
        const updated = { ...pref, [field]: !pref[field] };
        updatePreference(updated);
        return updated;
      }
      return pref;
    });
    setPreferences(updatedPrefs);
  };

  const handleSeverityChange = (prefId, severity) => {
    const updatedPrefs = preferences.map(pref => {
      if (pref.id === prefId) {
        const updated = { ...pref, minSeverity: severity };
        updatePreference(updated);
        return updated;
      }
      return pref;
    });
    setPreferences(updatedPrefs);
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h2 className="text-xl font-semibold">Notification Preferences</h2>
        <p className="text-gray-600">Configure how you receive notifications for different types of events</p>
      </div>

      <div className="space-y-4">
        {notificationTypes.map((type) => {
          const preference = preferences.find(p => p.notificationType === type.value);
          const Icon = type.icon;

          if (!preference) return null;

          return (
            <div key={type.value} className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <Icon className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">{type.label}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Delivery Methods */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Delivery Methods</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preference.webEnabled}
                        onChange={() => handleToggle(preference.id, 'webEnabled')}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <Bell className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">Web Notifications</span>
                    </label>

                    <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preference.emailEnabled}
                        onChange={() => handleToggle(preference.id, 'emailEnabled')}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <Mail className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">Email Notifications</span>
                    </label>

                    <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preference.smsEnabled}
                        onChange={() => handleToggle(preference.id, 'smsEnabled')}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <MessageSquare className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">SMS Notifications</span>
                    </label>

                    <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preference.pushEnabled}
                        onChange={() => handleToggle(preference.id, 'pushEnabled')}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <Smartphone className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">Push Notifications</span>
                    </label>
                  </div>
                </div>

                {/* Severity Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Minimum Severity</h4>
                  <select
                    value={preference.minSeverity}
                    onChange={(e) => handleSeverityChange(preference.id, e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    {severityLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Only receive notifications at or above this severity level
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {saving && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          Saving preferences...
        </div>
      )}
    </div>
  );
}

export default NotificationPreferences;
