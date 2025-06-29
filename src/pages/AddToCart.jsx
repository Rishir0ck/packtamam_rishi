import React, { useState, useMemo } from 'react'
import { Eye, Edit, Search, ShoppingCart, Package, Truck, CheckCircle, Clock, X, Save, User, Filter, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react'
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

export default function OrderTableManagement() {
  const [carts, setCarts] = useState(mockCartData)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState('')
  const [editData, setEditData] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: 'addedAt', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const { isDark } = useTheme()

  // Theme configuration
  const theme = isDark ? {
    bg: 'bg-gray-900',
    card: 'bg-gray-800',
    text: 'text-white',
    muted: 'text-gray-300',
    border: 'border-gray-700',
    input: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400',
    hover: 'hover:bg-gray-700',
    tableHeader: 'bg-gray-700',
    tableRow: 'hover:bg-gray-750',
    btn: 'bg-gray-700 hover:bg-gray-600 text-white',
    statCard: 'bg-gray-800 border-gray-700',
    modal: 'bg-gray-800',
    isDark: true
  } : {
    bg: 'bg-gray-50',
    card: 'bg-white',
    text: 'text-gray-900',
    muted: 'text-gray-600',
    border: 'border-gray-200',
    input: 'bg-white border-gray-200 placeholder-gray-500',
    hover: 'hover:bg-gray-50',
    tableHeader: 'bg-gray-50',
    tableRow: 'hover:bg-gray-50',
    btn: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    statCard: 'bg-white border-gray-200',
    modal: 'bg-white',
    isDark: false
  }

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const sortedAndFiltered = useMemo(() => {
    let result = carts.filter(c => {
      const searchMatch = [c.customerName, c.restaurantName, c.trackingId]
        .some(field => field.toLowerCase().includes(search.toLowerCase()))
      const filterMatch = filter === 'all' || c.orderStatus === filter
      return searchMatch && filterMatch
    })

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key]
        let bVal = b[sortConfig.key]
        
        if (sortConfig.key === 'totalAmount') {
          aVal = Number(aVal)
          bVal = Number(bVal)
        } else if (sortConfig.key.includes('At') || sortConfig.key.includes('Delivery')) {
          aVal = new Date(aVal)
          bVal = new Date(bVal)
        }
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return result
  }, [carts, search, filter, sortConfig])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return sortedAndFiltered.slice(start, start + itemsPerPage)
  }, [sortedAndFiltered, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedAndFiltered.length / itemsPerPage)

  const handleEdit = (cart) => { setEditData({ ...cart }); setModal('edit') }
  const handleSave = () => { 
    setCarts(prev => prev.map(c => c.id === editData.id ? editData : c))
    setModal('')
    setEditData(null)
  }

  const getStatusInfo = (status) => orderStatuses.find(s => s.key === status) || orderStatuses[0]
  const formatTime = (timestamp) => new Date(timestamp).toLocaleString('en-IN', { 
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
  })

  const stats = orderStatuses.map(status => ({
    ...status,
    count: carts.filter(c => c.orderStatus === status.key).length
  }))

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronUp className={`w-3 h-3 ${theme.muted} opacity-30`} />
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-3 h-3 text-blue-500" /> : 
      <ChevronDown className="w-3 h-3 text-blue-500" />
  }

  const StatusBadge = ({ status }) => {
    const info = getStatusInfo(status)
    const Icon = info.icon
    return (
      <div className="flex items-center gap-1">
        <Icon className="w-3 h-3" style={{ color: info.color }} />
        <span className="text-xs font-medium" style={{ color: info.color }}>{info.label}</span>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-200`}>
      <div className="p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${theme.text} mb-1`}>Order Management</h1>
            <p className={`text-sm ${theme.muted}`}>Track and manage customer orders</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2 mb-4">
          <div 
            onClick={() => setFilter('all')}
            className={`${theme.statCard} rounded-lg p-3 border cursor-pointer hover:shadow-md transition-all ${
              filter === 'all' ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${theme.muted}`}>Total</p>
                <p className={`text-lg font-bold ${theme.text}`}>{carts.length}</p>
              </div>
              <ShoppingCart className={`w-4 h-4 ${theme.muted}`} />
            </div>
          </div>
          {stats.map((stat) => (
            <div 
              key={stat.key}
              onClick={() => setFilter(filter === stat.key ? 'all' : stat.key)}
              className={`${theme.statCard} rounded-lg p-3 border cursor-pointer hover:shadow-md transition-all ${
                filter === stat.key ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${theme.muted}`}>{stat.label}</p>
                  <p className={`text-lg font-bold ${theme.text}`}>{stat.count}</p>
                </div>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-2 mb-4 items-center">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme.muted}`} />
            <input
              type="text" 
              placeholder="Search orders..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme.input}`}
            />
          </div>
        </div>

        {/* Table */}
        <div className={`${theme.card} rounded-lg border shadow-sm overflow-hidden ${theme.border}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${theme.tableHeader} border-b ${theme.border}`}>
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => handleSort('trackingId')} className={`flex items-center gap-1 text-xs font-medium ${theme.muted} hover:text-blue-500 transition-colors`}>
                      Order ID <SortIcon column="trackingId" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => handleSort('customerName')} className={`flex items-center gap-1 text-xs font-medium ${theme.muted} hover:text-blue-500 transition-colors`}>
                      Customer <SortIcon column="customerName" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => handleSort('restaurantName')} className={`flex items-center gap-1 text-xs font-medium ${theme.muted} hover:text-blue-500 transition-colors`}>
                      Restaurant <SortIcon column="restaurantName" />
                    </button>
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${theme.muted}`}>Items</th>
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => handleSort('totalAmount')} className={`flex items-center gap-1 text-xs font-medium ${theme.muted} hover:text-blue-500 transition-colors`}>
                      Amount <SortIcon column="totalAmount" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => handleSort('orderStatus')} className={`flex items-center gap-1 text-xs font-medium ${theme.muted} hover:text-blue-500 transition-colors`}>
                      Status <SortIcon column="orderStatus" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => handleSort('addedAt')} className={`flex items-center gap-1 text-xs font-medium ${theme.muted} hover:text-blue-500 transition-colors`}>
                      Order Time <SortIcon column="addedAt" />
                    </button>
                  </th>
                  <th className={`px-4 py-3 text-center text-xs font-medium ${theme.muted}`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {paginatedData.map((cart) => (
                  <tr key={cart.id} className={`border-b ${theme.tableRow} transition-colors`}>
                    <td className="px-4 py-3">
                      <div className={`font-medium text-sm ${theme.text}`}>{cart.trackingId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
                          <User className={`w-3 h-3 ${theme.muted}`} />
                        </div>
                        <div>
                          <div className={`font-medium text-sm ${theme.text}`}>{cart.customerName}</div>
                          <div className={`text-xs ${theme.muted}`}>{cart.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`text-sm ${theme.text}`}>{cart.restaurantName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex -space-x-1">
                        {cart.items.slice(0, 3).map((item, idx) => (
                          <img key={idx} src={item.image} alt="" className="w-6 h-6 rounded border-2 border-white object-cover" />
                        ))}
                        {cart.items.length > 3 && (
                          <div className={`w-6 h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded border-2 ${isDark ? 'border-gray-800' : 'border-white'} flex items-center justify-center`}>
                            <span className={`text-xs font-medium ${theme.muted}`}>+{cart.items.length - 3}</span>
                          </div>
                        )}
                      </div>
                      <div className={`text-xs ${theme.muted} mt-1`}>{cart.items.length} items</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`font-semibold text-sm ${theme.text}`}>₹{cart.totalAmount}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={cart.orderStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <div className={`text-sm ${theme.text}`}>{formatTime(cart.addedAt)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-center">
                        <button 
                          onClick={() => { setSelected(cart); setModal('view') }} 
                          className={`p-1 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} rounded transition-colors`}
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleEdit(cart)} 
                          className="p-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={`px-4 py-3 ${theme.tableHeader} border-t ${theme.border} flex items-center justify-between`}>
            <div className={`text-sm ${theme.muted}`}>
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, sortedAndFiltered.length)} to {Math.min(currentPage * itemsPerPage, sortedAndFiltered.length)} of {sortedAndFiltered.length} results
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed ${theme.border} ${theme.hover} transition-colors`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + Math.max(1, currentPage - 2)
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2 py-1 text-sm border rounded transition-colors ${
                      currentPage === page 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : `${theme.border} ${theme.hover}`
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed ${theme.border} ${theme.hover} transition-colors`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* View Modal */}
        {modal === 'view' && selected && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className={`${theme.modal} rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className={`p-4 border-b ${theme.border} flex items-center justify-between`}>
                <h2 className={`text-lg font-bold ${theme.text}`}>Order Details - {selected.trackingId}</h2>
                <button onClick={() => setModal('')} className={`p-2 ${theme.hover} rounded-lg transition-colors`}>
                  <X className={`w-5 h-5 ${theme.text}`} />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className={`font-medium mb-2 ${theme.text}`}>Customer</h4>
                    <div className={`space-y-1 ${theme.muted}`}>
                      <div>{selected.customerName}</div>
                      <div>{selected.customerEmail}</div>
                      <div>{selected.customerPhone}</div>
                      <div>{selected.location}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className={`font-medium mb-2 ${theme.text}`}>Restaurant</h4>
                    <div className={theme.muted}>
                      <div>{selected.restaurantName}</div>
                      <div className="mt-2">Est. Delivery: {formatTime(selected.estimatedDelivery)}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className={`font-medium mb-2 ${theme.text}`}>Items ({selected.items.length})</h4>
                  <div className="space-y-2">
                    {selected.items.map((item) => (
                      <div key={item.id} className={`flex items-center gap-3 p-2 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded`}>
                        <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover" />
                        <div className="flex-1">
                          <div className={`font-medium text-sm ${theme.text}`}>{item.name}</div>
                          <div className={`text-xs ${theme.muted}`}>₹{item.price} × {item.quantity}</div>
                        </div>
                        <div className={`font-medium ${theme.text}`}>₹{item.price * item.quantity}</div>
                      </div>
                    ))}
                  </div>
                  <div className={`flex justify-between items-center mt-3 pt-3 border-t ${theme.border} font-semibold ${theme.text}`}>
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
            <div className={`${theme.modal} rounded-xl max-w-md w-full`}>
              <div className={`p-4 border-b ${theme.border} flex items-center justify-between`}>
                <h2 className={`text-lg font-bold ${theme.text}`}>Update Order Status</h2>
                <button onClick={() => setModal('')} className={`p-2 ${theme.hover} rounded-lg transition-colors`}>
                  <X className={`w-5 h-5 ${theme.text}`} />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.muted}`}>Order Status</label>
                  <select 
                    value={editData.orderStatus} 
                    onChange={(e) => setEditData({...editData, orderStatus: e.target.value})}
                    className={`w-full p-3 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme.input}`}
                  >
                    {orderStatuses.map(status => (
                      <option key={status.key} value={status.key}>{status.label}</option>
                    ))}
                  </select>
                </div>

                <div className={`flex gap-2 pt-4 border-t ${theme.border}`}>
                  <button 
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#c79e73' }}
                  >
                    <Save className="w-4 h-4" /> Update Order
                  </button>
                  <button 
                    onClick={() => setModal('')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${theme.btn}`}
                  >
                    Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}