import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

const MaterialRequirements = ({ orderId }) => {
  const { t } = useTranslation();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bomData, setBomData] = useState([]);

  useEffect(() => {
    if (orderId) {
      fetchMaterialRequirements();
    }
  }, [orderId]);

  const fetchMaterialRequirements = async () => {
    try {
      // Fetch BOM for the product
      const orderRes = await api.get(`/orders/${orderId}`);
      const order = orderRes.data;
      
      // Fetch BOM items (assuming we have a product code or can derive it)
      // For now, we'll use mock data structure
      const bomRes = await api.get(`/bom/product/${order.productName}`).catch(() => null);
      
      if (bomRes) {
        setBomData(bomRes.data);
      }
      
      // Fetch actual material consumption
      const consumptionRes = await api.get(`/material-consumption/order/${orderId}`).catch(() => null);
      if (consumptionRes) {
        setMaterials(consumptionRes.data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching material requirements:', error);
      setLoading(false);
    }
  };

  const getStockStatus = (required, available) => {
    if (available >= required) return 'sufficient';
    if (available >= required * 0.8) return 'low';
    return 'insufficient';
  };

  if (loading) {
    return <div className="text-center py-4">Loading material requirements...</div>;
  }

  if (bomData.length === 0 && materials.length === 0) {
    return (
      <div className="text-center py-8 text-secondary dark:text-slate-400">
        No material requirements defined for this order.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg dark:text-slate-200 flex items-center gap-2">
        <Package size={20} />
        Material Requirements
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700">
            <tr>
              <th className="p-3 font-semibold text-sm dark:text-slate-300">Material</th>
              <th className="p-3 font-semibold text-sm dark:text-slate-300">Required</th>
              <th className="p-3 font-semibold text-sm dark:text-slate-300">Available</th>
              <th className="p-3 font-semibold text-sm dark:text-slate-300">Status</th>
              <th className="p-3 font-semibold text-sm dark:text-slate-300">Unit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {bomData.map((item, index) => {
              const status = getStockStatus(item.requiredQuantity, item.availableStock || 0);
              return (
                <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="p-3 dark:text-slate-200">{item.materialName || item.material?.materialName}</td>
                  <td className="p-3 dark:text-slate-200">{item.requiredQuantity || item.quantity}</td>
                  <td className="p-3 dark:text-slate-200">{item.availableStock || item.material?.currentStock || 0}</td>
                  <td className="p-3">
                    {status === 'sufficient' && (
                      <span className="flex items-center gap-1 text-success text-sm">
                        <CheckCircle size={16} />
                        Sufficient
                      </span>
                    )}
                    {status === 'low' && (
                      <span className="flex items-center gap-1 text-warning text-sm">
                        <AlertTriangle size={16} />
                        Low Stock
                      </span>
                    )}
                    {status === 'insufficient' && (
                      <span className="flex items-center gap-1 text-danger text-sm">
                        <AlertTriangle size={16} />
                        Insufficient
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-secondary dark:text-slate-400">{item.unitOfMeasure || 'units'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {materials.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold mb-2 dark:text-slate-200">Material Consumption</h4>
          <div className="space-y-2">
            {materials.map((material, index) => (
              <div key={index} className="p-3 bg-slate-50 dark:bg-slate-900 rounded border dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="font-medium dark:text-slate-200">{material.materialName || material.material?.materialName}</span>
                  <span className="text-sm text-secondary dark:text-slate-400">
                    {material.quantityConsumed} {material.unitOfMeasure}
                  </span>
                </div>
                {material.consumptionDate && (
                  <div className="text-xs text-secondary dark:text-slate-400 mt-1">
                    Consumed: {new Date(material.consumptionDate).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialRequirements;

