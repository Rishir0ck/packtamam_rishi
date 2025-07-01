// CategoriesTab.jsx
import React, { useState, useCallback, useMemo } from 'react'
import { Plus, Package, Edit, Upload, X, Save, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import Modal from './Modal'
import ActionButton from './ActionButton'
import adminService from '../Firebase/services/adminApiService'
import useTheme from '../hooks/useTheme'

export default function CategoriesTab({ data, loading, apiCall }) {
  const [modal, setModal] = useState('')
  const [editData, setEditData] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
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

  const handleImageUpload = useCallback((files) => {
    const images = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      url: URL.createObjectURL(file),
      originFileObj: file
    }))
    setEditData(prev => ({ ...prev, images: [...(prev.images || []), ...images] }))
  }, [])

  const handleFieldChange = useCallback((field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }, [])

  const saveItem = useCallback(() => {
    if (!editData?.name?.trim()) return alert('Category name is required')
    
    const operation = editData.id
      ? () => adminService.updateCategory(editData.id, editData.name, editData.is_active)
      : () => adminService.addCategory({
          name: editData.name,
          is_active: editData.is_active ?? true,
          images: editData.images || []
        })

    apiCall(operation, () => {
      setModal('')
      setEditData(null)
    })
  }, [editData, apiCall])

  const openModal = useCallback((item = null) => {
    setEditData(item ? { ...item, images: [] } : { name: '', is_active: true, images: [] })
    setModal('editCategory')
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
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value))
            setCurrentPage(1)
          }}
          className={`px-2 py-1 border rounded text-sm ${theme.input}`}
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

  if (!data.length) {
    return (
      <div className={`min-h-screen ${theme.bg}`}>
        <div className="text-center py-16">
          <Package className={`w-16 h-16 mx-auto mb-4 ${theme.muted}`} />
          <h3 className={`text-xl font-semibold mb-2 ${theme.text}`}>No categories found</h3>
          <p className={`${theme.muted}`}>Start by adding your first category</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-2xl font-semibold ${theme.text}`}>Categories</h2>
            <p className={`${theme.muted}`}>Manage Categories</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#c79e73' }}
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>

        <div className={`border rounded-lg overflow-hidden shadow-sm ${theme.card} ${theme.border}`}>
          <table className="w-full">
            <thead className={theme.tableHeader}>
              <tr>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>Sr. No.</th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>Image</th>
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
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {paginatedData.map((item,index) => (
                <tr key={item.id} className={`${theme.tableRow} transition-colors`}>
                  <td className={`px-4 py-3 font-medium ${theme.text}`}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className={`px-4 py-3 text-sm ${theme.text}`}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-10 h-10 object-cover rounded" />
                    ) : (
                      <div className={`w-10 h-10 rounded flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <Package className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                      </div>
                    )}
                  </td>
                  <td className={`px-4 py-3 font-medium ${theme.text}`}>{item.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      item.is_active 
                        ? (isDark ? 'bg-green-900 text-green-200 border border-green-800' : 'bg-green-100 text-green-700 border border-green-200')
                        : (isDark ? 'bg-red-900 text-red-200 border border-red-800' : 'bg-red-100 text-red-700 border border-red-200')
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
          isOpen={modal === 'editCategory'}
          onClose={() => setModal('')}
          title={editData?.id ? 'Edit Category' : 'Add Category'}
          theme={theme}
        >
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${theme.text}`}>Images</label>
              <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors hover:border-blue-300 ${theme.border} ${isDark ? 'hover:border-blue-500' : 'hover:border-blue-300'}`}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                  id="img"
                />
                <label htmlFor="img" className="cursor-pointer">
                  <Upload className={`w-6 h-6 mx-auto mb-2 ${theme.muted}`} />
                  <p className={`text-sm ${theme.muted}`}>Click to upload images</p>
                </label>
              </div>

              {(editData?.images?.length > 0 || editData?.image_url) && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {(editData.images?.length > 0 ? editData.images : [{ url: editData.image_url, id: 'existing' }]).map((img, index) => (
                    <div key={img.id || index} className="relative group">
                      <img
                        src={img.image_url || img.url}
                        alt=""
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          if (img.id === 'existing') {
                            setEditData(p => ({ ...p, image_url: null }))
                          } else {
                            setEditData(p => ({
                              ...p,
                              images: p.images?.filter(i => i.id !== img.id) || []
                            }))
                          }
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme.muted}`}>
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editData?.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme.input}`}
                  placeholder="Enter category name"
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
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${theme.btn}`}
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
      </div>
    </div>
  )
}