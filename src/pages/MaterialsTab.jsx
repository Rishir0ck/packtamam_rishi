// MaterialsTab.jsx
import React, { useState, useCallback } from 'react'
import { Plus, Package, Edit, Save, Trash2 } from 'lucide-react'
import Modal from './Modal'
import ActionButton from './ActionButton'
import adminService from '../Firebase/services/adminApiService'

export default function MaterialsTab({ data, loading, apiCall, theme }) {
  const [modal, setModal] = useState('')
  const [editData, setEditData] = useState(null)

  const handleFieldChange = useCallback((field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }, [])

  const saveItem = useCallback(() => {
    if (!editData) return
    const operation = editData.id
      ? () => adminService.updateMaterial(editData.id, { name: editData.name })
      : () => adminService.addMaterial(editData.name)

    apiCall(operation, () => {
      setModal('')
      setEditData(null)
    })
  }, [editData, apiCall])

  const materialFields = [
    { key: 'name', label: 'Material Name', required: true }
  ]

  if (!data.length) {
    return (
      <div className="text-center py-16">
        <Package className={`w-16 h-16 mx-auto mb-4 ${theme.muted}`} />
        <h3 className={`text-xl font-semibold mb-2 ${theme.text}`}>No materials found</h3>
        <p className={`${theme.muted}`}>Start by adding your first material</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <ActionButton
          onClick={() => {
            setEditData({ name: '' })
            setModal('add-material')
          }}
          className={`${theme.button.primary} gap-2`}
        >
          <Plus className="w-4 h-4" />
          Add Material
        </ActionButton>
      </div>

      <div className={`border rounded-lg ${theme.border}`}>
        <div className="grid grid-cols-12 gap-4 p-4 border-b font-medium">
          <div className="col-span-8">Material Name</div>
          <div className="col-span-4">Actions</div>
        </div>
        {data.map(material => (
          <div key={material.id} className="grid grid-cols-12 gap-4 p-4 border-b">
            <div className={`col-span-8 ${theme.text}`}>{material.name}</div>
            <div className="col-span-4 flex gap-2">
              <ActionButton
                onClick={() => {
                  setEditData(material)
                  setModal('edit-material')
                }}
                className={`${theme.button.secondary} gap-2`}
              >
                <Edit className="w-4 h-4" />
                Edit
              </ActionButton>
              <ActionButton
                onClick={() => apiCall(() => adminService.deleteMaterial(material.id))}
                className={`${theme.button.danger} gap-2`}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </ActionButton>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modal === 'add-material'}
        onClose={() => setModal('')}
        title="Add New Material"
      >
        <div className="space-y-4">
          {materialFields.map(field => (
            <div key={field.key}>
              <label className={`block text-sm font-medium ${theme.text} mb-2`}>
                {field.label}
              </label>
              <input
                value={editData?.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className={`w-full p-2 rounded border ${theme.border} ${theme.input}`}
              />
            </div>
          ))}
          <ActionButton
            onClick={saveItem}
            className={`${theme.button.primary} gap-2 mt-4`}
            disabled={!editData?.name}
          >
            <Save className="w-4 h-4" />
            Create Material
          </ActionButton>
        </div>
      </Modal>

      <Modal
        isOpen={modal === 'edit-material'}
        onClose={() => setModal('')}
        title="Edit Material"
      >
        <div className="space-y-4">
          {materialFields.map(field => (
            <div key={field.key}>
              <label className={`block text-sm font-medium ${theme.text} mb-2`}>
                {field.label}
              </label>
              <input
                value={editData?.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className={`w-full p-2 rounded border ${theme.border} ${theme.input}`}
              />
            </div>
          ))}
          <ActionButton
            onClick={saveItem}
            className={`${theme.button.primary} gap-2 mt-4`}
            disabled={!editData?.name}
          >
            <Save className="w-4 h-4" />
            Save Changes
          </ActionButton>
        </div>
      </Modal>
    </>
  )
}