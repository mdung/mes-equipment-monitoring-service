import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

function QualityTrends() {
  const [paretoData, setParetoData] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchParetoData();
    fetchTrendsData();
  }, [days]);

  const fetchParetoData = async () => {
    try {
      const response = await api.get(`/quality-management/defects/pareto?days=${days}`);
      setParetoData(response.data);
    } catch (error) {
      console.error('Error fetching pareto data:', error);
    }
  };

  const fetchTrendsData = async () => {
    try {
      const response = await api.get(`/quality-management/trends?days=${days}`);
      const trendData = response.data.trendData;
      const chartData = Object.keys(trendData).map(date => ({
        date,
        defects: trendData[date]
      })).sort((a, b) => new Date(a.date) - new Date(b.date));
      setTrendsData(chartData);
    } catch (error) {
      console.error('Error fetching trends data:', error);
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Quality Trends & Pareto Analysis</h2>
          <p className="text-gray-600">Visualize defect patterns and trends</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="border rounded px-3 py-2"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {/* Pareto Chart */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Pareto Chart - Defects by Category</h3>
        {paretoData && paretoData.data && paretoData.data.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={paretoData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="quantity" fill="#3b82f6" name="Defect Quantity" />
              <Line yAxisId="right" type="monotone" dataKey="cumulativePercentage" stroke="#ef4444" name="Cumulative %" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">No defect data available</div>
        )}
        {paretoData && (
          <div className="mt-4 text-sm text-gray-600">
            Total Defects: {paretoData.totalDefects}
          </div>
        )}
      </div>

      {/* Trend Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Defect Trend Over Time</h3>
        {trendsData && trendsData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="defects" stroke="#3b82f6" strokeWidth={2} name="Defects" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">No trend data available</div>
        )}
      </div>
    </div>
  );
}

export default QualityTrends;
