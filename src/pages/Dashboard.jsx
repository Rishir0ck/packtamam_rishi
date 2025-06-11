import React from 'react'
import { TrendingUp, TrendingDown, Clock, CheckCircle, Package, Users, ShoppingCart, AlertTriangle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import useTheme from '../hooks/useTheme'

const kpiData = [
  { title: 'Total Revenue', value: '₹2,45,678', change: '+12.5%', icon: TrendingUp, color: 'from-green-500 to-emerald-600', isPositive: true },
  { title: 'Pending Approvals', value: '23', change: '-8.2%', icon: Clock, color: 'from-orange-500 to-red-600', isPositive: false },
  { title: 'Active Restaurants', value: '156', change: '+5.8%', icon: Users, color: 'from-blue-500 to-cyan-600', isPositive: true },
  { title: 'Inventory Items', value: '1,234', change: '+15.3%', icon: Package, color: 'from-purple-500 to-pink-600', isPositive: true },
]

const chartData = [
  { name: 'Jan', revenue: 40000, orders: 240 },
  { name: 'Feb', revenue: 45000, orders: 280 },
  { name: 'Mar', revenue: 52000, orders: 320 },
  { name: 'Apr', revenue: 48000, orders: 295 },
  { name: 'May', revenue: 58000, orders: 350 },
  { name: 'Jun', revenue: 62000, orders: 380 },
]

const inventoryData = [
  { name: 'Cutlery', value: 35, color: '#8884d8' },
  { name: 'Plates', value: 25, color: '#82ca9d' },
  { name: 'Glasses', value: 20, color: '#ffc658' },
  { name: 'Containers', value: 20, color: '#ff7300' },
]

const recentActivities = [
  { id: 1, action: 'New restaurant registered', time: '2 hours ago', icon: Users, color: 'text-green-500' },
  { id: 2, action: 'Inventory updated for Cutlery', time: '4 hours ago', icon: Package, color: 'text-blue-500' },
  { id: 3, action: 'Approval pending for Restaurant XYZ', time: '6 hours ago', icon: Clock, color: 'text-orange-500' },
  { id: 4, action: 'Order completed - 150 items', time: '8 hours ago', icon: CheckCircle, color: 'text-green-500' },
]

export default function Dashboard() {
  const { isDark } = useTheme()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Welcome back! Here's your food inventory overview.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((item, index) => (
          <div key={index} className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border shadow-sm hover:shadow-lg transition-all duration-200 transform hover:scale-105`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <span className={`text-sm font-medium ${item.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {item.change}
              </span>
            </div>
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>{item.value}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.title}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border shadow-sm`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="name" stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: isDark ? '#ffffff' : '#000000'
                }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Inventory Distribution */}
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border shadow-sm`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Inventory Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={inventoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {inventoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: isDark ? '#ffffff' : '#000000'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {inventoryData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border shadow-sm`}>
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Recent Activities</h3>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
                <activity.icon className={`w-4 h-4 ${activity.color}`} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{activity.action}</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}