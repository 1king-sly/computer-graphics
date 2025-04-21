'use client'
import { useState } from 'react';
import {
  LineChart,
  BarChart,
  PieChart,
  Line,
  Bar,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { CurveType } from 'recharts/types/shape/Curve';

export default function PlottingApp() {
  // Sample data
  const initialData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 900 },
  ];

  const [data, setData] = useState(initialData);
  const [chartType, setChartType] = useState('line');
  const [lineType, setLineType] = useState('linear');
  const [lineColor, setLineColor] = useState('#8884d8');
  const [lineStyle, setLineStyle] = useState('solid');
  const [showInputPanel, setShowInputPanel] = useState(false);
  const [newDataPoint, setNewDataPoint] = useState({ name: '', value: '' });

  // Color palette for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const addDataPoint = () => {
    if (newDataPoint.name && newDataPoint.value) {
      setData([...data, { 
        name: newDataPoint.name, 
        value: parseInt(newDataPoint.value, 10) 
      }]);
      setNewDataPoint({ name: '', value: '' });
    }
  };

  const resetData = () => {
    setData(initialData);
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart width={600} height={300} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type={lineType as CurveType} 
              dataKey="value" 
              stroke={lineColor} 
              strokeWidth={2}
              strokeDasharray={lineStyle === 'dashed' ? '5 5' : lineStyle === 'dotted' ? '2 2' : '0'} 
            />
          </LineChart>
        );
      case 'polyline':
        return (
          <LineChart width={600} height={300} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="linear" 
              dataKey="value" 
              stroke={lineColor} 
              strokeWidth={2}
              strokeDasharray={lineStyle === 'dashed' ? '5 5' : lineStyle === 'dotted' ? '2 2' : '0'} 
            />
          </LineChart>
        );
      case 'strip':
        return (
          <LineChart width={600} height={300} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type={lineType as CurveType} 
              dataKey="value" 
              stroke={lineColor} 
              strokeWidth={2}
              dot={{ stroke: lineColor, strokeWidth: 2, r: 4, fill: 'white' }}
              strokeDasharray={lineStyle === 'dashed' ? '5 5' : lineStyle === 'dotted' ? '2 2' : '0'} 
            />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart width={600} height={300} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill={lineColor} />
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart width={600} height={300}>
            <Pie
              data={data}
              cx={300}
              cy={150}
              labelLine={true}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
      default:
        return <div>Select a chart type</div>;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Interactive 2D Plotting Application</h1>
      
      <div className="mb-6 bg-white p-4 rounded-md shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Chart Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Chart Type:</label>
                <select
                title='chartType'
                  value={chartType} 
                  onChange={(e) => setChartType(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="line">Line Chart</option>
                  <option value="strip">Strip Chart</option>
                  <option value="polyline">Polyline Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                </select>
              </div>
              
              {(chartType === 'line' || chartType === 'strip' || chartType === 'polyline') && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Line Type:</label>
                    <select 
                                    title='lineType'

                      value={lineType} 
                      onChange={(e) => setLineType(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="linear">Linear</option>
                      <option value="monotone">Monotone</option>
                      <option value="step">Step</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Line Style:</label>
                    <select 
                                                        title='lineStyle'

                      value={lineStyle} 
                      onChange={(e) => setLineStyle(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                    </select>
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Color:</label>
                <div className="flex items-center space-x-2">
                  <input 
                  title='color'
                    type="color" 
                    value={lineColor} 
                    onChange={(e) => setLineColor(e.target.value)}
                    className="w-10 h-10 border rounded"
                  />
                  <span className="text-sm">{lineColor}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Data Management</h2>
            <div className="space-y-4">
              <button 
                onClick={() => setShowInputPanel(!showInputPanel)} 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {showInputPanel ? 'Hide Data Editor' : 'Add New Data Point'}
              </button>
              
              <button 
                onClick={resetData} 
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Reset to Default Data
              </button>
              
              {showInputPanel && (
                <div className="mt-4 p-4 border rounded bg-gray-50">
                  <div className="flex flex-col space-y-2">
                    <input 
                      type="text" 
                      placeholder="Category/Label" 
                      value={newDataPoint.name}
                      onChange={(e) => setNewDataPoint({...newDataPoint, name: e.target.value})}
                      className="p-2 border rounded"
                    />
                    <input 
                      type="number" 
                      placeholder="Value" 
                      value={newDataPoint.value}
                      onChange={(e) => setNewDataPoint({...newDataPoint, value: e.target.value})}
                      className="p-2 border rounded"
                    />
                    <button 
                      onClick={addDataPoint} 
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Add Point
                    </button>
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <h3 className="text-md font-medium mb-2">Current Data:</h3>
                <div className="max-h-40 overflow-y-auto border rounded p-2">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.map((item, index) => (
                        <tr key={index}>
                          <td className="px-2 py-1 whitespace-nowrap">{item.name}</td>
                          <td className="px-2 py-1 whitespace-nowrap">{item.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-white p-4 rounded-md shadow overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Chart Preview</h2>
        <div className="flex justify-center">
          {renderChart()}
        </div>
      </div>
    </div>
  );
}