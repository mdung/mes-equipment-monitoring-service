import React, { useState, useEffect } from 'react';
import { Package, FileText, Calendar, Layers, Plus } from 'lucide-react';
import api from '../services/api';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

const ProductionManagement = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [batches, setBatches] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');

    const [productForm, setProductForm] = useState({
        productCode: '',
        productName: '',
        description: '',
        unitOfMeasure: 'PCS',
        standardCost: ''
    });

    const [materialForm, setMaterialForm] = useState({
        materialCode: '',
        materialName: '',
        description: '',
        unitOfMeasure: 'KG',
        unitCost: '',
        currentStock: '',
        minimumStock: ''
    });

    const [batchForm, setBatchForm] = useState({
        batchNumber: '',
        productId: '',
        quantity: '',
        status: 'IN_PRODUCTION',
        qualityStatus: 'PENDING'
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            switch (activeTab) {
                case 'products':
                    const productsRes = await api.get('/products');
                    setProducts(productsRes.data);
                    break;
                case 'materials':
                    const materialsRes = await api.get('/materials');
                    setMaterials(materialsRes.data);
                    break;
                case 'batches':
                    const batchesRes = await api.get('/batches');
                    setBatches(batchesRes.data);
                    break;
                case 'schedules':
                    const schedulesRes = await api.get('/schedules');
                    setSchedules(schedulesRes.data);
                    break;
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
            showToast('Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleOpenModal = (type) => {
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setProductForm({ productCode: '', productName: '', description: '', unitOfMeasure: 'PCS', standardCost: '' });
        setMaterialForm({ materialCode: '', materialName: '', description: '', unitOfMeasure: 'KG', unitCost: '', currentStock: '', minimumStock: '' });
        setBatchForm({ batchNumber: '', productId: '', quantity: '', status: 'IN_PRODUCTION', qualityStatus: 'PENDING' });
    };

    const handleSubmitProduct = async (e) => {
        e.preventDefault();
        try {
            await api.post('/products', productForm);
            showToast('Product created successfully');
            fetchData();
            handleCloseModal();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to create product', 'error');
        }
    };

    const handleSubmitMaterial = async (e) => {
        e.preventDefault();
        try {
            await api.post('/materials', materialForm);
            showToast('Material created successfully');
            fetchData();
            handleCloseModal();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to create material', 'error');
        }
    };

    const handleSubmitBatch = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...batchForm,
                product: { id: parseInt(batchForm.productId) },
                quantity: parseFloat(batchForm.quantity),
                manufacturingDate: new Date().toISOString()
            };
            await api.post('/batches', payload);
            showToast('Batch created successfully');
            fetchData();
            handleCloseModal();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to create batch', 'error');
        }
    };

    const tabs = [
        { id: 'products', label: 'Products', icon: Package },
        { id: 'materials', label: 'Materials', icon: Layers },
        { id: 'batches', label: 'Batches', icon: FileText },
        { id: 'schedules', label: 'Schedules', icon: Calendar }
    ];

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Production Management</h2>
                <button onClick={() => handleOpenModal(activeTab)} className="btn btn-primary flex items-center gap-2">
                    <Plus size={18} /> Add {activeTab.slice(0, -1)}
                </button>
            </div>

            <div className="card">
                <div className="flex gap-2 border-b pb-4 mb-4">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-accent text-white'
                                        : 'bg-slate-100 hover:bg-slate-200'
                                }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : (
                    <>
                        {activeTab === 'products' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="p-3">Code</th>
                                            <th className="p-3">Name</th>
                                            <th className="p-3">Description</th>
                                            <th className="p-3">UOM</th>
                                            <th className="p-3">Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {products.map(product => (
                                            <tr key={product.id} className="hover:bg-slate-50">
                                                <td className="p-3 font-medium">{product.productCode}</td>
                                                <td className="p-3">{product.productName}</td>
                                                <td className="p-3 text-secondary">{product.description || '-'}</td>
                                                <td className="p-3">{product.unitOfMeasure}</td>
                                                <td className="p-3">${product.standardCost?.toFixed(2) || '0.00'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'materials' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="p-3">Code</th>
                                            <th className="p-3">Name</th>
                                            <th className="p-3">UOM</th>
                                            <th className="p-3">Unit Cost</th>
                                            <th className="p-3">Current Stock</th>
                                            <th className="p-3">Min Stock</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {materials.map(material => (
                                            <tr key={material.id} className="hover:bg-slate-50">
                                                <td className="p-3 font-medium">{material.materialCode}</td>
                                                <td className="p-3">{material.materialName}</td>
                                                <td className="p-3">{material.unitOfMeasure}</td>
                                                <td className="p-3">${material.unitCost?.toFixed(2) || '0.00'}</td>
                                                <td className="p-3">{material.currentStock?.toFixed(2) || '0.00'}</td>
                                                <td className="p-3">{material.minimumStock?.toFixed(2) || '0.00'}</td>
                                                <td className="p-3">
                                                    {material.currentStock < material.minimumStock ? (
                                                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Low Stock</span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">OK</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'batches' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="p-3">Batch Number</th>
                                            <th className="p-3">Product</th>
                                            <th className="p-3">Quantity</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Quality</th>
                                            <th className="p-3">Mfg Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {batches.map(batch => (
                                            <tr key={batch.id} className="hover:bg-slate-50">
                                                <td className="p-3 font-medium">{batch.batchNumber}</td>
                                                <td className="p-3">{batch.product?.productName || '-'}</td>
                                                <td className="p-3">{batch.quantity?.toFixed(2)}</td>
                                                <td className="p-3">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                                        {batch.status}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        batch.qualityStatus === 'PASSED' ? 'bg-green-100 text-green-700' :
                                                        batch.qualityStatus === 'FAILED' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {batch.qualityStatus}
                                                    </span>
                                                </td>
                                                <td className="p-3">{batch.manufacturingDate ? new Date(batch.manufacturingDate).toLocaleDateString() : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'schedules' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="p-3">Schedule Name</th>
                                            <th className="p-3">Order</th>
                                            <th className="p-3">Equipment</th>
                                            <th className="p-3">Scheduled Start</th>
                                            <th className="p-3">Scheduled End</th>
                                            <th className="p-3">Priority</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {schedules.map(schedule => (
                                            <tr key={schedule.id} className="hover:bg-slate-50">
                                                <td className="p-3 font-medium">{schedule.scheduleName}</td>
                                                <td className="p-3">{schedule.productionOrder?.orderNumber || '-'}</td>
                                                <td className="p-3">{schedule.equipment?.name || '-'}</td>
                                                <td className="p-3">{new Date(schedule.scheduledStart).toLocaleString()}</td>
                                                <td className="p-3">{new Date(schedule.scheduledEnd).toLocaleString()}</td>
                                                <td className="p-3">{schedule.priority}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        schedule.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                        schedule.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                                        schedule.status === 'DELAYED' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {schedule.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Product Modal */}
            {modalType === 'products' && (
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add Product">
                    <form onSubmit={handleSubmitProduct} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Product Code</label>
                            <input
                                type="text"
                                required
                                value={productForm.productCode}
                                onChange={(e) => setProductForm({ ...productForm, productCode: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Product Name</label>
                            <input
                                type="text"
                                required
                                value={productForm.productName}
                                onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={productForm.description}
                                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                                rows="3"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Unit of Measure</label>
                                <select
                                    value={productForm.unitOfMeasure}
                                    onChange={(e) => setProductForm({ ...productForm, unitOfMeasure: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                                >
                                    <option value="PCS">PCS</option>
                                    <option value="KG">KG</option>
                                    <option value="L">L</option>
                                    <option value="M">M</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Standard Cost</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={productForm.standardCost}
                                    onChange={(e) => setProductForm({ ...productForm, standardCost: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-4">
                            <button type="submit" className="btn btn-primary flex-1">Create</button>
                            <button type="button" onClick={handleCloseModal} className="btn bg-slate-200 hover:bg-slate-300 flex-1">Cancel</button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Material Modal */}
            {modalType === 'materials' && (
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add Material">
                    <form onSubmit={handleSubmitMaterial} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Material Code</label>
                            <input
                                type="text"
                                required
                                value={materialForm.materialCode}
                                onChange={(e) => setMaterialForm({ ...materialForm, materialCode: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Material Name</label>
                            <input
                                type="text"
                                required
                                value={materialForm.materialName}
                                onChange={(e) => setMaterialForm({ ...materialForm, materialName: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Unit Cost</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={materialForm.unitCost}
                                    onChange={(e) => setMaterialForm({ ...materialForm, unitCost: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Unit of Measure</label>
                                <select
                                    value={materialForm.unitOfMeasure}
                                    onChange={(e) => setMaterialForm({ ...materialForm, unitOfMeasure: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                                >
                                    <option value="KG">KG</option>
                                    <option value="L">L</option>
                                    <option value="M">M</option>
                                    <option value="PCS">PCS</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Current Stock</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={materialForm.currentStock}
                                    onChange={(e) => setMaterialForm({ ...materialForm, currentStock: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Minimum Stock</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={materialForm.minimumStock}
                                    onChange={(e) => setMaterialForm({ ...materialForm, minimumStock: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-4">
                            <button type="submit" className="btn btn-primary flex-1">Create</button>
                            <button type="button" onClick={handleCloseModal} className="btn bg-slate-200 hover:bg-slate-300 flex-1">Cancel</button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Batch Modal */}
            {modalType === 'batches' && (
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add Batch">
                    <form onSubmit={handleSubmitBatch} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Batch Number</label>
                            <input
                                type="text"
                                required
                                value={batchForm.batchNumber}
                                onChange={(e) => setBatchForm({ ...batchForm, batchNumber: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Product</label>
                            <select
                                required
                                value={batchForm.productId}
                                onChange={(e) => setBatchForm({ ...batchForm, productId: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                                <option value="">Select Product</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.id}>{product.productName}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Quantity</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={batchForm.quantity}
                                onChange={(e) => setBatchForm({ ...batchForm, quantity: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                        </div>
                        <div className="flex gap-2 pt-4">
                            <button type="submit" className="btn btn-primary flex-1">Create</button>
                            <button type="button" onClick={handleCloseModal} className="btn bg-slate-200 hover:bg-slate-300 flex-1">Cancel</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default ProductionManagement;
