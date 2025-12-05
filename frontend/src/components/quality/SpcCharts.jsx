import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Plus } from 'lucide-react';
import api from '../../services/api';
import Modal from '../Modal';
import Toast from '../Toast';

function SpcCharts() {
  const [equipment, setEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [parameters, setParameters] = useState([]);
  const [selectedParameter, setSelectedParameter] = useState('');
  const [spcData, setSpcData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    equipmentId: '',
    parameterName: '',
    measuredValue: '',
    unitOfMeasure: '',
    upperControlLimit: '',
    lowerControlLimit: '',
    upperSpecLimit: '',
    lowerSpecLimit: '',
    targetValue: '',
    sampleSize: ''
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  useEffect(() => {
    if (selectedEquipment) {
      fetchParameters();
    }
  }, [selectedEquipment]);

  useEffect(() => {
    if (selectedEquipment && selectedParameter) {
      fetchSpcData();
    }
  }, [selectedEquipment, selectedParameter]);

  const fetchEquipment = async () => {
    try {
      const response = await api.get('/equipment');
      setEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const fetchParameters = async () => {
    try {
      const response = await api.get(`/quality-management/spc/equipment/${selectedEquipment}/parameters`);
      setParameters(response.data);
      if (response.data.length > 0) {
        setSelectedParameter(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching parameters:', error);
    }
  };

  const fetchSpcData = async () => {
    try {
      const response = await api.get(
        `/quality-management/spc/equipment/${selectedEquipment}/parameter/${selectedParameter}?days=30`
      );
      const chartData = response.data.map(point => ({
        ...point,
        date: new Date(point.measuredAt).toLocaleDateString(),
        value: parseFloat(point.measuredValue)
      }));
      setSpcData(chartData);
    } catch (error) {
      console.error('Error fetching SPC data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        equipment: { id: parseInt(formData.equipmentId) },
        measuredValue: parseFloat(formData.measuredValue),
        upperControlLimit: formData.upperControlLimit ? parseFloat(formData.upperControlLimit) : null,
        lowerControlLimit: formData.lowerControlLimit ? parseFloat(formData.lowerControlLimit) : null,
        upperSpecLimit: formData.upperSpecLimit ? parseFloat(formData.upperSpecLimit) : null,
        lowerSpecLimit: formData.lowerSpecLimit ? parseFloat(formData.lowerSpecLimit) : null,
        targetValue: formData.targetValue ? parseFloat(formData.targetValue) : null,
        sampleSize: formData.sampleSize ? parseInt(formData.sampleSize) : null
      };

      await api.post('/quality-management/spc', payload);
      setToast({ message: 'SPC data recorded successfully', type: 'success' });
      if (selectedEquipment && selectedParameter) {
        fetchSpcData();
      }
      handleCloseModal();
    } catch (error) {
      setToast({ message: 'Error recording SPC data', type: 'error' });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      equipmentId: '',
      parameterName: '',
      measuredValue: '',
      unitOfMeasure: '',
      upperControlLimit: '',
      lowerControlLimit: '',
      upperSpecLimit: '',
      lowerSpecLimit: '',
      targetValue: '',
      sampleSize: ''
    });
  };

  const ucl = spcData.length > 0 && spcData[0].upperControlLimit ? parseFloat(spcData[0].upperControlLimit) : null;
  const lcl = spcData.length > 0 && spcData[0].lowerControlLimit ? parseFloat(spcData[0].lowerControlLimit) : null;
  const target = spcData.length > 0 && spcData[0].targetValue ? parseFloat(spcData[0].targetValue) : null;

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Statistical Process Control (SPC) Charts</h2>
          <p className="text-gray-600">Monitor process parameters and control limits</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Record Data
        </button>
      </div>

      {/* Selection Controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Equipment</option>
              {equipment.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parameter</label>
            <select
              value={selectedParameter}
              onChange={(e) => setSelectedParameter(e.target.value)}
              className="w-full border rounded px-3 py-2"
              disabled={!selectedEquipment}
            >
              <option value="">Select Parameter</option>
              {parameters.map(param => (
                <option key={param} value={param}>{param}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SPC Chart */}
      {spcData.length > 0 ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            {selectedParameter} - Control Chart
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={spcData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="Measured Value" dot={{ r: 4 }} />
              {ucl && <ReferenceLine y={ucl} stroke="#ef4444" strokeDasharray="3 3" label="UCL" />}
              {lcl && <ReferenceLine y={lcl} stroke="#ef4444" strokeDasharray="3 3" label="LCL" />}
              {target && <ReferenceLine y={target} stroke="#10b981" strokeDasharray="3 3" label="Target" />}
            </LineChart>
          </ResponsiveContainer>

          {/* Out of Control Points */}
          {spcData.some(d => d.isOutOfControl) && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <div className="font-medium text-red-900">⚠️ Out of Control Points Detected</div>
              <div className="text-sm text-red-800">
                {spcData.filter(d => d.isOutOfControl).length} point(s) outside control limits
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow text-center text-gray-500">
          {selectedEquipment && selectedParameter 
            ? 'No SPC data available for this parameter'
            : 'Select equipment and parameter to view SPC chart'
          }
        </div>
      )}

      {/* Record Data Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Record SPC Data Point"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
            <select
              value={formData.equipmentId}
              onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select Equipment</option>
              {equipment.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parameter Name</label>
              <input
                type="text"
                value={formData.parameterName}
                onChange={(e) => setFormData({ ...formData, parameterName: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., Temperature, Pressure"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measure</label>
              <input
                type="text"
                value={formData.unitOfMeasure}
                onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., °C, PSI"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Measured Value</label>
            <input
              type="number"
              step="0.000001"
              value={formData.measuredValue}
              onChange={(e) => setFormData({ ...formData, measuredValue: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upper Control Limit</label>
              <input
                type="number"
                step="0.000001"
                value={formData.upperControlLimit}
                onChange={(e) => setFormData({ ...formData, upperControlLimit: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lower Control Limit</label>
              <input
                type="number"
                step="0.000001"
                value={formData.lowerControlLimit}
                onChange={(e) => setFormData({ ...formData, lowerControlLimit: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
            <input
              type="number"
              step="0.000001"
              value={formData.targetValue}
              onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Record Data
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default SpcCharts;
