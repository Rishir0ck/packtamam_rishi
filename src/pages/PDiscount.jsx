import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Edit, Save, Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, DollarSign, Percent, Tag, Package, Calendar, X, RefreshCw } from 'lucide-react'
import Modal from './Modal'
import ActionButton from './ActionButton'
import useTheme from '../hooks/useTheme'

// Dummy API - replace with your real API
const dummyAPI = {
  getDiscounts: async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return [
      {
        id: 1, name: "Summer Sale", type: "amount", value: 1000, minTicketSize: 10000, maxTicketSize: 20000,
        assignedTo: "category", assignedItems: ["Electronics", "Clothing"], timeRestricted: true,
        startDate: "2024-07-01", endDate: "2024-07-31", recurring: false, isActive: true
      },
      {
        id: 2, name: "VIP Discount", type: "percentage", value: 15, minTicketSize: 5000, maxTicketSize: null,
        assignedTo: "product", assignedItems: ["iPhone 15", "MacBook Pro"], timeRestricted: false,
        recurring: true, recurringDays: [25, 30], isActive: true
      }
    ]
  },
  saveDiscount: async (discount) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return { ...discount, id: discount.id || Date.now() }
  },
  deleteDiscount: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return true
  },
  getCategories: async () => ["Electronics", "Clothing", "Home & Garden", "Sports", "Books"],
  getProducts: async () => ["iPhone 15", "MacBook Pro", "Samsung TV", "Nike Shoes", "Adidas Jacket"]
}

export default function DiscountModule() {
  const [discounts, setDiscounts] = useState([])
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [modal, setModal] = useState('')
  const [editData, setEditData] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { isDark } = useTheme()

  const theme = isDark ? {
    bg: 'bg-gray-900', card: 'bg-gray-800', text: 'text-white', muted: 'text-gray-300',
    border: 'border-gray-700', input: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400',
    hover: 'hover:bg-gray-700', tableHeader: 'bg-gray-700', tableRow: 'hover:bg-gray-750',
    btn: 'bg-gray-700 hover:bg-gray-600 text-white', isDark: true
  } : {
    bg: 'bg-gray-50', card: 'bg-white', text: 'text-gray-900', muted: 'text-gray-600',
    border: 'border-gray-200', input: 'bg-white border-gray-300 placeholder-gray-500',
    hover: 'hover:bg-gray-50', tableHeader: 'bg-gray-50', tableRow: 'hover:bg-gray-50',
    btn: 'bg-gray-100 hover:bg-gray-200 text-gray-700', isDark: false
  }

  const initialFormData = {
    name: '', type: 'amount', value: '', minTicketSize: '', maxTicketSize: '',
    assignedTo: 'category', assignedItems: [], timeRestricted: false, startDate: '', endDate: '',
    recurring: false, recurringDays: [], isActive: true
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [discountsData, categoriesData, productsData] = await Promise.all([
        dummyAPI.getDiscounts(), dummyAPI.getCategories(), dummyAPI.getProducts()
      ])
      setDiscounts(discountsData)
      setCategories(categoriesData)
      setProducts(productsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
    setCurrentPage(1)
  }, [])

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return discounts
    return [...discounts].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [discounts, sortConfig])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return sortedData.slice(start, start + itemsPerPage)
  }, [sortedData, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

  const handleFieldChange = useCallback((field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleArrayChange = useCallback((field, item, checked) => {
    setEditData(prev => ({
      ...prev,
      [field]: checked ? [...prev[field], item] : prev[field].filter(i => i !== item)
    }))
  }, [])

  const saveItem = useCallback(async () => {
    if (!editData?.name?.trim()) return alert('Discount name is required')
    
    try {
      setSaving(true)
      const discountData = {
        ...editData,
        value: parseFloat(editData.value),
        minTicketSize: editData.minTicketSize ? parseFloat(editData.minTicketSize) : null,
        maxTicketSize: editData.maxTicketSize ? parseFloat(editData.maxTicketSize) : null,
      }
      
      const saved = await dummyAPI.saveDiscount(discountData)
      
      if (editData.id) {
        setDiscounts(prev => prev.map(d => d.id === editData.id ? saved : d))
      } else {
        setDiscounts(prev => [...prev, saved])
      }
      
      setModal('')
      setEditData(null)
    } catch (error) {
      console.error('Error saving discount:', error)
    } finally {
      setSaving(false)
    }
  }, [editData])

  const deleteItem = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this discount?')) {
      try {
        await dummyAPI.deleteDiscount(id)
        setDiscounts(prev => prev.filter(d => d.id !== id))
      } catch (error) {
        console.error('Error deleting discount:', error)
      }
    }
  }, [])

  const openModal = useCallback((item = null) => {
    setEditData(item ? {
      ...item,
      minTicketSize: item.minTicketSize?.toString() || '',
      maxTicketSize: item.maxTicketSize?.toString() || '',
      value: item.value.toString(),
      recurringDays: item.recurringDays || []
    } : initialFormData)
    setModal('editDiscount')
  }, [])

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronUp className="w-4 h-4 opacity-30" />
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-500" />
      : <ChevronDown className="w-4 h-4 text-blue-500" />
  }

  const Pagination = () => (
    <div className={`flex items-center justify-between px-4 py-3 border-t ${theme.border}`}>
      <div className="flex items-center gap-2">
        <span className={`text-sm ${theme.muted}`}>Rows per page:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1) }}
          className={`px-2 py-1 border rounded text-sm ${theme.input}`}
        >
          {[5, 10, 20, 50].map(size => <option key={size} value={size}>{size}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-4">
        <span className={`text-sm ${theme.muted}`}>
          {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`p-1 rounded transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : theme.hover}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`p-1 rounded transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : theme.hover}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div>
          <RefreshCw className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-400'} mx-auto mb-2 animate-spin`} />
        </div>
      </div>
    )
  }

  if (!discounts.length) {
    return (
      <div className={`min-h-screen ${theme.bg}`}>
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-16">
            <Percent className={`w-16 h-16 mx-auto mb-4 ${theme.muted}`} />
            <h3 className={`text-xl font-semibold mb-2 ${theme.text}`}>No discounts found</h3>
            <p className={`${theme.muted}`}>Start by adding your first discount</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <div className="max-w-full mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-2xl font-semibold ${theme.text}`}>Discounts</h2>
            <p className={`${theme.muted}`}>Manage discount rules and offers</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#c79e73' }}
          >
            <Plus className="w-5 h-5" />
            Add Discount
          </button>
        </div>

        <div className={`border rounded-lg overflow-hidden shadow-sm ${theme.card} ${theme.border}`}>
          <table className="w-full">
            <thead className={theme.tableHeader}>
              <tr>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>Sr. No.</th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>
                  <button onClick={() => handleSort('name')} className="flex items-center gap-1 transition-colors">
                    Name <SortIcon column="name" />
                  </button>
                </th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>Type</th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>Value</th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>Ticket Size</th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>Applied To</th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>Status</th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {paginatedData.map((discount, index) => (
                <tr key={discount.id} className={`${theme.tableRow} transition-colors`}>
                  <td className={`px-4 py-3 font-medium ${theme.text}`}>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className={`px-4 py-3 font-medium ${theme.text}`}>{discount.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      discount.type === 'amount' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {discount.type === 'amount' ? <DollarSign size={12} /> : <Percent size={12} />}
                      {discount.type}
                    </span>
                  </td>
                  <td className={`px-4 py-3 ${theme.text}`}>
                    {discount.type === 'amount' ? `₹${discount.value}` : `${discount.value}%`}
                  </td>
                  <td className={`px-4 py-3 text-sm ${theme.muted}`}>
                    {discount.minTicketSize ? `₹${discount.minTicketSize}` : 'No min'}
                    {' - '}
                    {discount.maxTicketSize ? `₹${discount.maxTicketSize}` : 'No max'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs w-fit ${
                        discount.assignedTo === 'category' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {discount.assignedTo === 'category' ? <Tag size={12} /> : <Package size={12} />}
                        {discount.assignedTo}
                      </span>
                      <span className="text-xs text-gray-500">
                        {discount.assignedItems.slice(0, 2).join(', ')}
                        {discount.assignedItems.length > 2 && `... +${discount.assignedItems.length - 2} more`}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                      discount.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {discount.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <ActionButton onClick={() => openModal(discount)} color="#c79e73" icon={Edit} title="Edit" />
                    <ActionButton onClick={() => deleteItem(discount.id)} color="#ef4444" icon={Trash2} title="Delete" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination />
        </div>

        <Modal
          isOpen={modal === 'editDiscount'}
          onClose={() => setModal('')}
          title={editData?.id ? 'Edit Discount' : 'Add Discount'}
          theme={theme}
        >
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme.text}`}>
                  Discount Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editData?.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className={`w-full p-3 border rounded-lg text-sm ${theme.input}`}
                  placeholder="Enter discount name"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme.text}`}>Discount Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value="amount"
                      checked={editData?.type === 'amount'}
                      onChange={(e) => handleFieldChange('type', e.target.value)}
                      className="text-blue-600"
                    />
                    <DollarSign size={16} />
                    Amount
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value="percentage"
                      checked={editData?.type === 'percentage'}
                      onChange={(e) => handleFieldChange('type', e.target.value)}
                      className="text-blue-600"
                    />
                    <Percent size={16} />
                    Percentage
                  </label>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme.text}`}>
                  Value {editData?.type === 'amount' ? '(Rs)' : '(%)'}
                </label>
                <input
                  type="number"
                  value={editData?.value || ''}
                  onChange={(e) => handleFieldChange('value', e.target.value)}
                  className={`w-full p-3 border rounded-lg text-sm ${theme.input}`}
                  placeholder="Enter value"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme.text}`}>Min Ticket Size</label>
                <input
                  type="number"
                  value={editData?.minTicketSize || ''}
                  onChange={(e) => handleFieldChange('minTicketSize', e.target.value)}
                  className={`w-full p-3 border rounded-lg text-sm ${theme.input}`}
                  placeholder="Minimum amount"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme.text}`}>Max Ticket Size</label>
                <input
                  type="number"
                  value={editData?.maxTicketSize || ''}
                  onChange={(e) => handleFieldChange('maxTicketSize', e.target.value)}
                  className={`w-full p-3 border rounded-lg text-sm ${theme.input}`}
                  placeholder="Maximum amount"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme.text}`}>Assign To</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="assignedTo"
                      value="category"
                      checked={editData?.assignedTo === 'category'}
                      onChange={(e) => handleFieldChange('assignedTo', e.target.value)}
                      className="text-blue-600"
                    />
                    <Tag size={16} />
                    Category
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="assignedTo"
                      value="product"
                      checked={editData?.assignedTo === 'product'}
                      onChange={(e) => handleFieldChange('assignedTo', e.target.value)}
                      className="text-blue-600"
                    />
                    <Package size={16} />
                    Product
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme.text}`}>
                Select {editData?.assignedTo === 'category' ? 'Categories' : 'Products'}
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-3 border rounded-lg">
                {(editData?.assignedTo === 'category' ? categories : products).map(item => (
                  <label key={item} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editData?.assignedItems?.includes(item) || false}
                      onChange={(e) => handleArrayChange('assignedItems', item, e.target.checked)}
                      className="text-blue-600"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={editData?.timeRestricted || false}
                  onChange={(e) => handleFieldChange('timeRestricted', e.target.checked)}
                  className="text-blue-600"
                />
                <Calendar size={16} />
                Time Restricted
              </label>
            </div>

            {editData?.timeRestricted && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="timeType"
                      checked={!editData?.recurring}
                      onChange={() => handleFieldChange('recurring', false)}
                      className="text-blue-600"
                    />
                    Date Range
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="timeType"
                      checked={editData?.recurring}
                      onChange={() => handleFieldChange('recurring', true)}
                      className="text-blue-600"
                    />
                    Recurring Monthly
                  </label>
                </div>

                {!editData?.recurring ? (
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={editData?.startDate || ''}
                      onChange={(e) => handleFieldChange('startDate', e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="date"
                      value={editData?.endDate || ''}
                      onChange={(e) => handleFieldChange('endDate', e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {[25, 30].map(day => (
                      <label key={day} className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={editData?.recurringDays?.includes(day) || false}
                          onChange={(e) => handleArrayChange('recurringDays', day, e.target.checked)}
                          className="text-blue-600"
                        />
                        {day}th
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={`p-4 border-t flex justify-end gap-3 ${theme.border}`}>
            <button
              onClick={() => setModal('')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${theme.btn}`}
            >
              Cancel
            </button>
            <button
              onClick={saveItem}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium disabled:opacity-50 text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#c79e73' }}
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  )
}