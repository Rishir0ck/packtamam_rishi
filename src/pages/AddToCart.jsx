import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Eye, Edit, Search, ShoppingCart, CheckCircle, Truck, X, Save, User, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, RefreshCcw } from 'lucide-react'
import useTheme from '../hooks/useTheme'
import adminApiService from '../Firebase/services/adminApiService' // Adjust path as needed

const orderStatuses = [
  { key: 'cart', label: 'Cart', icon: ShoppingCart, color: '#6b7280' },
  { key: 'confirmed', label: 'Payment Done', icon: CheckCircle, color: '#059669' },
  { key: 'out-for-delivery', label: 'Assign Delivery Partner', icon: Truck, color: '#2563eb' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, color: '#059669' }
]

export default function OrderManagement() {
  const [orders, setOrders] = useState([])
  const [deliveryPartners, setDeliveryPartners] = useState([])
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

  // API calls
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

  // Transform cart data to match order format
  const transformCartData = useCallback((cartItems) => {
    return cartItems.map(item => ({
      id: `cart_${item.id}`,
      trackingId: `CART-${item.id}`,
      customerName: 'Cart User', // You might want to get this from user data
      customerEmail: '',
      customerPhone: '',
      restaurantName: 'Product Store',
      location: 'N/A',
      items: [{
        id: item.product.id,
        name: item.product.name,
        image: item.product.images?.[0]?.image_url || '',
        price: item.priceWithGst,
        quantity: item.add
      }],
      totalAmount: item.priceWithGst,
      deliveryPartner: '',
      orderStatus: 'cart',
      addedAt: item.created_at,
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      user_id: item.user_id
    }))
  }, [])

  // Transform order data to match expected format
  const transformOrderData = useCallback((orderItems) => {
    return orderItems.map(order => ({
      id: order.id,
      trackingId: order.order_id,
      customerName: order.user?.owner_name || 'Unknown Customer',
      customerEmail: order.user?.email || '',
      customerPhone: order.user?.mobile_number || '',
      restaurantName: order.user?.business_name || 'Business',
      location: order.address || order.city || 'N/A',
      items: order.order_items?.map(item => ({
        id: item.product.id,
        name: item.product.name,
        image: item.product.images?.[0]?.image_url || '',
        price: item.priceWithGst,
        quantity: item.add,
        packOff: item.packOff,
        gst: item.gst
      })) || [],
      totalAmount: order.amount,
      deliveryPartner: order.delivery_partner?.name || '',
      orderStatus: order.payment_status === 'paid' ? 'confirmed' : 'cart',
      addedAt: order.created_at,
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      user_id: order.user_id,
      payment_status: order.payment_status,
      delivery_status: order.delivery_status
    }))
  }, [])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [ordersRes, cartRes, partnersRes] = await Promise.all([
        adminApiService.getOrderList(),
        adminApiService.getCartList(),
        adminApiService.getDeliveryPartners()
      ])
      
      console.log('Orders Response:', ordersRes)
      console.log('Cart Response:', cartRes)
      console.log('Partners Response:', partnersRes)
      
      // Extract data from nested structure
      const ordersData = ordersRes?.data?.data || ordersRes?.data || []
      const cartData = cartRes?.data?.data || cartRes?.data || []
      const partnersData = partnersRes?.data?.data || partnersRes?.data || []
      
      console.log('Extracted Orders Data:', ordersData)
      console.log('Extracted Cart Data:', cartData)
      console.log('Extracted Partners Data:', partnersData)
      
      // Transform the data to match expected format
      const transformedOrders = transformOrderData(ordersData)
      const transformedCart = transformCartData(cartData)
      
      // Combine orders and cart data
      const allOrders = [...transformedOrders, ...transformedCart]
      
      console.log('Final Orders:', allOrders)
      console.log('Final Partners:', partnersData)
      
      setOrders(allOrders)
      setDeliveryPartners(partnersData)
      // ADD THIS LINE: Reset filter to show all data
      setFilter('cart')
    } catch (error) {
      console.error('Failed to fetch data:', error)
      alert('Failed to load data. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }, [transformOrderData, transformCartData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [])

  const sortedAndFiltered = useMemo(() => {
    let result = orders.filter(o => {
      const searchMatch = [o.customerName, o.restaurantName, o.trackingId]
        .some(field => field?.toLowerCase().includes(search.toLowerCase()))
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

    // Find the selected delivery partner's ID
    const selectedPartner = deliveryPartners.find(partner => partner.name === editData.deliveryPartner)
    if (!selectedPartner) {
      alert('Selected delivery partner not found')
      return
    }
    const updatePayload = {
      id: editData.id, // or editData.trackingId if that's the order ID
      delivery_partner_id: selectedPartner.id, // This is the delivery partner ID
      tracking_id: editData.trackingId,
      status: editData.orderStatus
    }
    console.log('Update payload:', updatePayload) // Debug log
    apiCall(
      () => adminApiService.updateDeliveryPartners(updatePayload),
      (result) => {
        console.log('Update result:', result) // Debug log
        setOrders(prev => prev.map(order => 
        order.id === editData.id ? {
          ...order,
          deliveryPartner: editData.deliveryPartner,
          trackingId: editData.trackingId,
          orderStatus: editData.orderStatus
        } : order
      ))
        setModal('')
        setEditData(null)
        alert('Order updated successfully!')
      }
    )
  }, [editData, apiCall, deliveryPartners])

  const getStatusInfo = useCallback((status) => 
    orderStatuses.find(s => s.key === status) || orderStatuses[0], [])

  const formatTime = useCallback((timestamp) => {
    if (!timestamp) return 'N/A'
    // Handle different timestamp formats
    let date
    if (timestamp.includes('/')) {
      // Format: "04/07/2025, 01:50:54"
      const [datePart, timePart] = timestamp.split(', ')
      const [day, month, year] = datePart.split('/')
      date = new Date(`${year}-${month}-${day}T${timePart}`)
    } else {
      date = new Date(timestamp)
    }
    
    return date.toLocaleString('en-IN', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    })
  }, [])

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

  if (loading && orders.length === 0) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className={`text-center ${theme.text}`}>
          <RefreshCcw className={`w-8 h-8 animate-spin mx-auto mb-4`} />
          <p>Loading orders...</p>
        </div>
      </div>
    )
  }

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
                filter === stat.key ? 'ring-2 ring-amber-500' : ''
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

        {/* Search & Refresh */}
        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
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
                        {order.items?.slice(0, 3).map((item, idx) => (
                          <img key={idx} src={item.image} alt="" className="w-6 h-6 rounded border-2 border-white object-cover" />
                        ))}
                        {order.items?.length > 3 && (
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                            isDark ? 'bg-gray-700 border-gray-800' : 'bg-gray-200 border-gray-300'
                          }`}>
                            <span className={`text-xs font-medium ${theme.muted}`}>+{order.items.length - 3}</span>
                          </div>
                        )}
                      </div>
                      <div className={`text-xs ${theme.muted} mt-1`}>{order.items?.length || 0} items</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`font-semibold text-sm ${theme.text}`}>₹{order.totalAmount}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`font-medium text-sm ${theme.text}`}>{order.deliveryPartner || 'Not Assigned'}</div>
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
                        {order.orderStatus !== 'cart' && (
                        <button 
                          onClick={() => handleEdit(order)} 
                          className="p-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        )}
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
                    className={`px-2 py-1 text-sm rounded transition-colors ${
                      currentPage === page 
                        ? ' text-black' 
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
                <h4 className={`font-medium mb-2 ${theme.text}`}>Items ({selected.items?.length || 0})</h4>
                <div className="space-y-2">
                  {selected.items?.map((item) => (
                    <div key={item.id} className={`flex items-center gap-3 p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover" />
                      <div className="flex-1">
                        <div className={`font-medium text-sm ${theme.text}`}>{item.name}</div>
                        <div className={`text-xs ${theme.muted}`}>{item.packOff} (Pack Off) × {item.quantity} Add</div>
                        <div className={`text-xs ${theme.muted}`}>₹{item.price} (Incl. {item.gst}% tax)</div>
                      </div>
                      {/* <div className={`font-medium ${theme.text}`}>₹{item.price * item.quantity}</div> */}
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
                    <option value="">Select Delivery Partner</option>
                    {deliveryPartners.map(partner => (
                      <option key={partner.id} value={partner.name}>
                        {partner.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.text}`}>Tracking ID</label>
                  <input
                    type="text"
                    value={editData.trackingId}
                    disabled={true}
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
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#c79e73]  disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Update Order'}
                </button>
                {/* <button 
                  onClick={() => setModal('')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${theme.btn}`}
                >
                  Cancel
                </button> */}
              </div>
            </>
          )}
        </Modal>
      </div>
    </div>
  )
}