// SubCategoriesTab.jsx
import React, { useState, useCallback, useMemo } from 'react'
import { Plus, Package, Edit, Upload, X, Save, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import Modal from './Modal'
import ActionButton from './ActionButton'
import adminService from '../Firebase/services/adminApiService'

export default function SubCategoriesTab({ data, loading, apiCall, theme }) {
  const [modal, setModal] = useState('')
  const [editData, setEditData] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
    setCurrentPage(1)
  }, [])

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortConfig])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return sortedData.slice(start, start + itemsPerPage)
  }, [sortedData, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

  const handleFieldChange = useCallback((field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }, [])

  const saveItem = useCallback(() => {
    if (!editData?.name?.trim()) return alert('Sub Category name is required')
    
    const operation = editData.id
      ? () => adminService.updateSubCategory(editData.id, editData.is_active)
      : () => adminService.addSubCategory({
          subcategory_id: editData.subcategory_id,
          is_active: editData.is_active ?? true,
          product_id: editData.product_id
        })

    apiCall(operation, () => {
      setModal('')
      setEditData(null)
    })
  }, [editData, apiCall])

  const openModal = useCallback((item = null) => {
    setEditData(item ? { ...item, images: [] } : { name: '', is_active: true, images: [] })
    setModal('editSubCategory')
  }, [])

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronUp className="w-4 h-4 opacity-30" />
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-500" />
      : <ChevronDown className="w-4 h-4 text-blue-500" />
  }

  const Pagination = () => (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <div className="flex items-center gap-2">
        <span className={`text-sm ${theme.muted}`}>Rows per page:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value))
            setCurrentPage(1)
          }}
          className={`px-2 py-1 border rounded text-sm ${theme.input || 'border-gray-200'}`}
        >
          {[5, 10, 20, 50].map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
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
            className={`p-1 rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`p-1 rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  if (!data.length) {
    return (
      <div className="text-center py-16">
        <Package className={`w-16 h-16 mx-auto mb-4 ${theme.muted}`} />
        <h3 className={`text-xl font-semibold mb-2 ${theme.text}`}>No sub categories found</h3>
        <p className={`${theme.muted}`}>Start by adding your first sub category</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-2xl font-semibold ${theme.text}`}>Sub Categories</h2>
          <p className={`${theme.muted}`}>Manage Sub Categories</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#c79e73' }}
        >
          <Plus className="w-5 h-5" />
          Add Sub Category
        </button>
      </div>

      <div className={`border rounded-lg overflow-hidden ${theme.card}`}>
        <table className="w-full">
          <thead className={`${theme.isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <tr>
              {[
                { key: 'name', label: 'Name' },
                { key: 'is_active', label: 'Status' }
              ].map(({ key, label }) => (
                <th key={key} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>
                  <button
                    onClick={() => handleSort(key)}
                    className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                  >
                    {label}
                    <SortIcon column={key} />
                  </button>
                </th>
              ))}
              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.map((item) => (
              <tr key={item.id} className={`${theme.tableRow || 'hover:bg-gray-50'} transition-colors`}>
                <td className={`px-4 py-3 font-medium ${theme.text}`}>{item.name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    item.is_active 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ActionButton
                    onClick={() => openModal(item)}
                    color="#c79e73"
                    icon={Edit}
                    title="Edit"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination />
      </div>

      <Modal
        isOpen={modal === 'editSubCategory'}
        onClose={() => setModal('')}
        title={editData?.id ? 'Edit Sub Category' : 'Add Sub Category'}
        theme={theme}
      >
        <div className="p-4 max-h-96 overflow-y-auto">
          

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme.muted}`}>
                Sub Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editData?.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme.input || 'border-gray-200'}`}
                placeholder="Enter sub category name"
              />
            </div>
            
            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={editData?.is_active ?? true}
                  onChange={(e) => handleFieldChange('is_active', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className={`text-sm font-medium ${theme.text}`}>Active Status</span>
              </label>
            </div>
          </div>
        </div>

        <div className={`p-4 border-t flex justify-end gap-3 ${theme.border}`}>
          <button
            onClick={() => setModal('')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${theme.btn || 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Cancel
          </button>
          <button
            onClick={saveItem}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium disabled:opacity-50 text-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#c79e73' }}
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </Modal>
    </>
  )
}