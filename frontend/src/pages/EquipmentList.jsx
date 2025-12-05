import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import AdvancedSearch from '../components/AdvancedSearch';
import BulkActions from '../components/BulkActions';
import ImportExport from '../components/ImportExport';
import PrintButton from '../components/PrintButton';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { exportToCSV } from '../utils/importExport';

const EquipmentList = () => {
    const { t } = useTranslation();
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterValues, setFilterValues] = useState({});
    const [selectedItems, setSelectedItems] = useState([]);
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        location: '',
        status: 'IDLE'
    });

    const statusOptions = [
        { value: 'RUNNING', label: 'RUNNING' },
        { value: 'IDLE', label: 'IDLE' },
        { value: 'DOWN', label: 'DOWN' },
        { value: 'MAINTENANCE', label: 'MAINTENANCE' },
    ];

    const filters = [
        {
            key: 'status',
            label: t('filters.status'),
            type: 'select',
            options: statusOptions,
        },
    ];

    // Keyboard shortcuts
    useKeyboardShortcuts([
        { key: 'ctrl+n', handler: () => handleOpenModal(), preventDefault: true },
        { key: 'ctrl+k', handler: () => document.querySelector('input[type="text"]')?.focus(), preventDefault: true },
    ]);

    const fetchEquipment = async () => {
        try {
            const response = await api.get('/equipment');
            setEquipment(response.data);
        } catch (error) {
            console.error('Failed to fetch equipment', error);
            showToast(t('equipment.title') + ' - ' + t('common.loading'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEquipment();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingEquipment(item);
            setFormData({
                name: item.name,
                code: item.code,
                location: item.location,
                status: item.status
            });
        } else {
            setEditingEquipment(null);
            setFormData({ name: '', code: '', location: '', status: 'IDLE' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEquipment(null);
        setFormData({ name: '', code: '', location: '', status: 'IDLE' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingEquipment) {
                await api.put(`/equipment/${editingEquipment.id}`, formData);
                showToast(t('equipment.editEquipment') + ' - ' + t('common.save'));
            } else {
                await api.post('/equipment', formData);
                showToast(t('equipment.addEquipment') + ' - ' + t('common.create'));
            }
            fetchEquipment();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save equipment', error);
            showToast('Failed to save equipment', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('equipment.deleteEquipment') + '?')) return;
        try {
            await api.delete(`/equipment/${id}`);
            showToast(t('equipment.deleteEquipment') + ' - ' + t('common.delete'));
            fetchEquipment();
        } catch (error) {
            console.error('Failed to delete equipment', error);
            showToast('Failed to delete equipment', 'error');
        }
    };

    const handleBulkDelete = async (items) => {
        try {
            await Promise.all(items.map(item => api.delete(`/equipment/${item.id}`)));
            showToast(t('bulkOperations.deleteSelected') + ' - ' + t('common.delete'));
            setSelectedItems([]);
            fetchEquipment();
        } catch (error) {
            console.error('Failed to delete equipment', error);
            showToast('Failed to delete equipment', 'error');
        }
    };

    const handleBulkExport = (items) => {
        // Export selected items
        const exportData = items.map(item => ({
            name: item.name,
            code: item.code,
            location: item.location,
            status: item.status,
        }));
        
        exportToCSV(exportData, 'equipment-export');
        showToast(t('importExport.exportSuccess'));
    };

    const handleImport = async (importedData) => {
        try {
            // Process imported data and create equipment
            for (const item of importedData) {
                await api.post('/equipment', {
                    name: item.name || item.Name,
                    code: item.code || item.Code,
                    location: item.location || item.Location,
                    status: item.status || item.Status || 'IDLE',
                });
            }
            showToast(t('importExport.importSuccess'));
            fetchEquipment();
        } catch (error) {
            console.error('Import error:', error);
            throw error;
        }
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
    };

    const handleFilter = (filters) => {
        setFilterValues(filters);
    };

    const toggleSelectItem = (item) => {
        setSelectedItems(prev => 
            prev.some(i => i.id === item.id)
                ? prev.filter(i => i.id !== item.id)
                : [...prev, item]
        );
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === filteredEquipment.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems([...filteredEquipment]);
        }
    };

    let filteredEquipment = equipment.filter(item => {
        const matchesSearch = !searchTerm || 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.location?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = !filterValues.status || item.status === filterValues.status;
        
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'RUNNING': return 'bg-success/10 text-success dark:bg-success/20 dark:text-success';
            case 'IDLE': return 'bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning';
            case 'DOWN': return 'bg-danger/10 text-danger dark:bg-danger/20 dark:text-danger';
            case 'MAINTENANCE': return 'bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent';
            default: return 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary';
        }
    };

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="flex justify-between items-center no-print">
                <h2 className="text-2xl font-bold dark:text-slate-200">{t('equipment.title')}</h2>
                <div className="flex gap-2">
                    <ImportExport 
                        data={equipment} 
                        filename="equipment" 
                        onImport={handleImport}
                        exportFields={['name', 'code', 'location', 'status']}
                    />
                    <PrintButton />
                    <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center gap-2">
                        <Plus size={18} /> {t('equipment.addEquipment')}
                    </button>
                </div>
            </div>

            <div className="card no-print">
                <AdvancedSearch
                    onSearch={handleSearch}
                    onFilter={handleFilter}
                    filters={filters}
                    placeholder={t('equipment.searchPlaceholder')}
                />
            </div>

            {selectedItems.length > 0 && (
                <BulkActions
                    selectedItems={selectedItems}
                    onDelete={handleBulkDelete}
                    onExport={handleBulkExport}
                    onClear={() => setSelectedItems([])}
                />
            )}

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="p-4 font-semibold text-secondary dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.length === filteredEquipment.length && filteredEquipment.length > 0}
                                        onChange={toggleSelectAll}
                                        className="rounded border-slate-300 dark:border-slate-600"
                                    />
                                </th>
                                <th className="p-4 font-semibold text-secondary dark:text-slate-300">{t('equipment.name')}</th>
                                <th className="p-4 font-semibold text-secondary dark:text-slate-300">{t('equipment.code')}</th>
                                <th className="p-4 font-semibold text-secondary dark:text-slate-300">{t('equipment.location')}</th>
                                <th className="p-4 font-semibold text-secondary dark:text-slate-300">{t('equipment.status')}</th>
                                <th className="p-4 font-semibold text-secondary dark:text-slate-300 no-print">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-4 text-center dark:text-slate-300">{t('common.loading')}</td>
                                </tr>
                            ) : filteredEquipment.map((item) => (
                                <tr 
                                    key={item.id} 
                                    className={`hover:bg-slate-50 dark:hover:bg-slate-800 ${
                                        selectedItems.some(i => i.id === item.id) ? 'bg-accent/5 dark:bg-accent/10' : ''
                                    }`}
                                >
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.some(i => i.id === item.id)}
                                            onChange={() => toggleSelectItem(item)}
                                            className="rounded border-slate-300 dark:border-slate-600"
                                        />
                                    </td>
                                    <td className="p-4 font-medium dark:text-slate-200">{item.name}</td>
                                    <td className="p-4 text-secondary dark:text-slate-400">{item.code}</td>
                                    <td className="p-4 text-secondary dark:text-slate-400">{item.location || '-'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-2 no-print">
                                        <button 
                                            onClick={() => handleOpenModal(item)} 
                                            className="p-1 text-accent hover:bg-accent/10 dark:hover:bg-accent/20 rounded"
                                            title={t('common.edit')}
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item.id)} 
                                            className="p-1 text-danger hover:bg-danger/10 dark:hover:bg-danger/20 rounded"
                                            title={t('common.delete')}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredEquipment.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-4 text-center text-secondary dark:text-slate-400">{t('common.noData')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                title={editingEquipment ? t('equipment.editEquipment') : t('equipment.addEquipment')}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-slate-200">{t('equipment.name')}</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-slate-200">{t('equipment.code')}</label>
                        <input
                            type="text"
                            required
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            className="w-full px-3 py-2 border dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-slate-200">{t('equipment.location')}</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-3 py-2 border dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-slate-200">{t('equipment.status')}</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-3 py-2 border dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2 pt-4">
                        <button type="submit" className="btn btn-primary flex-1">
                            {editingEquipment ? t('common.update') : t('common.create')}
                        </button>
                        <button 
                            type="button" 
                            onClick={handleCloseModal} 
                            className="btn bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 dark:text-slate-200 flex-1"
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default EquipmentList;
