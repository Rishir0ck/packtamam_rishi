import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Edit, Save, Trash2, ChevronLeft, ChevronRight, IndianRupee, Percent, Calendar, X, RefreshCw, Gift, Copy } from 'lucide-react'
import adminApiService from '../Firebase/services/adminApiService'
import useTheme from '../hooks/useTheme'

const Modal = ({ isOpen, onClose, title, children, theme }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className={`rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto ${theme.card}`}>
        <div className={`flex justify-between items-center p-4 border-b ${theme.border}`}>
          <h3 className={`text-lg font-semibold ${theme.text}`}>{title}</h3>
          <button onClick={onClose} className={`p-1 rounded ${theme.hover}`}>
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

const ActionButton = ({ onClick, color, icon: Icon, title, disabled }) => (
  <button
    onClick={onClick}
    title={title}
    disabled={disabled}
    className="p-2 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
    style={{ backgroundColor: color }}
  >
    <Icon className="w-4 h-4 text-white" />
  </button>
)

export default function PDiscount() {
  const [discounts, setDiscounts] = useState([])
  const [modal, setModal] = useState('')
  const [editData, setEditData] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedDiscount, setSelectedDiscount] = useState(null)
  const [generatingCoupon, setGeneratingCoupon] = useState(false)
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
    isDark: true
  } : {
    bg: 'bg-gray-50',
    card: 'bg-white',
    text: 'text-gray-900',
    muted: 'text-gray-600',
    border: 'border-gray-200',
    input: 'bg-white border-gray-300 placeholder-gray-500',
    hover: 'hover:bg-gray-50',
    tableHeader: 'bg-gray-50',
    tableRow: 'hover:bg-gray-50',
    btn: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    isDark: false
  }

  const initialFormData = {
    timeRestricted: false, startDate: '', endDate: '',
    slabs: [{ min: '', max: '', value: '', type: 'fixed' }]
  }

  const showAlert = (message, type = 'info') => {
    // You can replace this with a proper toast notification
    alert(message)
  }

  const loadDiscounts = async () => {
    try {
      setLoading(true)
      const response = await adminApiService.getDiscounts()
      if (response.success) {
        let discountsData = response.data
        
        if (discountsData.data) {
          discountsData = discountsData.data
        }
        // Normalize to array if it's a single object
        if (!Array.isArray(discountsData)) {
          discountsData = discountsData ? [discountsData] : []
        }

        // Transform API data to match component expectations
        const transformedData = discountsData.map(item => {
          console.log('Processing item:', item)
          return {
          id: item.id,
          timeRestricted: !!(item.start_date && item.end_date),
          startDate: item.start_date ? new Date(item.start_date).toISOString().split('T')[0] : '',
          endDate: item.end_date ? new Date(item.end_date).toISOString().split('T')[0] : '',
          slabs: [{
            min: item.min_amount || 0,
            max: item.max_amount || null,
            value: item.value,
            type: item.discount_type === 'percentage' ? 'percentage' : 'fixed'
          }],
          minTicketSize: item.min_amount || 0,
          maxTicketSize: item.max_amount || null,
          coupons: item.coupons?.map(coupon => ({
            id: coupon.id,
            code: coupon.coupon,
            isActive: coupon.is_active
          })) || []
        }
        })

        setDiscounts(transformedData)
        console.log('Transformed data:', transformedData)
        console.log('Setting discounts to:', transformedData)
      } else {
        setDiscounts([])
        showAlert('Failed to load discounts', 'error')
      }
    } catch (error) {
      console.error('Error loading discounts:', error)
      setDiscounts([])
      showAlert('Failed to load discounts', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDiscounts()
  }, [])

  const paginatedData = useMemo(() => {
    // Add safety check to ensure discounts is an array
    if (!Array.isArray(discounts)) {
      console.warn('discounts is not an array:', discounts)
      return []
    }
    
    const start = (currentPage - 1) * itemsPerPage
    return discounts.slice(start, start + itemsPerPage)
  }, [discounts, currentPage, itemsPerPage])

  // Add safety check for totalPages calculation
  const totalPages = Math.ceil((Array.isArray(discounts) ? discounts.length : 0) / itemsPerPage)

  const handleFieldChange = useCallback((field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSlabChange = useCallback((index, field, value) => {
    setEditData(prev => ({
      ...prev,
      slabs: prev.slabs.map((slab, i) => i === index ? { ...slab, [field]: value } : slab)
    }))
  }, [])

  const addSlab = () => {
    setEditData(prev => ({
      ...prev,
      slabs: [...prev.slabs, { min: '', max: '', value: '', type: 'fixed' }]
    }))
  }

  const removeSlab = (index) => {
    setEditData(prev => ({
      ...prev,
      slabs: prev.slabs.filter((_, i) => i !== index)
    }))
  }

  const saveDiscount = async () => {
    if (!editData?.slabs?.length || !editData.slabs.some(s => s.value)) {
      return showAlert('At least one slab with value is required', 'error')
    }
    
    try {
      setSaving(true)
      const discountData = {
        ...editData,
        id: editData.id,
        slabs: editData.slabs.map(slab => ({
          min: slab.min ? parseFloat(slab.min) : null,
          max: slab.max ? parseFloat(slab.max) : null,
          value: parseFloat(slab.value),
          type: slab.type
        })).filter(slab => slab.value),
        minTicketSize: editData.slabs[0]?.min ? parseFloat(editData.slabs[0].min) : null,
        maxTicketSize: editData.slabs[0]?.max ? parseFloat(editData.slabs[0].max) : null,
        is_active: editData.isActive
      }

      const response = editData.id 
        ? await adminApiService.updateDiscountTicket(discountData)
        : await adminApiService.addDiscountTicket(discountData)
      
      if (response.success) {
        await loadDiscounts()
        setModal('')
        setEditData(null)
        showAlert(`Discount ${editData.id ? 'updated' : 'added'} successfully`, 'success')
      } else {
        showAlert(response.message || 'Failed to save discount', 'error')
      }
    } catch (error) {
      console.error('Error saving discount:', error)
      showAlert('Failed to save discount', 'error')
    } finally {
      setSaving(false)
    }
  }

  const deleteDiscount = async (id) => {
    if (window.confirm('Are you sure you want to delete this discount?')) {
      try {
        setDiscounts(prev => Array.isArray(prev) ? prev.filter(d => d.id !== id) : [])
        showAlert('Discount deleted successfully', 'success')
      } catch (error) {
        console.error('Error deleting discount:', error)
        showAlert('Failed to delete discount', 'error')
      }
    }
  }

  const generateCoupon = async (discountId) => {
    setGeneratingCoupon(true);
    try {
      const newCoupon = await adminApiService.addTicketCoupon(discountId);
      setSelectedDiscount((prev,updatedDiscount) => ({
        ...prev, ...updatedDiscount,
        coupons: [...(prev?.coupons || []), newCoupon],
      }));
      await loadDiscounts()
    } catch (error) {
      console.error('Failed to generate coupon:', error);
    } finally {
      setGeneratingCoupon(false);
    }
  };

  const deleteCoupon = async (couponId) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        const response = await adminApiService.deleteTicketCoupon(couponId)
        if (response.success) {
          await loadDiscounts()
          showAlert('Coupon deleted successfully', 'success')
        } else {
          showAlert(response.message || 'Failed to delete coupon', 'error')
        }
      } catch (error) {
        console.error('Error deleting coupon:', error)
        showAlert('Failed to delete coupon', 'error')
      }
    }
  }

  const toggleCouponStatus = async (coupon) => {
    try {
      const response = await adminApiService.updateTicketCouponStatus({
        ...coupon,
        isActive: !coupon.isActive
      })
      if (response.success) {
        await loadDiscounts()
        showAlert('Coupon status updated successfully', 'success')
      } else {
        showAlert(response.message || 'Failed to update coupon status', 'error')
      }
    } catch (error) {
      console.error('Error updating coupon status:', error)
      showAlert('Failed to update coupon status', 'error')
    }
  }

  const openModal = (item = null) => {
    setEditData(item ? {
      ...item,
      slabs: item.slabs?.length ? item.slabs.map(slab => ({
        min: slab.min?.toString() || '',
        max: slab.max?.toString() || '',
        value: slab.value.toString(),
        type: slab.type || 'fixed'
      })) : [{ min: '', max: '', value: '', type: 'fixed' }]
    } : initialFormData)
    setModal('editDiscount')
  }

  const openCouponModal = (discount) => {
    setSelectedDiscount(discount)
    setModal('manageCoupons')
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    showAlert('Coupon code copied!', 'success')
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
          {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, Array.isArray(discounts) ? discounts.length : 0)} of {Array.isArray(discounts) ? discounts.length : 0}
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
      <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
        <RefreshCw className={`w-8 h-8 animate-spin ${theme.muted}`} />
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
            className="flex items-center gap-2 px-6 py-3 bg-[#c79e73] text-white rounded-lg font-medium transition-colors hover:opacity-90"
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
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>Slabs</th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>Time Period</th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>Coupons</th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {paginatedData.map((discount, index) => (
                <tr key={discount.id} className={`${theme.tableRow} transition-colors`}>
                  <td className={`px-4 py-3 font-medium ${theme.text}`}>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className={`px-4 py-3 text-sm ${theme.muted}`}>
                    {discount.slabs?.length ? (
                      <div className="space-y-1">
                        {discount.slabs.map((slab, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              slab.type === 'fixed' 
                                ? isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                                : isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {slab.type === 'fixed' ? <IndianRupee size={10} /> : <Percent size={10} />}
                              {slab.type}
                            </span>
                            <span className={theme.text}>
                              {slab.min ? `₹${slab.min}` : '₹0'} - {slab.max ? `₹${slab.max}` : '∞'}: 
                              {slab.type === 'fixed' ? ` ₹${slab.value}` : ` ${slab.value}%`}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs">No slabs defined</div>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-sm ${theme.muted}`}>
                    {discount.timeRestricted 
                      ? `${discount.startDate} to ${discount.endDate}`
                      : 'No restriction'
                    }
                  </td>
                  <td className={`px-4 py-3 text-sm ${theme.muted}`}>
                    {discount.coupons?.length || 0} coupon(s)
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <ActionButton onClick={() => openModal(discount)} color="#c79e73" icon={Edit} title="Edit" />
                    <ActionButton onClick={() => openCouponModal(discount)} color="#3b82f6" icon={Gift} title="Manage Coupons" />
                    <ActionButton onClick={() => deleteDiscount(discount.id)} color="#ef4444" icon={Trash2} title="Delete" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <Pagination />
        </div>

        {/* Edit Discount Modal */}
        <Modal
          isOpen={modal === 'editDiscount'}
          onClose={() => setModal('')}
          title={editData?.id ? 'Edit Discount' : 'Add Discount'}
          theme={theme}
        >
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`flex items-center gap-2 text-sm font-medium ${theme.text}`}>
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
              <div className={`space-y-2 p-3 rounded-lg`}>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={editData?.startDate || ''}
                    onChange={(e) => handleFieldChange('startDate', e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-lg text-sm ${theme.input}`}
                  />
                  <input
                    type="date"
                    value={editData?.endDate || ''}
                    onChange={(e) => handleFieldChange('endDate', e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-lg text-sm ${theme.input}`}
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className={`text-sm font-medium ${theme.text}`}>Discount Slabs</label>
                {!editData?.id && (
                <button
                  onClick={addSlab}
                  className="flex items-center gap-1 px-4 py-2 text-sm bg-[#c79e73] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-3 h-3" />
                  Add Slab
                </button>
                )}
              </div>

              <div className="space-y-2">
                {editData?.slabs?.map((slab, index) => (
                  <div key={index} className={`flex flex-wrap gap-2 items-center p-3 border rounded-lg ${theme.border} ${theme.card}`}>
                    <div className="flex gap-2">
                      <label className={`flex items-center gap-1 ${theme.text}`}>
                        <input
                          type="radio"
                          name={`type-${index}`}
                          value="fixed"
                          checked={slab.type === 'fixed'}
                          onChange={(e) => handleSlabChange(index, 'type', e.target.value)}
                        />
                        <IndianRupee size={14} />
                        Flat
                      </label>
                      <label className={`flex items-center gap-1 ${theme.text}`}>
                        <input
                          type="radio"
                          name={`type-${index}`}
                          value="percentage"
                          checked={slab.type === 'percentage'}
                          onChange={(e) => handleSlabChange(index, 'type', e.target.value)}
                        />
                        <Percent size={14} />
                        Percentage
                      </label>
                    </div>
                    <input
                      type="number"
                      value={slab.min}
                      onChange={(e) => handleSlabChange(index, 'min', e.target.value)}
                      className={`w-24 px-2 py-1 border rounded text-sm ${theme.input}`}
                      placeholder="Min"
                    />
                    <span className={`text-sm ${theme.muted}`}>to</span>
                    <input
                      type="number"
                      value={slab.max}
                      onChange={(e) => handleSlabChange(index, 'max', e.target.value)}
                      className={`w-24 px-2 py-1 border rounded text-sm ${theme.input}`}
                      placeholder="Max"
                    />
                    <span className={`text-sm ${theme.muted}`}>=</span>
                    <input
                      type="number"
                      value={slab.value}
                      onChange={(e) => handleSlabChange(index, 'value', e.target.value)}
                      className={`w-28 px-2 py-1 border rounded text-sm ${theme.input}`}
                      placeholder="Value"
                    />
                    <span className={`text-sm ${theme.muted}`}>
                      {slab.type === 'fixed' ? '₹' : '%'}
                    </span>
                    {editData?.slabs?.length > 1 && (
                      <button
                        onClick={() => removeSlab(index)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`p-4 border-t flex justify-end gap-3 ${theme.border}`}>
            <button
              onClick={() => setModal('')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${theme.btn}`}
            >
              Cancel
            </button>
            <button
              onClick={saveDiscount}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#c79e73] text-white rounded-lg font-medium disabled:opacity-50 text-sm hover:opacity-90 transition-opacity"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Modal>

        {/* Manage Coupons Modal */}
        <Modal
          isOpen={modal === 'manageCoupons'}
          onClose={() => setModal('')}
          title="Manage Coupons"
          theme={theme}
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className={`font-medium ${theme.text}`}>Coupons for Discount #{selectedDiscount?.id}</h4>
              <button
                onClick={() => generateCoupon(selectedDiscount?.id)}
                disabled={generatingCoupon}
                className="flex items-center gap-2 px-4 py-2 bg-[#c79e73] text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
              >
                <Gift className="w-4 h-4" />
                {generatingCoupon ? 'Generating...' : 'Generate New Coupon'}
              </button>
            </div>

            {selectedDiscount?.coupons?.length > 0 ? (
              <div className="space-y-2">
                {selectedDiscount.coupons.map((coupon) => (
                  <div key={coupon.id} className={`flex items-center justify-between p-3 border rounded-lg ${theme.border} ${theme.card}`}>
                    <div className="flex items-center gap-3">
                      <code className={`px-2 py-1 rounded text-sm font-mono ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                        {coupon.code}
                      </code>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                        coupon.isActive 
                          ? isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                          : isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(coupon.code)}
                        className={`p-2 text-blue-600 rounded ${isDark ? 'hover:bg-blue-900' : 'hover:bg-blue-50'}`}
                        title="Copy Code"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCoupon(coupon.id)}
                        className={`p-2 text-red-600 rounded ${isDark ? 'hover:bg-red-900' : 'hover:bg-red-50'}`}
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Gift className={`w-12 h-12 mx-auto mb-4 ${theme.muted}`} />
                <p className={`${theme.muted}`}>No coupons generated yet</p>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  )
}