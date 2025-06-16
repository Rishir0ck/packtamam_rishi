import React, { useState, useEffect, useContext } from 'react'
import { Eye, Edit, Search, Store, MapPin, Users, Plus, Save, X, Filter, Loader2, RefreshCw } from 'lucide-react'
import { ThemeContext } from '../context/ThemeContext'
import AdminService from '../Firebase/services/adminApiService'

export default function RestaurantManagement() {
  const { isDark } = useContext(ThemeContext)
  const [state, setState] = useState({
    restaurants: [],
    loading: true,
    error: '',
    selected: null,
    search: '',
    filter: 'all',
    modal: '',
    editData: null,
    saving: false,
    newFranchise: { name: '', address: '', manager: '', phone: '' }
  })

  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }))

  useEffect(() => { fetchRestaurants() }, [])

  const fetchRestaurants = async () => {
    try {
      updateState({ loading: true, error: '' })
      const result = await AdminService.getApprovedBusinessList(1, 100)
      
      if (result.success) {
        const restaurants = result.data.data?.map(r => ({
          id: r.id,
          name: r.business_name || r.name,
          owner: r.owner_name || r.owner,
          legal_entity_name: r.legal_entity_name || 'N/A',
          email: r.email,
          phone: r.mobile_number,
          address: [r.address, r.location, r.landmark, r.pincode].filter(Boolean).join(', ') || 'N/A',
          city: r.city,
          franchise_code: r.franchise_code,
          fssai_no: r.fssai_no || 'N/A',
          gst_no: r.gst_no || 'N/A',
          outlet_type: r.outlet_type || 'Not specified',
          joinedDate: r.created_at?.split('T')[0] || r.joinedDate,
          status: r.status === 'Approved' ? 'active' : 'inactive',
          profileImg: r.profile_picture || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          restaurantImg: r.restaurant_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
          franchises: r.franchises || []
        })) || []
        
        updateState({ restaurants })
      } else {
        updateState({ error: result.error || 'Failed to fetch restaurants' })
      }
    } catch (err) {
      updateState({ error: 'Failed to load restaurants' })
      console.error('Error:', err)
    } finally {
      updateState({ loading: false })
    }
  }

  const updateRestaurantStatus = async (id, status) => {
    try {
      updateState({ saving: true })
      const result = await AdminService.updateBusinessStatus(id, status)
      
      if (result.success) {
        updateState({ 
          restaurants: state.restaurants.map(r => r.id === id ? { ...r, status: status.toLowerCase() } : r)
        })
        return true
      } else {
        updateState({ error: result.error || 'Failed to update status' })
        return false
      }
    } catch (err) {
      updateState({ error: 'Failed to update restaurant status' })
      console.error('Error:', err)
      return false
    } finally {
      updateState({ saving: false })
    }
  }

  const filtered = state.restaurants.filter(r => {
    const matchSearch = [r.name, r.owner, r.outlet_type].some(field => 
      field.toLowerCase().includes(state.search.toLowerCase())
    )
    const matchFilter = state.filter === 'all' || 
      (state.filter === 'active' && r.status === 'active') ||
      (state.filter === 'inactive' && r.status === 'inactive') ||
      (state.filter === 'with-franchises' && r.franchises?.length > 0)
    return matchSearch && matchFilter
  })

  const handleSave = async () => {
    if (!state.editData) return
    
    try {
      updateState({ saving: true })
      const original = state.restaurants.find(r => r.id === state.editData.id)
      
      if (original?.status !== state.editData.status) {
        const success = await updateRestaurantStatus(state.editData.id, state.editData.status)
        if (!success) return
      }
      
      updateState({
        restaurants: state.restaurants.map(r => r.id === state.editData.id ? state.editData : r),
        modal: '',
        editData: null
      })
    } catch (err) {
      updateState({ error: 'Failed to save changes' })
      console.error('Error:', err)
    } finally {
      updateState({ saving: false })
    }
  }

  const addFranchise = () => {
    if (state.newFranchise.name && state.newFranchise.address) {
      const franchise = { ...state.newFranchise, id: Date.now(), status: 'active' }
      updateState({
        editData: { ...state.editData, franchises: [...(state.editData.franchises || []), franchise] },
        newFranchise: { name: '', address: '', manager: '', phone: '' }
      })
    }
  }

  const removeFranchise = (id) => {
    updateState({
      editData: { ...state.editData, franchises: state.editData.franchises.filter(f => f.id !== id) }
    })
  }

  const stats = [
    { label: 'Total', value: state.restaurants.length, icon: Store, color: '#c79e73', filter: 'all' },
    { label: 'Active', value: state.restaurants.filter(r => r.status === 'active').length, icon: Users, color: '#10b981', filter: 'active' },
    { label: 'Inactive', value: state.restaurants.filter(r => r.status === 'inactive').length, icon: MapPin, color: '#ef4444', filter: 'inactive' },
    { label: 'With Franchises', value: state.restaurants.filter(r => r.franchises?.length > 0).length, icon: Store, color: '#8b5cf6', filter: 'with-franchises' }
  ]

  const themeClass = (lightClass, darkClass = '') => isDark ? `${darkClass} dark` : lightClass
  const inputClass = `w-full p-2 border rounded text-sm ${themeClass('border-gray-200 bg-white text-gray-900', 'border-gray-600 bg-gray-700 text-white')}`
  const buttonClass = 'px-4 py-2 text-white rounded-lg transition-colors text-sm'

  if (state.loading) {
    return (
      <div className={`min-h-screen ${themeClass('bg-gray-50', 'bg-gray-900')} flex items-center justify-center`}>
        <div className="text-center">
          <Loader2 className={`w-8 h-8 animate-spin mx-auto mb-4 ${themeClass('text-gray-900', 'text-white')}`} />
          <p className={`text-lg font-medium ${themeClass('text-gray-900', 'text-white')}`}>Loading restaurants...</p>
        </div>
      </div>
    )
  }

  const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${themeClass('bg-white', 'bg-gray-800')}`}>
        <div className={`p-4 border-b flex items-center justify-between ${themeClass('border-gray-200', 'border-gray-700')}`}>
          <h2 className={`text-lg font-bold ${themeClass('text-gray-900', 'text-white')}`}>{title}</h2>
          <button onClick={onClose} className={`p-2 rounded-lg ${themeClass('hover:bg-gray-100', 'hover:bg-gray-700')}`}>
            <X className={`w-5 h-5 ${themeClass('text-gray-700', 'text-gray-300')}`} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen ${themeClass('bg-gray-50', 'bg-gray-900')} p-4 transition-colors`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${themeClass('text-gray-900', 'text-white')} mb-1`}>Restaurant Management</h1>
            <p className={`text-sm ${themeClass('text-gray-600', 'text-gray-400')}`}>Manage approved restaurants and their franchises</p>
          </div>
          <button 
            onClick={fetchRestaurants}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${themeClass('bg-white hover:bg-gray-50 text-gray-700 border border-gray-200', 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700')}`}
          >
            <RefreshCw className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        {state.error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
            {state.error}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" 
            placeholder="Search restaurants, owners, or outlet..." 
            value={state.search} 
            onChange={(e) => updateState({ search: e.target.value })}
            className={`w-full pl-9 pr-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${themeClass('border-gray-200 bg-white text-gray-900 placeholder-gray-500', 'border-gray-600 bg-gray-800 text-white placeholder-gray-400')}`}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select 
            value={state.filter} 
            onChange={(e) => updateState({ filter: e.target.value })} 
            className={`pl-9 pr-8 py-2.5 border rounded-lg focus:outline-none appearance-none transition-colors min-w-[180px] ${themeClass('border-gray-200 bg-white text-gray-900', 'border-gray-600 bg-gray-800 text-white')}`}
          >
            {[
              ['all', 'All Restaurants'],
              ['active', 'Active Only'],
              ['inactive', 'Inactive Only'],
              ['with-franchises', 'With Franchises']
            ].map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((stat, i) => {
          const IconComponent = stat.icon
          return (
            <div 
              key={i} 
              onClick={() => updateState({ filter: stat.filter })}
              className={`rounded-lg p-3 shadow-sm border cursor-pointer transition-all duration-200 hover:shadow-md ${themeClass('bg-white border-gray-200 hover:bg-gray-50', 'bg-gray-800 border-gray-700 hover:bg-gray-750')} ${state.filter === stat.filter ? 'ring-2' : ''}`}
              style={{ ringColor: state.filter === stat.filter ? '#c79e73' : 'transparent' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${themeClass('text-gray-600', 'text-gray-400')}`}>{stat.label}</p>
                  <p className={`text-xl font-bold ${themeClass('text-gray-900', 'text-white')}`}>{stat.value}</p>
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color }}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Restaurant List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Store className={`w-12 h-12 mx-auto mb-4 opacity-50 text-gray-400`} />
            <p className={`text-lg font-medium ${themeClass('text-gray-900', 'text-white')}`}>No restaurants found</p>
            <p className={`text-sm ${themeClass('text-gray-600', 'text-gray-400')}`}>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          filtered.map((r) => (
            <div key={r.id} className={`rounded-lg border shadow-sm p-4 transition-colors ${themeClass('bg-white border-gray-200', 'bg-gray-800 border-gray-700')}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={r.profileImg} alt={r.owner} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${themeClass('text-gray-900', 'text-white')}`}>{r.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        r.status === 'active' 
                          ? themeClass('bg-emerald-50 text-emerald-700', 'bg-emerald-900/30 text-emerald-300')
                          : themeClass('bg-gray-100 text-gray-600', 'bg-gray-700 text-gray-400')
                      }`}>
                        {r.status}
                      </span>
                      {r.franchises?.length > 0 && (
                        <span className={`px-2 py-1 rounded-full text-xs ${themeClass('bg-purple-50 text-purple-700', 'bg-purple-900/30 text-purple-300')}`}>
                          {r.franchises.length} franchise{r.franchises.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className={`text-sm flex items-center gap-4 mt-1 ${themeClass('text-gray-600', 'text-gray-400')}`}>
                      <span>👤 {r.owner}</span>
                      <span>🍽️ {r.outlet_type}</span>
                      <span>📍 {r.address?.split(',')[0] || 'No address'}</span>
                      <span>🏙️ {r.city?.split(',')[0] || 'No city'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateState({ selected: r, modal: 'view' })} 
                    className={`p-2 rounded-lg transition-colors ${themeClass('bg-gray-100 hover:bg-gray-200 text-gray-700', 'bg-gray-700 hover:bg-gray-600 text-gray-200')}`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => updateState({ editData: { ...r }, modal: 'edit' })} 
                    className="p-2 text-white rounded-lg transition-colors hover:opacity-80"
                    style={{ backgroundColor: '#c79e73' }}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Modal */}
      {state.modal === 'view' && state.selected && (
        <Modal title={state.selected.name} onClose={() => updateState({ modal: '' })}>
          <div className="space-y-4">
            <img src={state.selected.restaurantImg} alt={state.selected.name} className="w-full h-48 object-cover rounded-lg" />
            
            <div className={`grid grid-cols-2 gap-4 text-sm ${themeClass('text-gray-700', 'text-gray-300')}`}>
              <div className="space-y-2">
                <div>👤 {state.selected.owner}</div>
                <div>📧 {state.selected.email}</div>
                <div>📞 {state.selected.phone}</div>
                <div>🏢 {state.selected.legal_entity_name}</div>
                <div>🧾FSSAI No. : {state.selected.fssai_no}</div>
                <div className={themeClass('text-gray-700', 'text-gray-300')}>🏙️ {state.selected.city}</div>
              </div>
              <div className="space-y-2">
                <div>🍽️ {state.selected.outlet_type}</div>
                <div>🏷️ {state.selected.franchise_code}</div>
                <div>📅 {state.selected.joinedDate}</div>
                <div className={`px-2 py-1 rounded text-xs inline-block ${
                  state.selected.status === 'active' 
                  ? themeClass('bg-emerald-50 text-emerald-700', 'bg-emerald-900/30 text-emerald-300')
                  : themeClass('bg-gray-100 text-gray-600', 'bg-gray-700 text-gray-400')
                }`}>
                  Status: {state.selected.status}
                </div>
                <div>🧾GST No. : {state.selected.gst_no}</div>
            <div className={themeClass('text-gray-700', 'text-gray-300')}>📍 {state.selected.address}</div>
              </div>
            </div>
            
            {state.selected.franchises?.length > 0 && (
              <div>
                <h3 className={`font-semibold mb-2 ${themeClass('text-gray-900', 'text-white')}`}>
                  Franchises ({state.selected.franchises.length})
                </h3>
                <div className="space-y-2">
                  {state.selected.franchises.map((f) => (
                    <div key={f.id} className={`rounded-lg p-3 text-sm ${themeClass('bg-gray-50', 'bg-gray-700')}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={`font-medium ${themeClass('text-gray-900', 'text-white')}`}>{f.name}</div>
                          <div className={themeClass('text-gray-600', 'text-gray-300')}>{f.email}</div>
                          <div className={themeClass('text-gray-600', 'text-gray-300')}>Manager: {f.owner_name}</div>
                          <div className={themeClass('text-gray-600', 'text-gray-300')}>{f.mobile_number}</div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          f.status === 'active' 
                            ? themeClass('bg-emerald-50 text-emerald-700', 'bg-emerald-900/30 text-emerald-300')
                            : themeClass('bg-gray-200 text-gray-600', 'bg-gray-600 text-gray-400')
                        }`}>
                          {f.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {state.modal === 'edit' && state.editData && (
        <Modal title={`Edit ${state.editData.name}`} onClose={() => updateState({ modal: '' })}>
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              {[
                ['name', 'Restaurant Name'],
                ['owner', 'Owner'],
                ['email', 'Email'],
                ['mobile_number', 'Phone'],
                ['address', 'Address', 'col-span-2'],
                ['city', 'City'],
                ['outlet_type', 'Outlet Type'],
                ['leagal_entity_name', 'Leagal Entity Name'],
                ['status', 'Status', '', 'select']
              ].map(([field, label, className = '', type = 'input']) => (
                <div key={field} className={className}>
                  <label className={`block text-sm font-medium mb-1 ${themeClass('text-gray-700', 'text-gray-300')}`}>
                    {label}
                  </label>
                  {type === 'select' ? (
                    <select 
                      value={state.editData[field] || 'active'} 
                      onChange={(e) => updateState({ editData: { ...state.editData, [field]: e.target.value } })}
                      className={inputClass}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  ) : (
                    <input 
                      value={state.editData[field] || ''} 
                      onChange={(e) => updateState({ editData: { ...state.editData, [field]: e.target.value } })}
                      className={inputClass}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Franchises */}
            <div>
              <h3 className={`font-semibold mb-3 ${themeClass('text-gray-900', 'text-white')}`}>Franchises</h3>
              
              {/* Add New Franchise */}
              <div className={`rounded-lg p-3 mb-3 ${themeClass('bg-gray-50', 'bg-gray-700')}`}>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {['name', 'email', 'owner name', 'phone'].map(field => (
                    <input 
                      key={field}
                      placeholder={`Franchise ${field}`}
                      value={state.newFranchise[field]} 
                      onChange={(e) => updateState({ newFranchise: { ...state.newFranchise, [field]: e.target.value } })}
                      className={`p-2 border rounded text-sm ${themeClass('border-gray-200 bg-white text-gray-900 placeholder-gray-500', 'border-gray-600 bg-gray-600 text-white placeholder-gray-400')}`}
                    />
                  ))}
                </div>
                <button 
                  onClick={addFranchise}
                  className={`w-full flex items-center justify-center gap-1 ${buttonClass} hover:opacity-80`}
                  style={{ backgroundColor: '#c79e73' }}
                >
                  <Plus className="w-4 h-4" /> Add Franchise
                </button>
              </div>

              {/* Existing Franchises */}
              <div className="space-y-2">
                {state.editData.franchises?.map((f) => (
                  <div key={f.id} className={`rounded-lg p-3 ${themeClass('bg-gray-50', 'bg-gray-700')}`}>
                    <div className="flex justify-between items-start">
                      <div className="text-sm space-y-1">
                        <div className={`font-medium ${themeClass('text-gray-900', 'text-white')}`}>{f.name}</div>
                        <div className={themeClass('text-gray-600', 'text-gray-300')}>{f.email}</div>
                        <div className={themeClass('text-gray-600', 'text-gray-300')}>Manager: {f.owner_name} • {f.mobile_number}</div>
                      </div>
                      <button 
                        onClick={() => removeFranchise(f.id)}
                        className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className={`flex gap-2 pt-4 border-t ${themeClass('border-gray-200', 'border-gray-700')}`}>
              <button 
                onClick={handleSave}
                disabled={state.saving}
                className={`flex items-center gap-2 ${buttonClass} disabled:opacity-50 hover:opacity-80`}
                style={{ backgroundColor: '#c79e73' }}
              >
                {state.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {state.saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                onClick={() => updateState({ modal: '' })}
                disabled={state.saving}
                className={`px-4 py-2 text-sm disabled:opacity-50 rounded-lg transition-colors ${themeClass('bg-gray-200 hover:bg-gray-300 text-gray-700', 'bg-gray-700 hover:bg-gray-600 text-gray-200')}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}