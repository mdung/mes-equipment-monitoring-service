import React, { useState, useEffect, useRef } from 'react';
import { ArrowRightLeft, Package, Factory } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import * as d3 from 'd3';

const MaterialFlowSankey = ({ orderId, timeRange = 'week' }) => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef(null);

  useEffect(() => {
    fetchMaterialFlowData();
  }, [orderId, timeRange]);

  useEffect(() => {
    if (data && svgRef.current) {
      drawSankey();
    }
  }, [data]);

  const fetchMaterialFlowData = async () => {
    try {
      const res = await api.get(`/material-flow/order/${orderId}`).catch(() => null);
      
      if (res && res.data) {
        setData(res.data);
      } else {
        generateSampleData();
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching material flow data:', error);
      generateSampleData();
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    const sampleData = {
      nodes: [
        { id: 0, name: 'Raw Material A', type: 'material', x: 0, y: 0 },
        { id: 1, name: 'Raw Material B', type: 'material', x: 0, y: 1 },
        { id: 2, name: 'Component X', type: 'component', x: 1, y: 0 },
        { id: 3, name: 'Component Y', type: 'component', x: 1, y: 1 },
        { id: 4, name: 'Assembly Line 1', type: 'process', x: 2, y: 0.5 },
        { id: 5, name: 'Quality Check', type: 'process', x: 3, y: 0.5 },
        { id: 6, name: 'Finished Product', type: 'product', x: 4, y: 0.5 },
      ],
      links: [
        { source: 0, target: 2, value: 100 },
        { source: 1, target: 3, value: 150 },
        { source: 2, target: 4, value: 100 },
        { source: 3, target: 4, value: 150 },
        { source: 4, target: 5, value: 200 },
        { source: 5, target: 6, value: 200 },
      ],
    };
    setData(sampleData);
  };

  const drawSankey = () => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth || 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    svg.attr('width', width).attr('height', height);

    // Calculate positions
    const nodeWidth = 120;
    const nodeHeight = 40;
    const columnSpacing = (width - margin.left - margin.right) / 5;
    const rowSpacing = (height - margin.top - margin.bottom) / 3;

    // Position nodes in columns
    const columns = {};
    data.nodes.forEach(node => {
      if (!columns[node.x]) columns[node.x] = [];
      columns[node.x].push(node);
    });

    Object.keys(columns).forEach(col => {
      const nodesInCol = columns[col];
      const totalHeight = nodesInCol.length * (nodeHeight + 10);
      const startY = (height - totalHeight) / 2;
      
      nodesInCol.forEach((node, i) => {
        node.xPos = margin.left + parseInt(col) * columnSpacing;
        node.yPos = startY + i * (nodeHeight + 10);
        node.width = nodeWidth;
        node.height = nodeHeight;
      });
    });

    // Draw links
    const link = svg
      .append('g')
      .selectAll('path')
      .data(data.links)
      .enter()
      .append('path')
      .attr('d', (d) => {
        const source = data.nodes[d.source];
        const target = data.nodes[d.target];
        const x0 = source.xPos + source.width;
        const y0 = source.yPos + source.height / 2;
        const x1 = target.xPos;
        const y1 = target.yPos + target.height / 2;
        
        const path = d3.path();
        path.moveTo(x0, y0);
        path.bezierCurveTo(
          x0 + (x1 - x0) / 2, y0,
          x0 + (x1 - x0) / 2, y1,
          x1, y1
        );
        return path.toString();
      })
      .attr('stroke', (d) => {
        const sourceType = data.nodes[d.source].type;
        if (sourceType === 'material') return '#3b82f6';
        if (sourceType === 'component') return '#22c55e';
        if (sourceType === 'process') return '#eab308';
        return '#6b7280';
      })
      .attr('stroke-width', (d) => Math.max(2, Math.sqrt(d.value) / 5))
      .attr('fill', 'none')
      .attr('opacity', 0.6)
      .on('mouseover', function() {
        d3.select(this).attr('opacity', 1).attr('stroke-width', (d) => Math.max(4, Math.sqrt(d.value) / 3));
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.6).attr('stroke-width', (d) => Math.max(2, Math.sqrt(d.value) / 5));
      });

    // Draw nodes
    const node = svg
      .append('g')
      .selectAll('g')
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(${d.xPos},${d.yPos})`);

    node
      .append('rect')
      .attr('width', (d) => d.width)
      .attr('height', (d) => d.height)
      .attr('fill', (d) => {
        if (d.type === 'material') return '#3b82f6';
        if (d.type === 'component') return '#22c55e';
        if (d.type === 'process') return '#eab308';
        if (d.type === 'product') return '#ef4444';
        return '#6b7280';
      })
      .attr('rx', 4)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .on('mouseover', function() {
        d3.select(this).attr('opacity', 0.8);
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1);
      });

    node
      .append('text')
      .attr('x', (d) => d.width / 2)
      .attr('y', (d) => d.height / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text((d) => d.name);

    // Add value labels on links
    const linkLabel = svg
      .append('g')
      .selectAll('text')
      .data(data.links)
      .enter()
      .append('text')
      .attr('x', (d) => {
        const source = data.nodes[d.source];
        const target = data.nodes[d.target];
        return (source.xPos + source.width + target.xPos) / 2;
      })
      .attr('y', (d) => {
        const source = data.nodes[d.source];
        const target = data.nodes[d.target];
        return (source.yPos + source.height / 2 + target.yPos + target.height / 2) / 2;
      })
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .text((d) => d.value);
  };

  if (loading) {
    return <div className="text-center py-8">Loading material flow data...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg dark:text-slate-200 flex items-center gap-2">
          <ArrowRightLeft size={20} />
          Material Flow Diagram
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-secondary dark:text-slate-400">Material</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-secondary dark:text-slate-400">Component</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-secondary dark:text-slate-400">Process</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-secondary dark:text-slate-400">Product</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 p-4 overflow-auto">
        <svg ref={svgRef} className="w-full" style={{ minHeight: '600px' }}></svg>
      </div>
    </div>
  );
};

export default MaterialFlowSankey;
