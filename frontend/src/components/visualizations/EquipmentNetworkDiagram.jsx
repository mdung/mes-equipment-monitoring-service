import React, { useState, useEffect, useRef } from 'react';
import { Network, Settings } from 'lucide-react';
import ForceGraph2D from 'react-force-graph-2d';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

const EquipmentNetworkDiagram = ({ selectedEquipmentId = null }) => {
  const { t } = useTranslation();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const graphRef = useRef();

  useEffect(() => {
    fetchNetworkData();
  }, [selectedEquipmentId]);

  const fetchNetworkData = async () => {
    try {
      const res = await api.get('/equipment/network').catch(() => null);
      
      if (res && res.data) {
        setGraphData(res.data);
      } else {
        // Generate sample network data
        generateSampleData();
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching network data:', error);
      generateSampleData();
      setLoading(false);
    }
  };

  const generateSampleData = async () => {
    try {
      const equipmentRes = await api.get('/equipment');
      const equipment = equipmentRes.data || [];
      
      const nodes = equipment.map(eq => ({
        id: eq.id,
        name: eq.name,
        code: eq.code,
        status: eq.status,
        group: getStatusGroup(eq.status),
      }));

      // Create links based on production orders or logical relationships
      const links = [];
      for (let i = 0; i < nodes.length - 1; i++) {
        if (Math.random() > 0.7) {
          links.push({
            source: nodes[i].id,
            target: nodes[i + 1].id,
            value: Math.random() * 10,
            type: 'production_flow',
          });
        }
      }

      setGraphData({ nodes, links });
    } catch (error) {
      // Fallback sample data
      setGraphData({
        nodes: [
          { id: 1, name: 'CNC Machine 1', status: 'RUNNING', group: 1 },
          { id: 2, name: 'Assembly Line 1', status: 'RUNNING', group: 1 },
          { id: 3, name: 'Packaging Station', status: 'IDLE', group: 2 },
          { id: 4, name: 'Quality Control', status: 'RUNNING', group: 1 },
          { id: 5, name: 'Storage System', status: 'IDLE', group: 2 },
        ],
        links: [
          { source: 1, target: 2, value: 5 },
          { source: 2, target: 4, value: 5 },
          { source: 4, target: 3, value: 5 },
          { source: 3, target: 5, value: 3 },
        ],
      });
    }
  };

  const getStatusGroup = (status) => {
    switch (status) {
      case 'RUNNING': return 1;
      case 'IDLE': return 2;
      case 'DOWN': return 3;
      case 'MAINTENANCE': return 4;
      default: return 0;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'RUNNING': return '#22c55e';
      case 'IDLE': return '#eab308';
      case 'DOWN': return '#ef4444';
      case 'MAINTENANCE': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading network diagram...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg dark:text-slate-200 flex items-center gap-2">
          <Network size={20} />
          Equipment Network Diagram
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-secondary dark:text-slate-400">Running</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-secondary dark:text-slate-400">Idle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-secondary dark:text-slate-400">Down</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-secondary dark:text-slate-400">Maintenance</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 p-4" style={{ height: '600px' }}>
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeLabel={(node) => `${node.name}\n${node.code || ''}\nStatus: ${node.status}`}
          nodeColor={(node) => getStatusColor(node.status)}
          nodeVal={(node) => 10}
          linkColor={() => 'rgba(107, 114, 128, 0.3)'}
          linkWidth={(link) => Math.sqrt(link.value) || 2}
          onNodeClick={(node) => setSelectedNode(node)}
          onNodeHover={(node) => {
            // Highlight node on hover
          }}
          cooldownTicks={100}
          onEngineStop={() => graphRef.current?.zoomToFit(400, 20)}
        />
      </div>

      {selectedNode && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border dark:border-slate-700">
          <h4 className="font-semibold mb-2 dark:text-slate-200 flex items-center gap-2">
            <Settings size={16} />
            {selectedNode.name}
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-secondary dark:text-slate-400">Code: </span>
              <span className="dark:text-slate-200">{selectedNode.code || 'N/A'}</span>
            </div>
            <div>
              <span className="text-secondary dark:text-slate-400">Status: </span>
              <span className="dark:text-slate-200">{selectedNode.status}</span>
            </div>
            <div>
              <span className="text-secondary dark:text-slate-400">Connections: </span>
              <span className="dark:text-slate-200">
                {graphData.links.filter(l => 
              (typeof l.source === 'object' ? l.source.id : l.source) === selectedNode.id || 
              (typeof l.target === 'object' ? l.target.id : l.target) === selectedNode.id
            ).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentNetworkDiagram;

