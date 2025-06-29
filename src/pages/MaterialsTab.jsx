// MaterialsTab.jsx
import React, { useState, useCallback, useMemo } from 'react'
import { Plus, Package, Edit, Save, Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import Modal from './Modal'
import ActionButton from './ActionButton'
import adminService from '../Firebase/services/adminApiService'
import useTheme from '../hooks/useTheme'

export default function MaterialsTab({ data, loading, apiCall }) {
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

  const handleFieldChange = useCallback((field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }, [])

  const saveItem = useCallback(() => {
    if (!editData?.name?.trim()) return alert('Material name is required')
    
    const operation = editData.id
      ? () => adminService.updateMaterial(editData.id, editData.name)
      : () => adminService.addMaterial(editData.name)

    apiCall(operation, () => {
      setModal('')
      setEditData(null)
    })
  }, [editData, apiCall])

  const openModal = useCallback((item = null) => {
    setEditData(item ? { ...item } : { name: '' })
    setModal('editMaterial')
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
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-16">
            <Package className={`w-16 h-16 mx-auto mb-4 ${theme.muted}`} />
            <h3 className={`text-xl font-semibold mb-2 ${theme.text}`}>No materials found</h3>
            <p className={`${theme.muted}`}>Start by adding your first material</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-2xl font-semibold ${theme.text}`}>Materials</h2>
            <p className={`${theme.muted}`}>Manage Materials</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#c79e73' }}
          >
            <Plus className="w-5 h-5" />
            Add Material
          </button>
        </div>

        <div className={`border rounded-lg overflow-hidden shadow-sm ${theme.card} ${theme.border}`}>
          <table className="w-full">
            <thead className={theme.tableHeader}>
              <tr>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                  >
                    Material Name
                    <SortIcon column="name" />
                  </button>
                </th>
                {/* <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>
                  Actions
                </th> */}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {paginatedData.map((material) => (
                <tr key={material.id} className={`${theme.tableRow} transition-colors`}>
                  <td className={`px-4 py-3 font-medium ${theme.text}`}>{material.name}</td>
                  {/* <td className="px-4 py-3 flex gap-2">
                    <ActionButton
                      onClick={() => openModal(material)}
                      color="#c79e73"
                      icon={Edit}
                      title="Edit"
                    />
                    <ActionButton
                      onClick={() => apiCall(() => adminService.deleteMaterial(material.id))}
                      color="#ef4444"
                      icon={Trash2}
                      title="Delete"
                    />
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination />
        </div>

        <Modal
          isOpen={modal === 'editMaterial'}
          onClose={() => setModal('')}
          title={editData?.id ? 'Edit Material' : 'Add Material'}
          theme={theme}
        >
          <div className="p-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme.text}`}>
                Material Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editData?.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme.input}`}
                placeholder="Enter material name"
              />
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