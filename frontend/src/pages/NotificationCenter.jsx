import { useState, useEffect } from 'react';
import { Bell, Inbox, Archive, Settings, CheckCheck, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Toast from '../components/Toast';
import NotificationPreferences from '../components/notifications/NotificationPreferences';

function NotificationCenter() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inbox');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('ALL');
  const [toast, setToast] = useState(null);

  const tabs = [
    { id: 'inbox', name: 'Inbox', icon: Inbox },
    { id: 'preferences', name: 'Preferences', icon: Settings },
  ];

  const notificationTypes = ['ALL', 'ALERT', 'SYSTEM', 'REPORT', 'MAINTENANCE', 'QUALITY'];

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get(`/notifications/user/${user.id}`);
      setNotifications(response.data);
    } catch (error) {
      setToast({ message: 'Error fetching notifications', type: 'error' });
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get(`/notifications/user/${user.id}/unread/count`);
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      setToast({ message: 'Error marking notification as read', type: 'error' });
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put(`/notifications/user/${user.id}/read-all`);
      setToast({ message: 'All notifications marked as read', type: 'success' });
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      setToast({ message: 'Error marking all as read', type: 'error' });
    }
  };

  const archiveNotification = async (id) => {
    try {
      await api.put(`/notifications/${id}/archive`);
      setToast({ message: 'Notification archived', type: 'success' });
      fetchNotifications();
    } catch (error) {
      setToast({ message: 'Error archiving notification', type: 'error' });
    }
  };

  const deleteNotification = async (id) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      await api.delete(`/notifications/${id}`);
      setToast({ message: 'Notification deleted', type: 'success' });
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      setToast({ message: 'Error deleting notification', type: 'error' });
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 border-red-300 text-red-900';
      case 'ERROR': return 'bg-red-50 border-red-200 text-red-800';
      case 'WARNING': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'INFO': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ALERT': return '🚨';
      case 'SYSTEM': return '⚙️';
      case 'REPORT': return '📊';
      case 'MAINTENANCE': return '🔧';
      case 'QUALITY': return '✅';
      default: return '📬';
    }
  };

  const filteredNotifications = filter === 'ALL' 
    ? notifications.filter(n => !n.isArchived)
    : notifications.filter(n => n.notificationType === filter && !n.isArchived);

  return (
    <div className="p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
        <p className="text-gray-600 mt-1">Manage your notifications and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.name}
                {tab.id === 'inbox' && unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'inbox' && (
        <div>
          {/* Filter and Actions */}
          <div className="mb-4 flex justify-between items-center">
            <div className="flex gap-2">
              {notificationTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1 rounded text-sm ${
                    filter === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <CheckCheck className="w-4 h-4" />
                Mark All as Read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="space-y-2">
            {filteredNotifications.length === 0 ? (
              <div className="bg-white p-12 rounded-lg shadow text-center">
                <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notifications</h3>
                <p className="text-gray-600">You're all caught up!</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    p-4 rounded-lg border-l-4 transition-all
                    ${notification.isRead ? 'bg-white' : 'bg-blue-50'}
                    ${getSeverityColor(notification.severity)}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">{getTypeIcon(notification.notificationType)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{notification.title}</h3>
                          {!notification.isRead && (
                            <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded">New</span>
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="px-2 py-0.5 bg-gray-100 rounded">{notification.notificationType}</span>
                          {notification.severity && (
                            <span className="px-2 py-0.5 bg-gray-100 rounded">{notification.severity}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                          title="Mark as read"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => archiveNotification(notification.id)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                        title="Archive"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <NotificationPreferences userId={user.id} />
      )}
    </div>
  );
}

export default NotificationCenter;
