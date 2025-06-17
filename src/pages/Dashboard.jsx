import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Clock, CheckCircle, Package, Users, ShoppingCart, AlertTriangle, BarChart3, Target, Loader2, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import useTheme from '../hooks/useTheme'
import AdminService from '../Firebase/services/adminApiService'

// Default/fallback data
const defaultKpiData = [
  { title: 'Total Revenue', value: '₹0', change: '0%', icon: TrendingUp, color: '#c79e73', isPositive: true },
  { title: 'Pending Approvals', value: '0', change: '0%', icon: Clock, color: '#43311e', isPositive: false },
  { title: 'Active Restaurants', value: '0', change: '0%', icon: Users, color: '#c79e73', isPositive: true },
  { title: 'Inventory Items', value: '0', change: '0%', icon: Package, color: '#43311e', isPositive: true },
]

const defaultChartData = [
  { name: 'Jan', revenue: 0, orders: 0 },
  { name: 'Feb', revenue: 0, orders: 0 },
  { name: 'Mar', revenue: 0, orders: 0 },
  { name: 'Apr', revenue: 0, orders: 0 },
  { name: 'May', revenue: 0, orders: 0 },
  { name: 'Jun', revenue: 0, orders: 0 },
]

const defaultInventoryData = [
  { name: 'No Data', value: 100, color: '#c79e73' },
]

const defaultStatsCards = [
  { title: 'Weekly Growth', value: '0%', icon: BarChart3, trend: 'up' },
  { title: 'Efficiency Rate', value: '0%', icon: Target, trend: 'up' },
  { title: 'Customer Satisfaction', value: '0/5', icon: Users, trend: 'up' },
]

export default function Dashboard() {
  const { isDark } = useTheme()
  const [animatedCards, setAnimatedCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // State for API data
  const [dashboardData, setDashboardData] = useState({
    kpiData: defaultKpiData,
    chartData: defaultChartData,
    inventoryData: defaultInventoryData,
    statsCards: defaultStatsCards,
    recentActivities: []
  })

  // Fetch dashboard data
  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      console.log('🔄 Fetching dashboard data...')
      
      // Fetch multiple endpoints concurrently
      const [
        pendingBusinessResponse,
        approvedBusinessResponse,
        rejectedBusinessResponse,
        queryBusinessResponse,
        productsResponse,
        outletsResponse,
        userDataResponse
      ] = await Promise.allSettled([
        AdminService.getPendingBusinessList(1, 10),
        AdminService.getApprovedBusinessList(1, 10),
        AdminService.getRejectedBusinessList(1, 10),
        AdminService.getQueryBusinessList(1, 10),
        AdminService.getProducts(),
        AdminService.getOutlets(),
        AdminService.getUserData()
      ])

      console.log('📊 API Responses:', {
        pending: pendingBusinessResponse.status,
        approved: approvedBusinessResponse.status,
        rejected: rejectedBusinessResponse.status,
        query: queryBusinessResponse.status,
        products: productsResponse.status,
        outlets: outletsResponse.status,
        userData: userDataResponse.status
      })

      // Process successful responses
      const pendingCount = pendingBusinessResponse.status === 'fulfilled' && pendingBusinessResponse.value.success 
        ? pendingBusinessResponse.value.data?.data?.length || 0 
        : 0

      const approvedCount = approvedBusinessResponse.status === 'fulfilled' && approvedBusinessResponse.value.success 
        ? approvedBusinessResponse.value.data?.data?.length || 0 
        : 0

      const rejectedCount = rejectedBusinessResponse.status === 'fulfilled' && rejectedBusinessResponse.value.success 
        ? rejectedBusinessResponse.value.data?.data?.length || 0 
        : 0

      const queryCount = queryBusinessResponse.status === 'fulfilled' && queryBusinessResponse.value.success 
        ? queryBusinessResponse.value.data?.data?.length || 0 
        : 0

      const productsCount = productsResponse.status === 'fulfilled' && productsResponse.value.success 
        ? productsResponse.value.data?.data?.length || 0 
        : 0

      const outletsCount = outletsResponse.status === 'fulfilled' && outletsResponse.value.success 
        ? outletsResponse.value.data?.data?.length || 0 
        : 0

      // Calculate totals and changes (you can implement proper change calculation based on historical data)
      const totalBusinesses = approvedCount + pendingCount + rejectedCount + queryCount
      const totalRevenue = approvedCount * 15000 // Example calculation
      
      // Update KPI data
      const updatedKpiData = [
        { 
          title: 'Total Revenue', 
          value: `₹${totalRevenue.toLocaleString()}`, 
          change: '+12.5%', // You can calculate this based on historical data
          icon: TrendingUp, 
          color: '#c79e73', 
          isPositive: true 
        },
        { 
          title: 'Pending Approvals', 
          value: pendingCount.toString(), 
          change: pendingCount > 5 ? '+8.2%' : '-5.1%', 
          icon: Clock, 
          color: '#43311e', 
          isPositive: pendingCount <= 5 
        },
        { 
          title: 'Active Restaurants', 
          value: approvedCount.toString(), 
          change: '+5.8%', 
          icon: Users, 
          color: '#c79e73', 
          isPositive: true 
        },
        { 
          title: 'Inventory Items', 
          value: productsCount.toString(), 
          change: '+15.3%', 
          icon: Package, 
          color: '#43311e', 
          isPositive: true 
        },
      ]

      // Generate chart data (you can implement based on your actual data structure)
      const chartData = [
        { name: 'Jan', revenue: Math.floor(totalRevenue * 0.7), orders: Math.floor(totalBusinesses * 0.8) },
        { name: 'Feb', revenue: Math.floor(totalRevenue * 0.8), orders: Math.floor(totalBusinesses * 0.85) },
        { name: 'Mar', revenue: Math.floor(totalRevenue * 0.9), orders: Math.floor(totalBusinesses * 0.9) },
        { name: 'Apr', revenue: Math.floor(totalRevenue * 0.85), orders: Math.floor(totalBusinesses * 0.88) },
        { name: 'May', revenue: Math.floor(totalRevenue * 0.95), orders: Math.floor(totalBusinesses * 0.95) },
        { name: 'Jun', revenue: totalRevenue, orders: totalBusinesses },
      ]

      // Generate inventory distribution
      const inventoryData = productsCount > 0 ? [
        { name: 'Active Products', value: Math.floor(productsCount * 0.7), color: '#c79e73' },
        { name: 'Pending Products', value: Math.floor(productsCount * 0.2), color: '#43311e' },
        { name: 'Out of Stock', value: Math.floor(productsCount * 0.1), color: '#d4af86' },
      ] : defaultInventoryData

      // Generate recent activities
      const recentActivities = [
        { 
          id: 1, 
          action: `${pendingCount} restaurants pending approval`, 
          time: '2 hours ago', 
          icon: Users, 
          color: 'text-amber-600', 
          bg: 'bg-amber-100 dark:bg-amber-900/20' 
        },
        { 
          id: 2, 
          action: `${productsCount} products in inventory`, 
          time: '4 hours ago', 
          icon: Package, 
          color: 'text-yellow-700', 
          bg: 'bg-yellow-100 dark:bg-yellow-900/20' 
        },
        { 
          id: 3, 
          action: `${approvedCount} restaurants approved`, 
          time: '6 hours ago', 
          icon: CheckCircle, 
          color: 'text-green-600', 
          bg: 'bg-green-100 dark:bg-green-900/20' 
        },
        { 
          id: 4, 
          action: `${outletsCount} outlets active`, 
          time: '8 hours ago', 
          icon: ShoppingCart, 
          color: 'text-blue-600', 
          bg: 'bg-blue-100 dark:bg-blue-900/20' 
        },
      ]

      // Update stats cards
      const statsCards = [
        { title: 'Approval Rate', value: `${totalBusinesses > 0 ? Math.round((approvedCount / totalBusinesses) * 100) : 0}%`, icon: BarChart3, trend: 'up' },
        { title: 'Active Outlets', value: outletsCount.toString(), icon: Target, trend: 'up' },
        { title: 'Total Businesses', value: totalBusinesses.toString(), icon: Users, trend: 'up' },
      ]

      setDashboardData({
        kpiData: updatedKpiData,
        chartData,
        inventoryData,
        statsCards,
        recentActivities
      })

      setLastUpdated(new Date())
      console.log('✅ Dashboard data updated successfully')

    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error)
      setError(error.message || 'Failed to fetch dashboard data')
      
      // Keep existing data if refresh fails
      if (!isRefresh) {
        setDashboardData({
          kpiData: defaultKpiData,
          chartData: defaultChartData,
          inventoryData: defaultInventoryData,
          statsCards: defaultStatsCards,
          recentActivities: []
        })
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Stagger animation for cards
  useEffect(() => {
    if (!loading) {
      setAnimatedCards([])
      dashboardData.kpiData.forEach((_, index) => {
        setTimeout(() => {
          setAnimatedCards(prev => [...prev, index])
        }, index * 100)
      })
    }
  }, [loading, dashboardData.kpiData])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing dashboard data...')
      fetchDashboardData(true)
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [])

  // Handle manual refresh
  const handleRefresh = () => {
    fetchDashboardData(true)
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-amber-600" />
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading dashboard data...
          </p>
        </div>
      </div>
    )
  }

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
            {lastUpdated && (
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className={`px-3 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base flex items-center gap-2 ${
                refreshing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'
              }`}
              style={{ backgroundColor: isDark ? '#6b7280' : '#9ca3af', color: 'white' }}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button 
              className="px-4 sm:px-6 py-2 text-white rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
              style={{ backgroundColor: isDark ? '#43311e' : '#c79e73' }}
            >
              Export Report
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className={`${isDark ? 'bg-red-900/20 border-red-500/30 text-red-300' : 'bg-red-50 border-red-200 text-red-700'} 
            border rounded-xl p-4 flex items-center gap-3`}>
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error loading dashboard data</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
            <button 
              onClick={() => fetchDashboardData()}
              className="ml-auto px-3 py-1 rounded-lg text-sm font-medium hover:bg-opacity-80 transition-colors"
              style={{ backgroundColor: isDark ? '#dc2626' : '#ef4444', color: 'white' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* KPI Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {dashboardData.kpiData.map((item, index) => (
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
          {dashboardData.statsCards.map((card, index) => (
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
              <LineChart data={dashboardData.chartData}>
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
              Business Distribution
            </h3>
            <ResponsiveContainer width="100%" height={200} className="lg:!h-64">
              <PieChart>
                <Pie
                  data={dashboardData.inventoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                  className="lg:!inner-radius-[70] lg:!outer-radius-[110]"
                >
                  {dashboardData.inventoryData.map((entry, index) => (
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
              {dashboardData.inventoryData.map((item, index) => (
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
            System Overview
          </h3>
          <div className="space-y-3 lg:space-y-4">
            {dashboardData.recentActivities.map((activity, index) => (
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