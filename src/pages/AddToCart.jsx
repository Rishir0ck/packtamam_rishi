import React, { useState } from 'react'
import { Eye, Edit, Search, ShoppingCart, Package, Truck, CheckCircle, Clock, X, Save, User, Filter } from 'lucide-react'
import useTheme from '../hooks/useTheme'

const mockCartData = [
  {
    id: 'cart_001', customerId: 'cust_123', customerName: 'John Doe', customerEmail: 'john@example.com', 
    customerPhone: '+91 9876543210', restaurantId: 'rest_001', restaurantName: 'Spice Garden',
    items: [
      { id: 'item_001', name: 'Butter Chicken', price: 320, quantity: 2, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=60&h=60&fit=crop' },
      { id: 'item_002', name: 'Garlic Naan', price: 80, quantity: 3, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=60&h=60&fit=crop' }
    ],
    totalAmount: 880, addedAt: '2024-06-14T10:30:00Z', lastUpdated: '2024-06-14T11:15:00Z',
    orderStatus: 'cart', location: 'Mumbai, Maharashtra', estimatedDelivery: '2024-06-14T14:30:00Z', trackingId: 'TRK001'
  },
  {
    id: 'cart_002', customerId: 'cust_456', customerName: 'Sarah Wilson', customerEmail: 'sarah@example.com',
    customerPhone: '+91 8765432109', restaurantId: 'rest_002', restaurantName: 'Pizza Corner',
    items: [
      { id: 'item_003', name: 'Margherita Pizza', price: 450, quantity: 1, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=60&h=60&fit=crop' }
    ],
    totalAmount: 450, addedAt: '2024-06-14T09:45:00Z', lastUpdated: '2024-06-14T10:20:00Z',
    orderStatus: 'confirmed', location: 'Delhi, Delhi', estimatedDelivery: '2024-06-14T13:45:00Z', trackingId: 'TRK002'
  },
  {
    id: 'cart_003', customerId: 'cust_789', customerName: 'Rahul Sharma', customerEmail: 'rahul@example.com',
    customerPhone: '+91 7654321098', restaurantId: 'rest_003', restaurantName: 'Dosa Point',
    items: [
      { id: 'item_005', name: 'Masala Dosa', price: 180, quantity: 2, image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=60&h=60&fit=crop' }
    ],
    totalAmount: 360, addedAt: '2024-06-14T12:00:00Z', lastUpdated: '2024-06-14T12:30:00Z',
    orderStatus: 'out-for-delivery', location: 'Bangalore, Karnataka', estimatedDelivery: '2024-06-14T15:00:00Z', trackingId: 'TRK003'
  },
  {
    id: 'cart_004', customerId: 'cust_101', customerName: 'Priya Patel', customerEmail: 'priya@example.com',
    customerPhone: '+91 9988776655', restaurantId: 'rest_001', restaurantName: 'Spice Garden',
    items: [
      { id: 'item_006', name: 'Chicken Biryani', price: 280, quantity: 1, image: 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=60&h=60&fit=crop' }
    ],
    totalAmount: 280, addedAt: '2024-06-13T18:00:00Z', lastUpdated: '2024-06-14T08:00:00Z',
    orderStatus: 'delivered', location: 'Ahmedabad, Gujarat', estimatedDelivery: '2024-06-13T21:00:00Z', trackingId: 'TRK004'
  },
  {
    id: 'cart_005', customerId: 'cust_202', customerName: 'Amit Kumar', customerEmail: 'amit@example.com',
    customerPhone: '+91 8877665544', restaurantId: 'rest_002', restaurantName: 'Pizza Corner',
    items: [
      { id: 'item_007', name: 'Pepperoni Pizza', price: 520, quantity: 1, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=60&h=60&fit=crop' }
    ],
    totalAmount: 520, addedAt: '2024-06-14T11:00:00Z', lastUpdated: '2024-06-14T11:30:00Z',
    orderStatus: 'preparing', location: 'Chennai, Tamil Nadu', estimatedDelivery: '2024-06-14T14:00:00Z', trackingId: 'TRK005'
  },
  {
    id: 'cart_006', customerId: 'cust_303', customerName: 'Sneha Reddy', customerEmail: 'sneha@example.com',
    customerPhone: '+91 7766554433', restaurantId: 'rest_003', restaurantName: 'Dosa Point',
    items: [
      { id: 'item_008', name: 'Rava Dosa', price: 160, quantity: 2, image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=60&h=60&fit=crop' }
    ],
    totalAmount: 320, addedAt: '2024-06-14T13:00:00Z', lastUpdated: '2024-06-14T13:15:00Z',
    orderStatus: 'ready', location: 'Hyderabad, Telangana', estimatedDelivery: '2024-06-14T16:00:00Z', trackingId: 'TRK006'
  }
]

const orderStatuses = [
  { key: 'cart', label: 'Cart', icon: ShoppingCart, color: '#6b7280' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: '#059669' },
  { key: 'preparing', label: 'Preparing', icon: Clock, color: '#d97706' },
  { key: 'ready', label: 'Ready', icon: Package, color: '#7c3aed' },
  { key: 'out-for-delivery', label: 'Delivery', icon: Truck, color: '#2563eb' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, color: '#059669' }
]

export default function AddToCart() {
  const { isDark } = useTheme()
  const [carts, setCarts] = useState(mockCartData)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState('')
  const [editData, setEditData] = useState(null)

  const filtered = carts.filter(c => {
    const searchMatch = [c.customerName, c.restaurantName, c.trackingId]
      .some(field => field.toLowerCase().includes(search.toLowerCase()))
    const filterMatch = filter === 'all' || c.orderStatus === filter
    return searchMatch && filterMatch
  })

  const handleEdit = (cart) => { setEditData({ ...cart }); setModal('edit') }
  const handleSave = () => { setCarts(prev => prev.map(c => c.id === editData.id ? editData : c)); setModal(''); setEditData(null) }
  const getStatusInfo = (status) => orderStatuses.find(s => s.key === status) || orderStatuses[0]

  const stats = [
    { label: 'Total', value: carts.length, icon: ShoppingCart, color: '#c79e73', filter: 'all' },
    { label: 'Cart', value: carts.filter(c => c.orderStatus === 'cart').length, icon: ShoppingCart, color: '#6b7280', filter: 'cart' },
    { label: 'Confirmed', value: carts.filter(c => c.orderStatus === 'confirmed').length, icon: CheckCircle, color: '#059669', filter: 'confirmed' },
    { label: 'Preparing', value: carts.filter(c => c.orderStatus === 'preparing').length, icon: Clock, color: '#d97706', filter: 'preparing' },
    { label: 'Ready', value: carts.filter(c => c.orderStatus === 'ready').length, icon: Package, color: '#7c3aed', filter: 'ready' },
    { label: 'Delivery', value: carts.filter(c => c.orderStatus === 'out-for-delivery').length, icon: Truck, color: '#2563eb', filter: 'out-for-delivery' },
    { label: 'Delivered', value: carts.filter(c => c.orderStatus === 'delivered').length, icon: CheckCircle, color: '#10b981', filter: 'delivered' }
  ]

  const statusColors = {
    cart: isDark ? 'bg-gray-800/50 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200',
    confirmed: isDark ? 'bg-emerald-900/30 text-emerald-300 border-emerald-600' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    preparing: isDark ? 'bg-amber-900/30 text-amber-300 border-amber-600' : 'bg-amber-50 text-amber-700 border-amber-200',
    ready: isDark ? 'bg-purple-900/30 text-purple-300 border-purple-600' : 'bg-purple-50 text-purple-700 border-purple-200',
    'out-for-delivery': isDark ? 'bg-blue-900/30 text-blue-300 border-blue-600' : 'bg-blue-50 text-blue-700 border-blue-200',
    delivered: isDark ? 'bg-emerald-900/30 text-emerald-300 border-emerald-600' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }

  const formatTime = (timestamp) => new Date(timestamp).toLocaleString('en-IN', { 
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
  })

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4 transition-colors`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>Order Management</h1>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Track and manage customer orders</p>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          <input
            type="text" 
            placeholder="Search orders..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 border ${
              isDark 
                ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' 
                : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
          />
        </div>
        <div className="relative">
          <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)} 
            className={`pl-9 pr-8 py-2.5 border ${
              isDark 
                ? 'border-gray-600 bg-gray-800 text-white' 
                : 'border-gray-200 bg-white text-gray-900'
            } rounded-lg focus:outline-none appearance-none min-w-[140px] transition-colors`}
          >
            <option value="all">All Orders</option>
            {orderStatuses.map(status => (
              <option key={status.key} value={status.key}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {stats.map((stat, i) => {
          const IconComponent = stat.icon
          return (
            <div 
              key={i} 
              onClick={() => setFilter(filter === stat.filter ? 'all' : stat.filter)}
              className={`${
                isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
              } rounded-lg p-3 shadow-sm border cursor-pointer transition-all duration-200 hover:shadow-md ${
                filter === stat.filter ? 'ring-2' : ''
              }`}
              style={{ ringColor: filter === stat.filter ? '#c79e73' : 'transparent' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color }}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Order Cards */}
      <div className="space-y-3">
        {filtered.map((cart) => {
          const statusInfo = getStatusInfo(cart.orderStatus)
          return (
            <div key={cart.id} className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm p-4 transition-colors`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                    <User className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{cart.customerName}</h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {cart.restaurantName} • ₹{cart.totalAmount} • {cart.items.length} items
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[cart.orderStatus]}`}>
                    {statusInfo.label}
                  </span>
                  
                  <button 
                    onClick={() => { setSelected(cart); setModal('view') }} 
                    className={`p-2 ${
                      isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    } rounded-lg transition-colors`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  <button 
                    onClick={() => handleEdit(cart)} 
                    className="p-2 text-white rounded-lg transition-colors hover:opacity-80"
                    style={{ backgroundColor: '#c79e73' }}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* View Modal */}
      {modal === 'view' && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Order Details - {selected.trackingId}</h2>
              <button onClick={() => setModal('')} className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}>
                <X className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Order Status Timeline */}
              <div>
                <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Order Status</h3>
                <div className="space-y-2">
                  {orderStatuses.map((status, idx) => {
                    const StatusIcon = status.icon
                    const isCompleted = orderStatuses.findIndex(s => s.key === selected.orderStatus) >= idx
                    const isCurrent = status.key === selected.orderStatus
                    return (
                      <div key={status.key} className={`flex items-center gap-3 p-2 rounded ${isCurrent ? (isDark ? 'bg-blue-900/30' : 'bg-blue-50') : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-gray-300'
                        }`}>
                          <StatusIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className={`text-sm ${
                          isCompleted || isCurrent 
                            ? (isDark ? 'text-white' : 'text-gray-900') 
                            : (isDark ? 'text-gray-400' : 'text-gray-600')
                        }`}>
                          {status.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Customer & Restaurant Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Customer</h4>
                  <div className={`space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div>{selected.customerName}</div>
                    <div>{selected.customerEmail}</div>
                    <div>{selected.customerPhone}</div>
                    <div>{selected.location}</div>
                  </div>
                </div>
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Restaurant</h4>
                  <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div>{selected.restaurantName}</div>
                    <div className="mt-2">Estimated Delivery: {formatTime(selected.estimatedDelivery)}</div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Items ({selected.items.length})</h4>
                <div className="space-y-2">
                  {selected.items.map((item) => (
                    <div key={item.id} className={`flex items-center gap-3 p-2 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded`}>
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />
                      <div className="flex-1">
                        <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>₹{item.price} × {item.quantity}</div>
                      </div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>
                <div className={`flex justify-between items-center mt-3 pt-3 border-t ${
                  isDark ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'
                } font-semibold`}>
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
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-md w-full`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Update Order Status</h2>
              <button onClick={() => setModal('')} className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}>
                <X className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Order Status</label>
                <select 
                  value={editData.orderStatus} 
                  onChange={(e) => setEditData({...editData, orderStatus: e.target.value})}
                  className={`w-full p-3 border ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-200 bg-white text-gray-900'
                  } rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                >
                  {orderStatuses.map(status => (
                    <option key={status.key} value={status.key}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Estimated Delivery</label>
                <input 
                  type="datetime-local"
                  value={editData.estimatedDelivery ? new Date(editData.estimatedDelivery).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setEditData({...editData, estimatedDelivery: e.target.value ? new Date(e.target.value).toISOString() : ''})}
                  className={`w-full p-3 border ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-200 bg-white text-gray-900'
                  } rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                />
              </div>

              <div className={`flex gap-2 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button 
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg transition-colors text-sm hover:opacity-80"
                  style={{ backgroundColor: '#c79e73' }}
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