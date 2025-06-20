import React, { useState, useEffect, useContext, useCallback } from 'react'
import { Eye, Edit, Search, Store, MapPin, Users, Plus, Save, X, Loader2, RefreshCw } from 'lucide-react'
import { ThemeContext } from '../context/ThemeContext'
import AdminService from '../Firebase/services/adminApiService'

const OUTLET_TYPES = ['Restaurant', 'Cafe', 'Fast Food', 'Fine Dining', 'Bakery', 'Food Truck', 'Catering', 'Bar & Grill', 'Pizzeria', 'Buffet', 'Delivery Only', 'Cloud Kitchen']

export default function RestaurantManagement() {
  const { isDark } = useContext(ThemeContext)
  const [state, setState] = useState({
    restaurants: [], loading: true, error: '', selected: null, search: '', filter: 'all', modal: '', editData: null, saving: false,
    newFranchise: { business_name: '', email: '', owner_name: '', mobile_number: '', outlet_type: '' }
  })

  const theme = useCallback((light, dark = '') => isDark ? `${dark} dark` : light, [isDark])
  const inputClass = `w-full p-2 border rounded text-sm ${theme('border-gray-200 bg-white text-gray-900', 'border-gray-600 bg-gray-700 text-white')}`

  useEffect(() => { fetchRestaurants() }, [])

  const fetchRestaurants = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: '' }))
      const result = await AdminService.getApprovedBusinessList(1, 100)
      
      if (result.success) {
        const restaurants = result.data.data?.map(r => ({
          id: r.id, name: r.business_name || r.name, owner: r.owner_name || r.owner,
          legal_entity_name: r.legal_entity_name || 'N/A', email: r.email, phone: r.mobile_number,
          address: [r.address, r.location, r.landmark, r.pincode].filter(Boolean).join(', ') || 'N/A',
          city: r.city, franchise_code: r.franchise_code, fssai_no: r.fssai_no || 'N/A',
          gst_no: r.gst_no || 'N/A', outlet_type: r.outlet_type || 'Restaurant', 
          lift: r.is_lift_available && r.is_lift_access ? 'Yes' : 'No',
          joinedDate: r.created_at?.split('T')[0] || r.joinedDate, businessType: r.business_type || 'N/A',
          status: r.status === 'Approved' ? 'active' : 'inactive',
          profileImg: r.profile_picture || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          restaurantImg: r.restaurant_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
          franchises: r.franchise || []
        })) || []
        setState(prev => ({ ...prev, restaurants, loading: false }))
      } else {
        setState(prev => ({ ...prev, error: result.error || 'Failed to fetch restaurants', loading: false }))
      }
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to load restaurants', loading: false }))
    }
  }

  const handleInputChange = useCallback((field, value) => {
    setState(prev => ({
      ...prev,
      editData: { ...prev.editData, [field]: value }
    }))
  }, [])

  const handleNewFranchiseChange = useCallback((field, value) => {
    setState(prev => ({
      ...prev,
      newFranchise: { ...prev.newFranchise, [field]: value }
    }))
  }, [])

  const handleSave = async () => {
    if (!state.editData) return
    
    try {
      setState(prev => ({ ...prev, saving: true }))
      const { id, name, owner, email, phone, city, address, businessType, outlet_type, 
              legal_entity_name, franchise_code, status, franchises } = state.editData
      
      const result = await AdminService.updateBusiness(
        id, name, owner, email, phone, city, address, businessType, outlet_type, 
        legal_entity_name, franchise_code, status === 'active', franchises
      )
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          restaurants: prev.restaurants.map(r => r.id === id ? state.editData : r),
          modal: '', editData: null, saving: false
        }))
      } else {
        setState(prev => ({ ...prev, error: result.error || 'Failed to save changes', saving: false }))
      }
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to save changes', saving: false }))
    }
  }

  const addFranchise = () => {
    if (state.newFranchise.business_name && state.newFranchise.email) {
      const franchise = { ...state.newFranchise, profile_picture: '' }
      setState(prev => ({
        ...prev,
        editData: { ...prev.editData, franchises: [...(prev.editData.franchises || []), franchise] },
        newFranchise: { business_name: '', email: '', owner_name: '', mobile_number: '', outlet_type: '' }
      }))
    }
  }

  const removeFranchise = (id) => {
    setState(prev => ({
      ...prev,
      editData: { ...prev.editData, franchises: prev.editData.franchises.filter(f => f.id !== id) }
    }))
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

  const stats = [
    { label: 'Total', value: state.restaurants.length, icon: Store, color: '#c79e73', filter: 'all' },
    { label: 'Active', value: state.restaurants.filter(r => r.status === 'active').length, icon: Users, color: '#10b981', filter: 'active' },
    { label: 'Inactive', value: state.restaurants.filter(r => r.status === 'inactive').length, icon: MapPin, color: '#ef4444', filter: 'inactive' },
    { label: 'With Franchises', value: state.restaurants.filter(r => r.franchises?.length > 0).length, icon: Store, color: '#8b5cf6', filter: 'with-franchises' }
  ]

  if (state.loading) {
    return (
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 text-center`}>
        <RefreshCw className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-400'} mx-auto mb-2 animate-spin`} />
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading restaurants...</p>
      </div>
    )
  }

  const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className={`rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${theme('bg-white', 'bg-gray-800')}`}>
        <div className={`p-4 border-b flex items-center justify-between ${theme('border-gray-200', 'border-gray-700')}`}>
          <h2 className={`text-lg font-bold ${theme('text-gray-900', 'text-white')}`}>{title}</h2>
          <button onClick={onClose} className={`p-2 rounded-lg ${theme('hover:bg-gray-100', 'hover:bg-gray-700')}`}>
            <X className={`w-5 h-5 ${theme('text-gray-700', 'text-gray-300')}`} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )

  const FranchiseCard = ({ f, onRemove, showActions = false }) => (
    <div className={`rounded-lg p-3 text-sm ${theme('bg-gray-100', 'bg-gray-700')}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className={theme('text-gray-600', 'text-gray-300')}><strong>🧑🏼‍💼 Owner:</strong> {f.owner_name}</div>
          <div className={theme('text-gray-600', 'text-gray-300')}><strong>🏣 Business:</strong> {f.business_name}</div>
          <div className={theme('text-gray-600', 'text-gray-300')}><strong>🏬 Outlet:</strong> {f.outlet_type}</div>
          <div className={theme('text-gray-600', 'text-gray-300')}><strong>📧 Email:</strong> {f.email}</div>
          <div className={theme('text-gray-600', 'text-gray-300')}><strong>📞 Phone:</strong> {f.mobile_number}</div>
        </div>
        {showActions && (
          <button onClick={() => onRemove(f.id)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )

  const FormField = ({ field, label, type = 'input', className = '' }) => (
    <div className={className}>
      <label className={`block text-sm font-medium mb-1 ${theme('text-gray-700', 'text-gray-300')}`}>
        {label}
      </label>
      {type === 'status_select' ? (
        <select 
          value={state.editData[field] || 'active'} 
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={inputClass}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      ) : type === 'outlet_select' ? (
        <select 
          value={state.editData[field] || 'Restaurant'} 
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={inputClass}
        >
          {OUTLET_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      ) : (
        <input 
          type="text"
          value={state.editData[field] || ''} 
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={inputClass}
        />
      )}
    </div>
  )

  return (
    <div className={`min-h-screen ${theme('bg-gray-50', 'bg-gray-900')} p-4 transition-colors`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${theme('text-gray-900', 'text-white')} mb-1`}>Restaurant Management</h1>
        <p className={`text-sm ${theme('text-gray-600', 'text-gray-400')}`}>Manage approved restaurants and their franchises</p>
        
        {state.error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
            {state.error}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text" 
          placeholder="Search restaurants, owners, or outlet..." 
          value={state.search} 
          onChange={(e) => setState(prev => ({ ...prev, search: e.target.value }))}
          className={`w-full pl-9 pr-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${theme('border-gray-200 bg-white text-gray-900 placeholder-gray-500', 'border-gray-600 bg-gray-800 text-white placeholder-gray-400')}`}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((stat, i) => {
          const IconComponent = stat.icon
          return (
            <div 
              key={i} 
              onClick={() => setState(prev => ({ ...prev, filter: stat.filter }))}
              className={`rounded-lg p-3 shadow-sm border cursor-pointer transition-all duration-200 hover:shadow-md ${theme('bg-white border-gray-200 hover:bg-gray-50', 'bg-gray-800 border-gray-700 hover:bg-gray-750')} ${state.filter === stat.filter ? 'ring-2' : ''}`}
              style={{ ringColor: state.filter === stat.filter ? '#c79e73' : 'transparent' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${theme('text-gray-600', 'text-gray-400')}`}>{stat.label}</p>
                  <p className={`text-xl font-bold ${theme('text-gray-900', 'text-white')}`}>{stat.value}</p>
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
            <Store className="w-12 h-12 mx-auto mb-4 opacity-50 text-gray-400" />
            <p className={`text-lg font-medium ${theme('text-gray-900', 'text-white')}`}>No restaurants found</p>
          </div>
        ) : (
          filtered.map((r) => (
            <div key={r.id} className={`rounded-lg border shadow-sm p-4 transition-colors ${theme('bg-white border-gray-200', 'bg-gray-800 border-gray-700')}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={r.profileImg} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${theme('text-gray-900', 'text-white')}`}>{r.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        r.status === 'active' 
                          ? theme('bg-emerald-50 text-emerald-700', 'bg-emerald-900/30 text-emerald-300')
                          : theme('bg-gray-100 text-gray-600', 'bg-gray-700 text-gray-400')
                      }`}>
                        {r.status}
                      </span>
                      {r.franchises?.length > 0 && (
                        <span className={`px-2 py-1 rounded-full text-xs ${theme('bg-purple-50 text-purple-700', 'bg-purple-900/30 text-purple-300')}`}>
                          {r.franchises.length} franchise{r.franchises.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className={`text-sm flex items-center gap-4 mt-1 ${theme('text-gray-600', 'text-gray-400')}`}>
                      <span>👤 {r.owner}</span>
                      <span>🍽️ {r.outlet_type}</span>
                      <span>🏙️ {r.city?.split(',')[0] || 'No city'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setState(prev => ({ ...prev, selected: r, modal: 'view' }))} 
                    className={`p-2 rounded-lg transition-colors ${theme('bg-gray-100 hover:bg-gray-200 text-gray-700', 'bg-gray-700 hover:bg-gray-600 text-gray-200')}`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setState(prev => ({ ...prev, editData: { ...r }, modal: 'edit' }))} 
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
        <Modal title={state.selected.name} onClose={() => setState(prev => ({ ...prev, modal: '' }))}>
          <div className="space-y-4">
            <img src={state.selected.profileImg} alt="" className="w-24 h-24 object-cover rounded-lg" />
            <div className={`px-2 py-1 rounded text-xs inline-block ${
              state.selected.status === 'active' 
              ? theme('bg-emerald-50 text-emerald-700', 'bg-emerald-900/30 text-emerald-300')
              : theme('bg-gray-100 text-gray-600', 'bg-gray-700 text-gray-400')
            }`}>
              Status: {state.selected.status}
            </div>
            <div className={`grid grid-cols-2 gap-4 text-sm ${theme('text-gray-700', 'text-gray-300')}`}>
              <div className="space-y-2">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Contact</h3>
                {[
                  ['👤 Owner:', state.selected.owner],
                  ['📧 Email:', state.selected.email],
                  ['📞 Phone:', state.selected.phone],
                  ['🏢 Legal Entity:', state.selected.legal_entity_name],
                  ['🧾 FSSAI:', state.selected.fssai_no],
                  ['🏙️ City:', state.selected.city],
                  ['🏙️ Lift:', state.selected.lift]
                ].map(([label, value], i) => (
                  <div key={i} className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    <strong>{label}</strong> {value}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Details</h3>
                {[
                  ['🍽️ Business Type:', state.selected.businessType],
                  ['🏬 Outlet Type:', state.selected.outlet_type],
                  ['🏷️ Franchise Code:', state.selected.franchise_code],
                  ['📅 Applied Date:', state.selected.joinedDate],
                  ['🧾 GST:', state.selected.gst_no],
                  ['📍 Address:', state.selected.address]
                ].map(([label, value], i) => (
                  <div key={i} className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    <strong>{label}</strong> {value}
                  </div>
                ))}
              </div>
            </div>
            
            {state.selected.franchises?.length > 0 && (
              <div>
                <h3 className={`font-semibold mb-2 ${theme('text-gray-900', 'text-white')}`}>
                  Franchises ({state.selected.franchises.length})
                </h3>
                <div className="space-y-2">
                  {state.selected.franchises.map((f) => (
                    <FranchiseCard key={f.id} f={f} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {state.modal === 'edit' && state.editData && (
        <Modal title={`Edit ${state.editData.name}`} onClose={() => setState(prev => ({ ...prev, modal: '' }))}>
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField field="name" label="Restaurant Name" />
              <FormField field="owner" label="Owner Name" />
              <FormField field="email" label="Email" />
              <FormField field="phone" label="Phone" />
              <FormField field="address" label="Address" className="col-span-2" />
              <FormField field="city" label="City" />
              <FormField field="businessType" label="Business Type" />
              <FormField field="outlet_type" label="Outlet Type" type="outlet_select" />
              <FormField field="legal_entity_name" label="Legal Entity Name" />
              <FormField field="franchise_code" label="Franchise Code" />
              <FormField field="status" label="Status" type="status_select" />
            </div>

            {/* Franchises */}
            <div>
              <h3 className={`font-semibold mb-3 ${theme('text-gray-900', 'text-white')}`}>Franchises</h3>
              
              {/* Add New Franchise */}
              <div className={`rounded-lg p-3 mb-3 ${theme('bg-gray-50', 'bg-gray-700')}`}>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {[
                    ['business_name', 'Business Name'],
                    ['owner_name', 'Owner Name'],
                    ['email', 'Email'],
                    ['mobile_number', 'Mobile Number'],
                    ['outlet_type', 'Outlet Type', 'select']
                  ].map(([field, placeholder, type = 'input']) => (
                    type === 'select' ? (
                      <select
                        key={field}
                        value={state.newFranchise[field]}
                        onChange={(e) => handleNewFranchiseChange(field, e.target.value)}
                        className={`p-2 border rounded text-sm ${theme('border-gray-200 bg-white text-gray-900', 'border-gray-600 bg-gray-600 text-white')}`}
                      >
                        <option value="">{placeholder}</option>
                        {OUTLET_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    ) : (
                      <input 
                        key={field}
                        type="text"
                        placeholder={placeholder}
                        value={state.newFranchise[field]} 
                        onChange={(e) => handleNewFranchiseChange(field, e.target.value)}
                        className={`p-2 border rounded text-sm ${theme('border-gray-200 bg-white text-gray-900 placeholder-gray-500', 'border-gray-600 bg-gray-600 text-white placeholder-gray-400')}`}
                      />
                    )
                  ))}
                </div>
                <button 
                  onClick={addFranchise}
                  className="w-full flex items-center justify-center gap-1 px-4 py-2 text-white rounded-lg transition-colors text-sm hover:opacity-80"
                  style={{ backgroundColor: '#c79e73' }}
                >
                  <Plus className="w-4 h-4" /> Add Franchise
                </button>
              </div>

              {/* Existing Franchises */}
              {state.editData.franchises?.length > 0 && (
                <div className="space-y-2">
                  {state.editData.franchises.map((f) => (
                    <FranchiseCard key={f.id} f={f} onRemove={removeFranchise} showActions={true} />
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className={`flex gap-2 pt-4 border-t ${theme('border-gray-200', 'border-gray-700')}`}>
              <button 
                onClick={handleSave}
                disabled={state.saving}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm disabled:opacity-50 hover:opacity-80"
                style={{ backgroundColor: '#c79e73' }}
              >
                {state.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {state.saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                onClick={() => setState(prev => ({ ...prev, modal: '' }))}
                disabled={state.saving}
                className={`px-4 py-2 text-sm disabled:opacity-50 rounded-lg transition-colors ${theme('bg-gray-200 hover:bg-gray-300 text-gray-700', 'bg-gray-700 hover:bg-gray-600 text-gray-200')}`}
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