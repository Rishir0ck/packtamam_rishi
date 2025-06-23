// CategoriesTab.jsx
import React, { useState, useCallback } from 'react'
import { Plus, Package, Edit, Upload, X, Save } from 'lucide-react'
import Modal from './Modal'
import ActionButton from './ActionButton'
import adminService from '../Firebase/services/adminApiService'

export default function CategoriesTab({ data, loading, apiCall, theme }) {
  const [modal, setModal] = useState('')
  const [editData, setEditData] = useState(null)

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

  const categoryFields = [
    { key: 'name', label: 'Category Name', required: true },
    { key: 'is_active', label: 'Active Status', type: 'checkbox' }
  ]

  if (!data.length) {
    return (
      <div className="text-center py-16">
        <Package className={`w-16 h-16 mx-auto mb-4 ${theme.muted}`} />
        <h3 className={`text-xl font-semibold mb-2 ${theme.text}`}>No categories found</h3>
        <p className={`${theme.muted}`}>Start by adding your first category</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-2xl font-semibold ${theme.text}`}>Categories</h2>
          <p className={`${theme.muted}`}>Manage Categories</p>
        </div>
        <button
          onClick={() => {
            setEditData({ name: '', is_active: true, images: [] })
            setModal('editCategory')
          }}
          className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium"
          style={{ backgroundColor: '#c79e73' }}
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      <div className={`border rounded-lg overflow-hidden ${theme.card}`}>
        <table className="w-full">
          <thead className={`${theme.isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <tr>
              {['Image', 'Name', 'Status', 'Actions'].map(header => (
                <th key={header} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id} className={`${theme.tableRow || 'hover:bg-gray-50'}`}>
                <td className={`px-4 py-3 text-sm ${theme.text}`}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-10 h-18 object-cover rounded" />
                  ) : '-'}
                </td>
                <td className={`px-4 py-3 font-medium ${theme.text}`}>{item.name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded ${
                    item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ActionButton
                    onClick={() => {
                      setEditData({ ...item, images: [] })
                      setModal('editCategory')
                    }}
                    color="#c79e73" icon={Edit} title="Edit"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
            <div className={`border-2 border-dashed rounded p-4 text-center ${theme.border}`}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden"
                id="img"
              />
              <label htmlFor="img" className="cursor-pointer">
                <Upload className={`w-6 h-6 mx-auto mb-1 ${theme.muted}`} />
                <p className={`text-xs ${theme.muted}`}>Upload Images</p>
              </label>
            </div>

            {(editData?.images?.length > 0 || editData?.image_url) && (
              <div className="mt-2 grid grid-cols-6 gap-2">
                {(editData.images?.length > 0 ? editData.images : [{ url: editData.image_url, id: 'existing' }]).map((img, index) => (
                  <div key={img.id || index} className="relative group">
                    <img
                      src={img.image_url || img.url}
                      alt=""
                      className="w-30 h-24 object-cover rounded"
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
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-3">
            {categoryFields.map(field => (
              <div key={field.key}>
                <label className={`block text-sm mb-1 ${theme.muted}`}>
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'checkbox' ? (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editData?.[field.key] ?? true}
                      onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                    />
                    <span className={`text-sm ${theme.text}`}>Active</span>
                  </label>
                ) : (
                  <input
                    type="text"
                    value={editData?.[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className={`w-full p-2 border rounded text-sm ${theme.input || 'border-gray-200 bg-white'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={`p-4 border-t flex gap-3 ${theme.border}`}>
          <button
            onClick={saveItem}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-white rounded font-medium disabled:opacity-50 text-sm"
            style={{ backgroundColor: '#c79e73' }}
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => setModal('')}
            className={`px-4 py-2 rounded font-medium text-sm ${theme.btn || 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Cancel
          </button>
        </div>
      </Modal>
    </>
  )
}