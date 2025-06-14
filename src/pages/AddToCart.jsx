import React, { useState, useContext } from 'react'
import { Eye, Edit, Search, ShoppingCart, Package, Truck, CheckCircle, Clock, X, Save, MapPin, User, Store, DollarSign, Filter } from 'lucide-react'
import useTheme from '../hooks/useTheme'

// Mock ThemeContext for demo
const ThemeContext = React.createContext({ isDark: false })

const mockCartData = [
  {
    id: 'cart_001', customerId: 'cust_123', customerName: 'John Doe', customerEmail: 'john@example.com', 
    customerPhone: '+91 9876543210', restaurantId: 'rest_001', restaurantName: 'Spice Garden',
    items: [
      { id: 'item_001', name: 'Butter Chicken', price: 320, quantity: 2, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=60&h=60&fit=crop' },
      { id: 'item_002', name: 'Garlic Naan', price: 80, quantity: 3, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=60&h=60&fit=crop' }
    ],
    totalAmount: 880, addedAt: '2024-06-14T10:30:00Z', lastUpdated: '2024-06-14T11:15:00Z',
    status: 'pending', orderStatus: 'cart', location: 'Mumbai, Maharashtra',
    estimatedDelivery: '2024-06-14T14:30:00Z', trackingId: 'TRK001'
  },
  {
    id: 'cart_002', customerId: 'cust_456', customerName: 'Sarah Wilson', customerEmail: 'sarah@example.com',
    customerPhone: '+91 8765432109', restaurantId: 'rest_002', restaurantName: 'Pizza Corner',
    items: [
      { id: 'item_003', name: 'Margherita Pizza', price: 450, quantity: 1, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=60&h=60&fit=crop' }
    ],
    totalAmount: 450, addedAt: '2024-06-14T09:45:00Z', lastUpdated: '2024-06-14T10:20:00Z',
    status: 'preparing', orderStatus: 'confirmed', location: 'Delhi, Delhi',
    estimatedDelivery: '2024-06-14T13:45:00Z', trackingId: 'TRK002'
  },
  {
    id: 'cart_003', customerId: 'cust_789', customerName: 'Rahul Sharma', customerEmail: 'rahul@example.com',
    customerPhone: '+91 7654321098', restaurantId: 'rest_003', restaurantName: 'Dosa Point',
    items: [
      { id: 'item_005', name: 'Masala Dosa', price: 180, quantity: 2, image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=60&h=60&fit=crop' }
    ],
    totalAmount: 360, addedAt: '2024-06-14T12:00:00Z', lastUpdated: '2024-06-14T12:30:00Z',
    status: 'shipped', orderStatus: 'out-for-delivery', location: 'Bangalore, Karnataka',
    estimatedDelivery: '2024-06-14T15:00:00Z', trackingId: 'TRK003'
  },
  {
    id: 'cart_004', customerId: 'cust_101', customerName: 'Priya Patel', customerEmail: 'priya@example.com',
    customerPhone: '+91 9988776655', restaurantId: 'rest_001', restaurantName: 'Spice Garden',
    items: [
      { id: 'item_006', name: 'Chicken Biryani', price: 280, quantity: 1, image: 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=60&h=60&fit=crop' }
    ],
    totalAmount: 280, addedAt: '2024-06-13T18:00:00Z', lastUpdated: '2024-06-14T08:00:00Z',
    status: 'delivered', orderStatus: 'delivered', location: 'Ahmedabad, Gujarat',
    estimatedDelivery: '2024-06-13T21:00:00Z', trackingId: 'TRK004'
  }
]

const orderStatuses = [
  { key: 'cart', label: 'In Cart', icon: ShoppingCart, color: '#6b7280' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: '#059669' },
  { key: 'preparing', label: 'Preparing', icon: Clock, color: '#d97706' },
  { key: 'ready', label: 'Ready', icon: Package, color: '#7c3aed' },
  { key: 'out-for-delivery', label: 'Out for Delivery', icon: Truck, color: '#2563eb' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, color: '#059669' }
]

export default function AddToCart() {
  const { isDark } = useTheme()
  const [carts, setCarts] = useState(mockCartData)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState('')
  const [editData, setEditData] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const getFilteredCarts = () => {
    let filtered = carts.filter(c => 
      c.customerName.toLowerCase().includes(search.toLowerCase()) || 
      c.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      c.restaurantName.toLowerCase().includes(search.toLowerCase()) ||
      c.trackingId.toLowerCase().includes(search.toLowerCase())
    )
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.orderStatus === statusFilter)
    }
    
    // Apply category filter
    switch (activeFilter) {
      case 'pending': return filtered.filter(c => ['cart', 'confirmed'].includes(c.orderStatus))
      case 'active': return filtered.filter(c => ['preparing', 'ready', 'out-for-delivery'].includes(c.orderStatus))
      case 'completed': return filtered.filter(c => c.orderStatus === 'delivered')
      case 'high-value': return filtered.filter(c => c.totalAmount >= 500)
      default: return filtered
    }
  }

  const filtered = getFilteredCarts()

  const handleEdit = (cart) => {
    setEditData({ ...cart })
    setModal('edit')
  }

  const handleSave = () => {
    setCarts(prev => prev.map(c => c.id === editData.id ? editData : c))
    setModal('')
    setEditData(null)
  }

  const getStatusInfo = (status) => orderStatuses.find(s => s.key === status) || orderStatuses[0]

  const stats = [
    { label: 'Total Orders', value: carts.length, icon: ShoppingCart, color: '#c79e73', filter: 'all', description: 'All orders' },
    { label: 'Pending', value: carts.filter(c => ['cart', 'confirmed'].includes(c.orderStatus)).length, icon: Clock, color: '#d97706', filter: 'pending', description: 'Orders waiting to be processed' },
    { label: 'Active', value: carts.filter(c => ['preparing', 'ready', 'out-for-delivery'].includes(c.orderStatus)).length, icon: Package, color: '#2563eb', filter: 'active', description: 'Orders in progress' },
    { label: 'High Value (₹500+)', value: carts.filter(c => c.totalAmount >= 500).length, icon: DollarSign, color: '#059669', filter: 'high-value', description: 'High value orders' }
  ]

  const formatTime = (timestamp) => new Date(timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

  // Theme classes
  const bg = isDark ? 'bg-gray-900' : 'bg-gray-50'
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white'
  const textPrimary = isDark ? 'text-white' : 'text-gray-900'
  const textSecondary = isDark ? 'text-gray-300' : 'text-gray-600'
  const textTertiary = isDark ? 'text-gray-400' : 'text-gray-500'
  const border = isDark ? 'border-gray-700' : 'border-gray-200'
  const inputBg = isDark ? 'bg-gray-700' : 'bg-white'
  const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
  const modalBg = isDark ? 'bg-gray-800' : 'bg-white'
  const overlayBg = isDark ? 'bg-gray-700' : 'bg-gray-50'

  return (
    <div className={`min-h-screen ${bg} p-4 transition-colors`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${textPrimary} mb-1`}>Order Management</h1>
        <p className={`text-sm ${textSecondary}`}>Track and manage customer orders with real-time status updates</p>
        {(activeFilter !== 'all' || statusFilter !== 'all') && (
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className={`text-sm ${textSecondary}`}>Filtered by:</span>
            {activeFilter !== 'all' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-medium">
                {stats.find(s => s.filter === activeFilter)?.description}
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium">
                Status: {orderStatuses.find(s => s.key === statusFilter)?.label}
              </span>
            )}
            <button 
              onClick={() => { setActiveFilter('all'); setStatusFilter('all') }} 
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${textTertiary}`} />
          <input
            type="text" 
            placeholder="Search by customer, restaurant, or tracking ID..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 border ${border} ${inputBg} ${textPrimary} placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none transition-colors`}
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className={`w-4 h-4 ${textTertiary}`} />
            <span className={`text-sm font-medium ${textSecondary}`}>Order Status:</span>
          </div>
          
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              statusFilter === 'all' 
                ? 'bg-blue-500 text-white' 
                : `${cardBg} ${textSecondary} border ${border} hover:bg-gray-100 dark:hover:bg-gray-700`
            }`}
          >
            All Orders ({carts.length})
          </button>

          {orderStatuses.map((status) => {
            const StatusIcon = status.icon
            const count = carts.filter(c => c.orderStatus === status.key).length
            const isActive = statusFilter === status.key
            
            return (
              <button
                key={status.key}
                onClick={() => setStatusFilter(status.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center gap-1.5 ${
                  isActive 
                    ? 'text-white' 
                    : `${cardBg} ${textSecondary} border ${border} hover:bg-gray-100 dark:hover:bg-gray-700`
                }`}
                style={isActive ? { backgroundColor: status.color } : {}}
              >
                <StatusIcon className="w-3 h-3" />
                {status.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => {
          const IconComponent = stat.icon
          const isActive = activeFilter === stat.filter
          return (
            <div 
              key={i} 
              onClick={() => setActiveFilter(activeFilter === stat.filter ? 'all' : stat.filter)}
              className={`${cardBg} border rounded-lg p-4 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md transform hover:scale-105 ${
                isActive ? 'border-blue-400 ring-2 ring-blue-100 dark:ring-blue-900' : `${border} hover:border-gray-300 dark:hover:border-gray-600`
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${textSecondary}`}>{stat.label}</p>
                  <p className={`text-xl font-bold ${textPrimary}`}>{stat.value}</p>
                  {isActive && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Click to clear filter</p>}
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-opacity ${isActive ? 'opacity-100' : 'opacity-80'}`} style={{ backgroundColor: stat.color }}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className={`text-sm ${textSecondary}`}>
          Showing {filtered.length} of {carts.length} orders
          {(activeFilter !== 'all' || statusFilter !== 'all') && (
            <span>
              {activeFilter !== 'all' && ` (filtered by ${stats.find(s => s.filter === activeFilter)?.description?.toLowerCase()})`}
              {statusFilter !== 'all' && ` (status: ${orderStatuses.find(s => s.key === statusFilter)?.label})`}
            </span>
          )}
        </p>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className={textTertiary}>
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No orders found</p>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          </div>
        ) : (
          filtered.map((cart) => {
            const statusInfo = getStatusInfo(cart.orderStatus)
            const StatusIcon = statusInfo.icon
            return (
              <div key={cart.id} className={`${cardBg} ${border} rounded-lg border shadow-sm overflow-hidden`}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <h3 className={`font-semibold text-sm ${textPrimary}`}>{cart.customerName}</h3>
                        <p className={`text-xs ${textSecondary}`}>{cart.trackingId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ backgroundColor: statusInfo.color + '20', color: statusInfo.color }}>
                      <StatusIcon className="w-3 h-3" />
                      {statusInfo.label}
                    </div>
                  </div>
                  
                  <div className={`space-y-1 mb-3 text-xs ${textSecondary}`}>
                    <div className="flex items-center gap-1">
                      <Store className="w-3 h-3" /> {cart.restaurantName}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {cart.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-3 h-3" /> {cart.items.length} items • ₹{cart.totalAmount}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatTime(cart.addedAt)}
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="mb-3">
                    <div className="flex -space-x-1">
                      {cart.items.slice(0, 3).map((item, idx) => (
                        <img key={idx} src={item.image} alt={item.name} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 object-cover" />
                      ))}
                      {cart.items.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                          <span className="text-xs text-gray-600 dark:text-gray-300">+{cart.items.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setSelected(cart); setModal('view') }} 
                      className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs rounded transition-colors ${
                      isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    >
                      <Eye className="w-3 h-3" /> View
                    </button>
                    <button 
                      onClick={() => handleEdit(cart)} 
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs text-white rounded transition-colors"
                      style={{ backgroundColor: '#c79e73' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#b8926a'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#c79e73'}
                    >
                      <Edit className="w-3 h-3" /> Update
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* View Modal */}
      {modal === 'view' && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`${modalBg} rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`p-4 border-b ${border} flex items-center justify-between`}>
              <h2 className={`text-lg font-bold ${textPrimary}`}>Order Details - {selected.trackingId}</h2>
              <button onClick={() => setModal('')} className={`p-2 ${hoverBg} rounded-lg`}>
                <X className={`w-5 h-5 ${textSecondary}`} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Order Status Timeline */}
              <div>
                <h3 className={`font-semibold mb-3 ${textPrimary}`}>Order Status</h3>
                <div className="space-y-2">
                  {orderStatuses.map((status, idx) => {
                    const StatusIcon = status.icon
                    const isCompleted = orderStatuses.findIndex(s => s.key === selected.orderStatus) >= idx
                    const isCurrent = status.key === selected.orderStatus
                    return (
                      <div key={status.key} className={`flex items-center gap-3 p-2 rounded ${isCurrent ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}>
                          <StatusIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className={`text-sm ${isCompleted || isCurrent ? textPrimary : textSecondary}`}>{status.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Customer & Restaurant Info */}
              <div className={`grid grid-cols-2 gap-4 text-sm ${textSecondary}`}>
                <div>
                  <h4 className={`font-medium mb-2 ${textPrimary}`}>Customer</h4>
                  <div className="space-y-1">
                    <div>{selected.customerName}</div>
                    <div>{selected.customerEmail}</div>
                    <div>{selected.customerPhone}</div>
                    <div>{selected.location}</div>
                  </div>
                </div>
                <div>
                  <h4 className={`font-medium mb-2 ${textPrimary}`}>Restaurant</h4>
                  <div>{selected.restaurantName}</div>
                  <div className="mt-2">
                    <div>Estimated Delivery: {formatTime(selected.estimatedDelivery)}</div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className={`font-medium mb-2 ${textPrimary}`}>Items ({selected.items.length})</h4>
                <div className="space-y-2">
                  {selected.items.map((item) => (
                    <div key={item.id} className={`flex items-center gap-3 p-2 ${overlayBg} rounded`}>
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />
                      <div className="flex-1">
                        <div className={`font-medium text-sm ${textPrimary}`}>{item.name}</div>
                        <div className={`text-xs ${textSecondary}`}>₹{item.price} × {item.quantity}</div>
                      </div>
                      <div className={`font-medium ${textPrimary}`}>₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>
                <div className={`flex justify-between items-center mt-3 pt-3 border-t ${border} font-semibold ${textPrimary}`}>
                  <span>Total</span>
                  <span>₹{selected.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {modal === 'edit' && editData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`${modalBg} rounded-xl max-w-md w-full`}>
            <div className={`p-4 border-b ${border} flex items-center justify-between`}>
              <h2 className={`text-lg font-bold ${textPrimary}`}>Update Order Status</h2>
              <button onClick={() => setModal('')} className={`p-2 ${hoverBg} rounded-lg`}>
                <X className={`w-5 h-5 ${textSecondary}`} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Order Status</label>
                <select 
                  value={editData.orderStatus} 
                  onChange={(e) => setEditData({...editData, orderStatus: e.target.value})}
                  className={`w-full p-3 border ${border} ${inputBg} ${textPrimary} rounded text-sm`}
                >
                  {orderStatuses.map(status => (
                    <option key={status.key} value={status.key}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Estimated Delivery</label>
                <input 
                  type="datetime-local"
                  value={editData.estimatedDelivery ? new Date(editData.estimatedDelivery).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setEditData({...editData, estimatedDelivery: e.target.value ? new Date(e.target.value).toISOString() : ''})}
                  className={`w-full p-3 border ${border} ${inputBg} ${textPrimary} rounded text-sm`}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg transition-colors text-sm"
                  style={{ backgroundColor: '#c79e73' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#b8926a'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#c79e73'}
                >
                  <Save className="w-4 h-4" /> Update Order
                </button>
                <button 
                  onClick={() => setModal('')}
                   className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}