import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Clock, CheckCircle, Package, Users, ShoppingCart, AlertTriangle, BarChart3, Target } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

// Import the actual useTheme hook
import useTheme from '../hooks/useTheme'

const kpiData = [
  { title: 'Total Revenue', value: '₹2,45,678', change: '+12.5%', icon: TrendingUp, color: '#c79e73', isPositive: true },
  { title: 'Pending Approvals', value: '23', change: '-8.2%', icon: Clock, color: '#43311e', isPositive: false },
  { title: 'Active Restaurants', value: '156', change: '+5.8%', icon: Users, color: '#c79e73', isPositive: true },
  { title: 'Inventory Items', value: '1,234', change: '+15.3%', icon: Package, color: '#43311e', isPositive: true },
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
  { name: 'Cutlery', value: 35, color: '#c79e73' },
  { name: 'Plates', value: 25, color: '#43311e' },
  { name: 'Glasses', value: 20, color: '#d4af86' },
  { name: 'Containers', value: 20, color: '#5c4633' },
]

const recentActivities = [
  { id: 1, action: 'New restaurant registered', time: '2 hours ago', icon: Users, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/20' },
  { id: 2, action: 'Inventory updated for Cutlery', time: '4 hours ago', icon: Package, color: 'text-yellow-700', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
  { id: 3, action: 'Approval pending for Restaurant XYZ', time: '6 hours ago', icon: Clock, color: 'text-stone-600', bg: 'bg-stone-100 dark:bg-stone-900/20' },
  { id: 4, action: 'Order completed - 150 items', time: '8 hours ago', icon: CheckCircle, color: 'text-amber-700', bg: 'bg-amber-100 dark:bg-amber-900/20' },
]

const statsCards = [
  { title: 'Weekly Growth', value: '18.2%', icon: BarChart3, trend: 'up' },
  { title: 'Efficiency Rate', value: '94.8%', icon: Target, trend: 'up' },
  { title: 'Customer Satisfaction', value: '4.9/5', icon: Users, trend: 'up' },
]

export default function Dashboard() {
  const { isDark } = useTheme() // Using the proper theme hook
  const [animatedCards, setAnimatedCards] = useState([])

  useEffect(() => {
    // Stagger animation for cards
    kpiData.forEach((_, index) => {
      setTimeout(() => {
        setAnimatedCards(prev => [...prev, index])
      }, index * 100)
    })
  }, [])

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="space-y-2">
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${isDark ? 'text-stone-500' : 'text-stone-800'}`}>
              Dashboard
            </h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-stone-600'} text-base lg:text-lg opacity-80`}>
              Welcome back! Here's your food inventory overview.
            </p>
          </div>
          <div className="flex justify-end">
            <button 
              className="px-4 sm:px-6 py-2 text-white rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
              style={{ backgroundColor: isDark ? '#43311e' : '#c79e73' }}
            >
              Export Report
            </button>
          </div>
        </div>

        {/* KPI Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {kpiData.map((item, index) => (
            <div 
              key={index} 
              className={`${isDark ? 'bg-gray-800/80 border-gray-700/50 backdrop-blur-sm' : 'bg-white/80 border-gray-200/50 backdrop-blur-sm'} 
                rounded-2xl lg:rounded-3xl p-4 lg:p-6 border shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2
                ${animatedCards.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                animate-pulse-subtle`}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <div 
                  className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300"
                  style={{ backgroundColor: item.color }}
                >
                  <item.icon className="w-5 h-5 lg:w-7 lg:h-7 text-white" />
                </div>
                <div className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-bold shadow-md border transition-all duration-300 hover:scale-105 ${
                  item.isPositive 
                    ? isDark 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-emerald-500/20' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-200/50'
                    : isDark 
                      ? 'bg-red-500/20 text-red-300 border-red-500/30 shadow-red-500/20' 
                      : 'bg-red-50 text-red-700 border-red-200 shadow-red-200/50'
                }`}>
                  {item.change}
                </div>
              </div>
              <h3 className={`text-xl lg:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 tracking-tight`}>
                {item.value}
              </h3>
              <p className={`text-xs lg:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-stone-600'}`}>
                {item.title}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Stats Row - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {statsCards.map((card, index) => (
            <div key={index} className={`${isDark ? 'bg-gray-800/60 to-stone-800/40 border-gray-700/30' : 'bg-white border-amber-200/30'} 
                rounded-xl lg:rounded-2xl p-4 lg:p-6 border backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs lg:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-stone-600'} mb-1`}>
                    {card.title}
                  </p>
                  <p className={`text-lg lg:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {card.value}
                  </p>
                </div>
                <div 
                  className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: isDark ? '#c79e73' : '#43311e' }}
                >
                  <card.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row - Responsive */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Revenue Chart */}
          <div className={`${isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/80 border-gray-200/50'} rounded-2xl lg:rounded-3xl p-4 lg:p-8 border shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300`}>
            <h3 className={`text-lg lg:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 lg:mb-6 flex items-center gap-3`}>
              <div 
                className="w-6 h-6 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: isDark ? '#c79e73' : '#43311e' }}
              >
                <BarChart3 className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
              </div>
              Revenue Overview
            </h3>
            <ResponsiveContainer width="100%" height={250} className="lg:!h-80">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="name" stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} />
                <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                    borderRadius: '12px',
                    color: isDark ? '#ffffff' : '#000000',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#c79e73" 
                  strokeWidth={3} 
                  dot={{ fill: '#43311e', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#c79e73' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Inventory Distribution */}
          <div className={`${isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/80 border-gray-200/50'} rounded-2xl lg:rounded-3xl p-4 lg:p-8 border shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300`}>
            <h3 className={`text-lg lg:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 lg:mb-6 flex items-center gap-3`}>
              <div 
                className="w-6 h-6 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: isDark ? '#43311e' : '#c79e73' }}
              >
                <Target className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
              </div>
              Inventory Distribution
            </h3>
            <ResponsiveContainer width="100%" height={200} className="lg:!h-64">
              <PieChart>
                <Pie
                  data={inventoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                  className="lg:!inner-radius-[70] lg:!outer-radius-[110]"
                >
                  {inventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                    borderRadius: '12px',
                    color: isDark ? '#ffffff' : '#000000',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 lg:gap-4 mt-4 lg:mt-6">
              {inventoryData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 lg:space-x-3 group">
                  <div 
                    className="w-3 h-3 lg:w-4 lg:h-4 rounded-full transition-transform duration-200 group-hover:scale-125" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className={`text-xs lg:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} group-hover:text-current transition-colors`}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities - Responsive */}
        <div className={`${isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/80 border-gray-200/50'} rounded-2xl lg:rounded-3xl p-4 lg:p-8 border shadow-xl backdrop-blur-sm`}>
          <h3 className={`text-lg lg:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 lg:mb-6 flex items-center gap-3`}>
            <div 
              className="w-6 h-6 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: isDark ? '#c79e73' : '#43311e' }}
            >
              <Clock className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
            </div>
            Recent Activities
          </h3>
          <div className="space-y-3 lg:space-y-4">
            {recentActivities.map((activity, index) => (
              <div 
                key={activity.id} 
                className={`flex items-center space-x-3 lg:space-x-4 p-3 lg:p-4 rounded-xl lg:rounded-2xl ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50/80'} 
                  transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md group cursor-pointer`}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl ${activity.bg} flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}>
                  <activity.icon className={`w-4 h-4 lg:w-5 lg:h-5 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} group-hover:text-current transition-colors text-sm lg:text-base truncate`}>
                    {activity.action}
                  </p>
                  <p className={`text-xs lg:text-sm ${isDark ? 'text-gray-400' : 'text-stone-500'} mt-1`}>
                    {activity.time}
                  </p>
                </div>
                <div 
                  className="w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0"
                  style={{ backgroundColor: isDark ? '#c79e73' : '#43311e' }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}