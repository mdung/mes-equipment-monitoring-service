import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus } from 'lucide-react';
import api from '../services/api';
import Toast from '../components/Toast';

const ShiftManagement = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchShifts = async () => {
      setLoading(true);
      try {
        const res = await api.get('/shifts').catch(() => ({ data: [] }));
        setShifts(res.data);
      } catch (e) {
        setToast({ message: 'Failed to load shifts', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchShifts();
  }, []);

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Shift Management</h2>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus size={18} /> New Shift
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : shifts.length === 0 ? (
          <div className="text-center py-10 text-secondary">No shifts found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map((shift) => (
              <div key={shift.id} className="p-4 border rounded-lg bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={18} />
                  <span className="font-medium">{shift.shiftName || 'Shift'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <Clock size={16} />
                  <span>
                    {shift.startTime} - {shift.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary mt-1">
                  <Users size={16} />
                  <span>{shift.assignedUsers?.length || 0} assigned</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftManagement;
