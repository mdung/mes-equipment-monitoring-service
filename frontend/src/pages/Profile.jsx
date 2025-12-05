import React, { useState } from 'react';
import { User, Mail, Shield, Lock, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Toast from '../components/Toast';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const [profileData, setProfileData] = useState({
        email: user?.email || '',
        fullName: user?.fullName || ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.put(`/users/${user.id}`, profileData);
            updateUser(response.data);
            showToast('Profile updated successfully');
        } catch (error) {
            showToast('Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        setLoading(true);

        try {
            await api.post('/users/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            showToast('Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to change password', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <h2 className="text-2xl font-bold">My Profile</h2>

            {/* Profile Information */}
            <div className="card">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                        <User className="text-accent" size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">{user?.fullName || user?.username}</h3>
                        <p className="text-secondary text-sm">@{user?.username}</p>
                    </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" size={18} />
                                <input
                                    type="text"
                                    value={user?.username}
                                    disabled
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-slate-50 cursor-not-allowed"
                                />
                            </div>
                            <p className="text-xs text-secondary mt-1">Username cannot be changed</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Role</label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" size={18} />
                                <input
                                    type="text"
                                    value={user?.role}
                                    disabled
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-slate-50 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" size={18} />
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" size={18} />
                                <input
                                    type="text"
                                    value={profileData.fullName}
                                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save size={18} />
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>

            {/* Change Password */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Lock size={20} />
                    Change Password
                </h3>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Current Password</label>
                        <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">New Password</label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                                required
                                minLength="6"
                            />
                            <p className="text-xs text-secondary mt-1">Minimum 6 characters</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                                required
                                minLength="6"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
                        >
                            <Lock size={18} />
                            Change Password
                        </button>
                    </div>
                </form>
            </div>

            {/* Account Information */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-secondary">Account Status</span>
                        <span className={`font-semibold ${user?.enabled ? 'text-green-600' : 'text-red-600'}`}>
                            {user?.enabled ? 'Active' : 'Disabled'}
                        </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-secondary">Member Since</span>
                        <span className="font-semibold">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-secondary">Last Updated</span>
                        <span className="font-semibold">
                            {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
