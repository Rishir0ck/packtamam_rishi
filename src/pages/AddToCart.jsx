import React, { useState, useMemo, useCallback } from 'react'
import { Eye, Edit, Search, ShoppingCart, CheckCircle, Truck, X, Save, User, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import useTheme from '../hooks/useTheme'

const adminService = {
  getOrders: async () => mockCartData,
  updateOrder: async (orderId, data) => data
}

const mockCartData = [
  {
    id: 'cart_001', customerId: 'cust_123', customerName: 'John Doe', customerEmail: 'john@example.com', 
    customerPhone: '+91 9876543210', restaurantId: 'rest_001', restaurantName: 'Spice Garden',
    items: [
      { id: 'item_001', name: 'Butter Chicken', price: 320, quantity: 2, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=60&h=60&fit=crop' },
      { id: 'item_002', name: 'Garlic Naan', price: 80, quantity: 3, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=60&h=60&fit=crop' }
    ],
    totalAmount: 880, addedAt: '2024-06-14T10:30:00Z', lastUpdated: '2024-06-14T11:15:00Z', deliveryPartner: 'blueDart',
    orderStatus: 'cart', location: 'Mumbai, Maharashtra', estimatedDelivery: '2024-06-14T14:30:00Z', trackingId: 'TRK001'
  },
  {
    id: 'cart_002', customerId: 'cust_456', customerName: 'Sarah Wilson', customerEmail: 'sarah@example.com',
    customerPhone: '+91 8765432109', restaurantId: 'rest_002', restaurantName: 'Pizza Corner',
    items: [
      { id: 'item_003', name: 'Margherita Pizza', price: 450, quantity: 1, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=60&h=60&fit=crop' }
    ],
    totalAmount: 450, addedAt: '2024-06-14T09:45:00Z', lastUpdated: '2024-06-14T10:20:00Z', deliveryPartner: 'dHLExpress',
    orderStatus: 'confirmed', location: 'Delhi, Delhi', estimatedDelivery: '2024-06-14T13:45:00Z', trackingId: 'TRK002'
  }
]

const orderStatuses = [
  { key: 'cart', label: 'Cart', icon: ShoppingCart, color: '#6b7280' },
  { key: 'confirmed', label: 'Payment Done', icon: CheckCircle, color: '#059669' },
  { key: 'out-for-delivery', label: 'Assign Delivery Partner', icon: Truck, color: '#2563eb' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, color: '#059669' }
]

const deliveryPartners = [
  { key: 'blueDart', label: 'Blue Dart'},
  { key: 'delhivery', label: 'Delhivery'},
  { key: 'fedEx', label: 'FedEx'},
  { key: 'dHLExpress', label: 'DHL Express'},
  { key: 'indiaPost(Speed Post)', label: 'India Post (Speed Post)'},
  { key: 'amazonTransportationServices(ATS)', label: 'Amazon Transportation Services'},
]

export default function OrderManagement() {
  const [orders, setOrders] = useState(mockCartData)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState('')
  const [editData, setEditData] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: 'addedAt', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const { isDark } = useTheme()

  // Theme configuration
  const theme = isDark ? {
    bg: 'bg-gray-900', card: 'bg-gray-800', text: 'text-white', muted: 'text-gray-300',
    border: 'border-gray-700', input: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400',
    hover: 'hover:bg-gray-700', tableHeader: 'bg-gray-700', tableRow: 'hover:bg-gray-750',
    btn: 'bg-gray-700 hover:bg-gray-600 text-white', modal: 'bg-gray-800'
  } : {
    bg: 'bg-gray-50', card: 'bg-white', text: 'text-gray-900', muted: 'text-gray-600',
    border: 'border-gray-200', input: 'bg-white border-gray-300 placeholder-gray-500',
    hover: 'hover:bg-gray-50', tableHeader: 'bg-gray-50', tableRow: 'hover:bg-gray-50',
    btn: 'bg-gray-100 hover:bg-gray-200 text-gray-700', modal: 'bg-white'
  }

  const apiCall = useCallback(async (operation, onSuccess) => {
    setLoading(true)
    try {
      const result = await operation()
      if (onSuccess) onSuccess(result)
    } catch (error) {
      console.error('API Error:', error)
      alert('Operation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [])

  const sortedAndFiltered = useMemo(() => {
    let result = orders.filter(o => {
      const searchMatch = [o.customerName, o.restaurantName, o.trackingId]
        .some(field => field.toLowerCase().includes(search.toLowerCase()))
      const filterMatch = filter === 'all' || o.orderStatus === filter
      return searchMatch && filterMatch
    })

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key], bVal = b[sortConfig.key]
        if (sortConfig.key === 'totalAmount') {
          aVal = Number(aVal); bVal = Number(bVal)
        } else if (sortConfig.key.includes('At') || sortConfig.key.includes('Delivery')) {
          aVal = new Date(aVal); bVal = new Date(bVal)
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return result
  }, [orders, search, filter, sortConfig])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return sortedAndFiltered.slice(start, start + itemsPerPage)
  }, [sortedAndFiltered, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedAndFiltered.length / itemsPerPage)

  const handleEdit = useCallback((order) => {
    setEditData({ ...order })
    setModal('edit')
  }, [])

  const handleSave = useCallback(() => {
    if (!editData) return
    apiCall(
      () => adminService.updateOrder(editData.id, editData),
      () => {
        setOrders(prev => prev.map(o => o.id === editData.id ? editData : o))
        setModal('')
        setEditData(null)
      }
    )
  }, [editData, apiCall])

  const getStatusInfo = useCallback((status) => 
    orderStatuses.find(s => s.key === status) || orderStatuses[0], [])

  const formatTime = useCallback((timestamp) => 
    new Date(timestamp).toLocaleString('en-IN', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    }), [])

  const stats = useMemo(() => 
    orderStatuses.map(status => ({
      ...status, count: orders.filter(o => o.orderStatus === status.key).length
    })), [orders])

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronUp className="w-3 h-3 opacity-30" />
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

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className={`${theme.modal} rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
          <div className={`p-4 border-b ${theme.border} flex items-center justify-between`}>
            <h2 className={`text-lg font-bold ${theme.text}`}>{title}</h2>
            <button onClick={onClose} className={`p-2 ${theme.hover} rounded-lg transition-colors`}>
              <X className={`w-5 h-5 ${theme.text}`} />
            </button>
          </div>
          {children}
        </div>
      </div>
    )
  }

  const columns = [
    { key: 'trackingId', label: 'Order ID' },
    { key: 'customerName', label: 'Customer' },
    { key: 'restaurantName', label: 'Restaurant' },
    { key: null, label: 'Items' },
    { key: 'totalAmount', label: 'Amount' },
    { key: 'deliveryPartner', label: 'Delivery Partner' },
    { key: 'orderStatus', label: 'Status' },
    { key: 'addedAt', label: 'Order Time' },
    { key: null, label: 'Actions' }
  ]

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-200`}>
      <div className="p-4 max-w-full mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className={`text-2xl font-bold ${theme.text} mb-1`}>Order Management</h1>
          <p className={`text-sm ${theme.muted}`}>Track and manage customer orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {stats.map((stat) => (
            <div 
              key={stat.key}
              onClick={() => setFilter(filter === stat.key ? 'all' : stat.key)}
              className={`${theme.card} rounded-lg p-3 border cursor-pointer hover:shadow-md transition-all ${
                filter === stat.key ? 'ring-2 ring-blue-500' : ''
              } ${theme.border}`}
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

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme.muted}`} />
            <input
              type="text" 
              placeholder="Search orders..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 border ${theme.input} rounded-lg focus:outline-none`}
            />
          </div>
        </div>

        {/* Table */}
        <div className={`${theme.card} rounded-lg border shadow-sm overflow-hidden ${theme.border}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${theme.tableHeader} border-b ${theme.border}`}>
                <tr>
                  {columns.map((col, i) => (
                    <th key={i} className={`px-4 py-3 text-left ${i === 8 ? 'text-center' : ''}`}>
                      {col.key ? (
                        <button onClick={() => handleSort(col.key)} className={`flex items-center gap-1 text-xs font-medium ${theme.muted}`}>
                          {col.label} <SortIcon column={col.key} />
                        </button>
                      ) : (
                        <span className={`text-xs font-medium ${theme.muted}`}>{col.label}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {paginatedData.map((order) => (
                  <tr key={order.id} className={`${theme.tableRow} transition-colors`}>
                    <td className="px-4 py-3">
                      <div className={`font-medium text-sm ${theme.text}`}>{order.trackingId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <User className={`w-3 h-3 ${theme.muted}`} />
                        </div>
                        <div>
                          <div className={`font-medium text-sm ${theme.text}`}>{order.customerName}</div>
                          <div className={`text-xs ${theme.muted}`}>{order.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`text-sm ${theme.text}`}>{order.restaurantName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex -space-x-1">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <img key={idx} src={item.image} alt="" className="w-6 h-6 rounded border-2 border-white object-cover" />
                        ))}
                        {order.items.length > 3 && (
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                            isDark ? 'bg-gray-700 border-gray-800' : 'bg-gray-200 border-gray-300'
                          }`}>
                            <span className={`text-xs font-medium ${theme.muted}`}>+{order.items.length - 3}</span>
                          </div>
                        )}
                      </div>
                      <div className={`text-xs ${theme.muted} mt-1`}>{order.items.length} items</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`font-semibold text-sm ${theme.text}`}>₹{order.totalAmount}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`font-medium text-sm ${theme.text}`}>{order.deliveryPartner}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <div className={`text-sm ${theme.text}`}>{formatTime(order.addedAt)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-center">
                        <button 
                          onClick={() => { setSelected(order); setModal('view') }} 
                          className={`p-1 rounded transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleEdit(order)} 
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
        <Modal isOpen={modal === 'view'} onClose={() => setModal('')} title={`Order Details - ${selected?.trackingId}`}>
          {selected && (
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
                    <div key={item.id} className={`flex items-center gap-3 p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
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
          )}
        </Modal>

        {/* Edit Modal */}
        <Modal isOpen={modal === 'edit'} onClose={() => setModal('')} title="Update Order Status">
          {editData && (
            <>
              <div className="p-4 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.text}`}>Delivery Partner</label>
                  <select 
                    value={editData.deliveryPartner} 
                    onChange={(e) => setEditData({...editData, deliveryPartner: e.target.value})}
                    className={`w-full p-3 border rounded text-sm focus:outline-none ${theme.input}`}
                  >
                    {deliveryPartners.map(partner => (
                      <option key={partner.key} value={partner.key}>{partner.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.text}`}>Tracking ID</label>
                  <input
                    type="text"
                    value={editData.trackingId}
                    onChange={(e) => setEditData({ ...editData, trackingId: e.target.value })}
                    className={`w-full p-3 border rounded text-sm focus:outline-none ${theme.input}`}
                    placeholder="Enter Tracking ID"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.text}`}>Order Status</label>
                  <select 
                    value={editData.orderStatus} 
                    onChange={(e) => setEditData({...editData, orderStatus: e.target.value})}
                    className={`w-full p-3 border rounded text-sm focus:outline-none ${theme.input}`}
                  >
                    {orderStatuses.map(status => (
                      <option key={status.key} value={status.key}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={`p-4 border-t flex gap-2 ${theme.border}`}>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Update Order'}
                </button>
                <button 
                  onClick={() => setModal('')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${theme.btn}`}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </Modal>
      </div>
    </div>
  )
}