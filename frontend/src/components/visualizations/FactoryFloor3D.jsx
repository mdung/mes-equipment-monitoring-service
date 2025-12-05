import React, { useState, useEffect, useRef } from 'react';
import { Box, Maximize2, Minimize2, RotateCw } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

const Equipment3DModel = ({ equipment, position, onClick }) => {
  const meshRef = useRef();

  const getColor = (status) => {
    switch (status) {
      case 'RUNNING': return '#22c55e';
      case 'IDLE': return '#eab308';
      case 'DOWN': return '#ef4444';
      case 'MAINTENANCE': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <group position={position} onClick={onClick}>
      <mesh ref={meshRef} position={[0, 0.5, 0]}>
        <boxGeometry args={[2, 1, 2]} />
        <meshStandardMaterial color={getColor(equipment.status)} />
      </mesh>
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.3}
        color="#000"
        anchorX="center"
        anchorY="middle"
      >
        {equipment.name}
      </Text>
    </group>
  );
};

const FactoryFloor3D = () => {
  const { t } = useTranslation();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState('top'); // top, perspective, side

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const res = await api.get('/equipment');
      const eqData = res.data || [];
      
      // Assign positions in a grid layout
      const positioned = eqData.map((eq, index) => ({
        ...eq,
        position: [
          (index % 5) * 4 - 8,
          0,
          Math.floor(index / 5) * 4 - 8,
        ],
      }));
      
      setEquipment(positioned);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setLoading(false);
    }
  };

  const handleEquipmentClick = (eq) => {
    setSelectedEquipment(eq);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (loading) {
    return <div className="text-center py-8">Loading factory floor...</div>;
  }

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900' : ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg dark:text-slate-200 flex items-center gap-2">
          <Box size={20} />
          3D Factory Floor Layout
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-3 py-2 border dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm"
          >
            <option value="top">Top View</option>
            <option value="perspective">Perspective</option>
            <option value="side">Side View</option>
          </select>
          <button
            onClick={toggleFullscreen}
            className="p-2 border dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      <div className={`bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 ${isFullscreen ? 'h-full' : 'h-[600px]'}`}>
        <Canvas>
          <PerspectiveCamera
            makeDefault
            position={
              viewMode === 'top' ? [0, 20, 0] :
              viewMode === 'side' ? [20, 10, 0] :
              [15, 15, 15]
            }
            fov={50}
          />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <gridHelper args={[20, 20]} />
          
          {equipment.map((eq) => (
            <Equipment3DModel
              key={eq.id}
              equipment={eq}
              position={eq.position}
              onClick={() => handleEquipmentClick(eq)}
            />
          ))}
          
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>

      {selectedEquipment && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border dark:border-slate-700">
          <h4 className="font-semibold mb-2 dark:text-slate-200">{selectedEquipment.name}</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-secondary dark:text-slate-400">Code: </span>
              <span className="dark:text-slate-200">{selectedEquipment.code}</span>
            </div>
            <div>
              <span className="text-secondary dark:text-slate-400">Status: </span>
              <span className="dark:text-slate-200">{selectedEquipment.status}</span>
            </div>
            <div>
              <span className="text-secondary dark:text-slate-400">Location: </span>
              <span className="dark:text-slate-200">{selectedEquipment.location || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FactoryFloor3D;

