import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [toast, setToast] = useState(null);
    const { hasRole } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        role: 'OPERATOR'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
            showToast('Failed to fetch users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                email: user.email,
                password: '',
                fullName: user.fullName || '',
                role: user.role
            });
        } else {
            setEditingUser(null);
            setFormData({ username: '', email: '', password: '', fullName: '', role: 'OPERATOR' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData({ username: '', email: '', password: '', fullName: '', role: 'OPERATOR' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, {
                    email: formData.email,
                    fullName: formData.fullName,
                    role: formData.role
                });
                showToast('User updated successfully');
            } else {
                await api.post('/users', formData);
                showToast('User created successfully');
            }
            fetchUsers();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save user', error);
            showToast(error.response?.data?.message || 'Failed to save user', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            showToast('User deleted successfully');
            fetchUsers();
        } catch (error) {
            console.error('Failed to delete user', error);
            showToast('Failed to delete user', 'error');
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-100 text-purple-700';
            case 'SUPERVISOR': return 'bg-blue-100 text-blue-700';
            case 'OPERATOR': return 'bg-green-100 text-green-700';
            case 'VIEWER': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (!hasRole('ADMIN')) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Shield size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                    <p className="text-secondary">You don't have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">User Management</h2>
                <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center gap-2">
                    <Plus size={18} /> Add User
                </button>
            </div>

            <div className="card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-semibold text-secondary">Username</th>
                            <th className="p-4 font-semibold text-secondary">Email</th>
                            <th className="p-4 font-semibold text-secondary">Full Name</th>
                            <th className="p-4 font-semibold text-secondary">Role</th>
                            <th className="p-4 font-semibold text-secondary">Status</th>
                            <th className="p-4 font-semibold text-secondary">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="6" className="p-4 text-center">Loading...</td></tr>
                        ) : users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50">
                                <td className="p-4 font-medium">{user.username}</td>
                                <td className="p-4 text-secondary">{user.email}</td>
                                <td className="p-4 text-secondary">{user.fullName || '-'}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {user.enabled ? 'Active' : 'Disabled'}
                                    </span>
                                </td>
                                <td className="p-4 flex gap-2">
                                    <button onClick={() => handleOpenModal(user)} className="p-1 text-accent hover:bg-accent/10 rounded">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(user.id)} className="p-1 text-danger hover:bg-danger/10 rounded">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!loading && users.length === 0 && (
                            <tr><td colSpan="6" className="p-4 text-center text-secondary">No users found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? 'Edit User' : 'Add User'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!editingUser && (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1">Username</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength="6"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>
                        </>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            <option value="ADMIN">Admin</option>
                            <option value="SUPERVISOR">Supervisor</option>
                            <option value="OPERATOR">Operator</option>
                            <option value="VIEWER">Viewer</option>
                        </select>
                    </div>
                    <div className="flex gap-2 pt-4">
                        <button type="submit" className="btn btn-primary flex-1">
                            {editingUser ? 'Update' : 'Create'}
                        </button>
                        <button type="button" onClick={handleCloseModal} className="btn bg-slate-200 hover:bg-slate-300 flex-1">
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default UserManagement;
