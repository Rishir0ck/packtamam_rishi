import React, { useState, useEffect, useContext, useCallback } from 'react'
import { Eye, Edit, Search, Store, MapPin, Users, Plus, Save, X, Loader2, User2, Coins, Phone, Key, MoveUpRight, CalendarDays, RefreshCw, FileText, Briefcase, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Mail, Building2 } from 'lucide-react'
import { ThemeContext } from '../context/ThemeContext'
import AdminService from '../Firebase/services/adminApiService'
import { BiSolidUserCircle } from "react-icons/bi";

const TABLE_COLUMNS = [
  { key: 'name', label: 'Restaurant', sortable: true },
  { key: 'owner', label: 'Owner', sortable: true },
  { key: 'outlet_type', label: 'Type', sortable: true },
  { key: 'city', label: 'City', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'credits', label: 'Credits', sortable: true },
  { key: 'franchises', label: 'Franchises', sortable: false },
  { key: 'joinedDate', label: 'Joined', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
]

// Move Modal outside to prevent recreation
const Modal = ({ title, children, onClose, isDark }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
    <div className={`rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
        <button onClick={onClose} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
          <X className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
        </button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  </div>
)

// Move FormField outside to prevent recreation
const FormField = ({ field, label, value, onChange, type = 'input', className = '', isDark, outletTypes, loadingOutlets }) => {
  const inputClass = `w-full p-2 border rounded text-sm ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'}`
  
  return (
    <div className={className}>
      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}
      </label>
      {type === 'status_select' ? (
        <select 
          value={value || 'active'} 
          onChange={(e) => onChange(field, e.target.value)}
          className={inputClass}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      ) : type === 'outlet_select' ? (
        <select 
          value={value || ''} 
          onChange={(e) => onChange(field, e.target.value)}
          className={inputClass}
          disabled={loadingOutlets}
        >
          <option value="">Select Outlet Type</option>
          {Array.isArray(outletTypes) && outletTypes
            .filter(type => type.is_active === true)
            .map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
        </select>
      ) : (
        <input 
          type="text"
          value={value || ''} 
          onChange={(e) => onChange(field, e.target.value)}
          className={inputClass}
        />
      )}
    </div>
  )
}

// Move FranchiseCard outside
const FranchiseCard = ({ franchise, isDark }) => (
  <div className={`rounded-lg p-3 text-sm ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        {[
          [User2, 'Owner', franchise.owner_name],
          [Briefcase, 'Business', franchise.business_name],
          [Store, 'Outlet', franchise.outlet_type],
          [Mail, 'Email', franchise.email],
          [Phone, 'Phone', franchise.mobile_number]
        ].map(([Icon, label, value], i) => (
          <div key={i} className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <Icon className="w-4 h-4" />
            <strong>{label}:</strong> {value}
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default function RestaurantManagement() {
  const { isDark } = useContext(ThemeContext)
  const [state, setState] = useState({
    restaurants: [], loading: true, error: '', selected: null, search: '', filter: 'all', modal: '', 
    editData: null, saving: false, sortBy: 'name', sortOrder: 'asc', currentPage: 1, itemsPerPage: 10, 
    outletTypes: [], loadingOutlets: false, creditAmount: '',
    newFranchise: { business_name: '', email: '', owner_name: '', mobile_number: '', outlet_type: '' }
  })

  const theme = useCallback((light, dark = '') => isDark ? `${dark} dark` : light, [isDark])

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, loadingOutlets: true, error: '' }))
    
    try {
      const [restaurantResult, outletResult] = await Promise.all([
        AdminService.getApprovedBusinessList(1, 100),
        AdminService.getOutlets()
      ])
      
      const restaurants = restaurantResult.success ? restaurantResult.data.data?.map(r => ({
        id: r.id, name: r.business_name || r.name, owner: r.owner_name || r.owner,user_id: r.user_id || null,
        legal_entity_name: r.legal_entity_name || 'N/A', email: r.email, phone: r.mobile_number,
        address: [r.address, r.location, r.landmark, r.pincode].filter(Boolean).join(', ') || 'N/A',
        city: r.city, franchise_code: r.franchise_code, fssai_no: r.fssai_no || 'N/A',
        gst_no: r.gst_no || 'N/A', outlet_type: r.outlet_type || 'N/A', 
        lift: r.is_lift_available && r.is_lift_access ? 'Yes' : 'No',
        joinedDate: r.created_at?.split('T')[0] || r.joinedDate, businessType: r.business_type || 'N/A',
        status: r.status === 'Approved' ? 'active' : 'inactive', credits: r.credits || 0,
        profileImg: r.profile_picture || null,
        restaurantImg: r.restaurant_image || "../src/assets/placeholder-image.jpg",
        franchises: r.franchise || []
      })) || [] : []

      const outletTypes = outletResult?.success ? outletResult.data.data || [] : []

      setState(prev => ({ 
        ...prev, restaurants, outletTypes, loading: false, loadingOutlets: false,
        error: !restaurantResult.success ? restaurantResult.error || 'Failed to fetch restaurants' : ''
      }))
    } catch (err) {
      setState(prev => ({ 
        ...prev, error: 'Failed to load data', loading: false, loadingOutlets: false, outletTypes: ['N/A']
      }))
    }
  }

  useEffect(() => { fetchData() }, [])

  // Stable handlers with useCallback
  const handleInputChange = useCallback((field, value) => {
    setState(prev => ({ 
      ...prev, 
      editData: prev.editData ? { ...prev.editData, [field]: value } : null 
    }))
  }, [])

  const handleNewFranchiseChange = useCallback((field, value) => {
    setState(prev => ({ 
      ...prev, 
      newFranchise: { ...prev.newFranchise, [field]: value } 
    }))
  }, [])

  const handleCreditAssign = async () => {
    if (!state.editData || !state.creditAmount) return
    
    try {
      setState(prev => ({ ...prev, saving: true }))
      const newCredits = (state.editData.credits || 0) + parseInt(state.creditAmount)
      
      const result = await AdminService.updateRestaurantCredits(state.editData.id, newCredits)
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          restaurants: prev.restaurants.map(r => r.id === state.editData.id ? {...r, credits: newCredits} : r),
          editData: {...prev.editData, credits: newCredits},
          creditAmount: '', saving: false
        }))
      } else {
        setState(prev => ({ ...prev, error: result.error || 'Failed to assign credits', saving: false }))
      }
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to assign credits', saving: false }))
    }
  }

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

      console.log(result);
      
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
      const franchise = { ...state.newFranchise, profile_picture: '', id: Date.now() }
      setState(prev => ({
        ...prev,
        editData: { ...prev.editData, franchises: [...(prev.editData.franchises || []), franchise] },
        newFranchise: { business_name: '', email: '', owner_name: '', mobile_number: '', outlet_type: '' }
      }))
    }
  }

  const handleSort = (key) => {
    setState(prev => ({
      ...prev, sortBy: key,
      sortOrder: prev.sortBy === key && prev.sortOrder === 'asc' ? 'desc' : 'asc',
      currentPage: 1
    }))
  }

  // Process data
  const processedData = (() => {
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

    const sorted = [...filtered].sort((a, b) => {
      if (!state.sortBy) return 0
      let aVal = a[state.sortBy], bVal = b[state.sortBy]
      
      if (state.sortBy === 'franchises') {
        aVal = a.franchises?.length || 0
        bVal = b.franchises?.length || 0
      }
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }
      
      if (aVal < bVal) return state.sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return state.sortOrder === 'asc' ? 1 : -1
      return 0
    })

    const totalPages = Math.ceil(sorted.length / state.itemsPerPage)
    const startIndex = (state.currentPage - 1) * state.itemsPerPage
    const paginated = sorted.slice(startIndex, startIndex + state.itemsPerPage)

    return { filtered: sorted, paginated, totalPages, startIndex }
  })()

  const stats = [
    { label: 'Total', value: state.restaurants.length, icon: Store, color: '#c79e73', filter: 'all' },
    { label: 'Active', value: state.restaurants.filter(r => r.status === 'active').length, icon: Users, color: '#10b981', filter: 'active' },
    { label: 'Inactive', value: state.restaurants.filter(r => r.status === 'inactive').length, icon: MapPin, color: '#ef4444', filter: 'inactive' },
    { label: 'With Franchises', value: state.restaurants.filter(r => r.franchises?.length > 0).length, icon: Store, color: '#8b5cf6', filter: 'with-franchises' }
  ]

  const SortIcon = ({ column }) => {
    if (state.sortBy !== column) return <ChevronUp className="w-3 h-3 opacity-30" />
    return state.sortOrder === 'asc' ? 
      <ChevronUp className="w-3 h-3" /> : 
      <ChevronDown className="w-3 h-3" />
  }

  const Pagination = () => {
    const { totalPages } = processedData
    if (totalPages <= 1) return null

    return (
      <div className={`px-4 py-3 border-t flex items-center justify-between ${theme('border-gray-200 bg-gray-50', 'border-gray-700 bg-gray-800')}`}>
        <div className={`text-sm ${theme('text-gray-700', 'text-gray-300')}`}>
          Showing {processedData.startIndex + 1} to {Math.min(processedData.startIndex + state.itemsPerPage, processedData.filtered.length)} of {processedData.filtered.length} results
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setState(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
            disabled={state.currentPage === 1}
            className={`p-1 rounded ${theme('hover:bg-gray-200 disabled:opacity-50', 'hover:bg-gray-700 disabled:opacity-50')}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className={`px-3 py-1 text-sm ${theme('text-gray-700', 'text-gray-300')}`}>
            {state.currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => setState(prev => ({ ...prev, currentPage: Math.min(totalPages, prev.currentPage + 1) }))}
            disabled={state.currentPage === totalPages}
            className={`p-1 rounded ${theme('hover:bg-gray-200 disabled:opacity-50', 'hover:bg-gray-700 disabled:opacity-50')}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  if (state.loading) {
    return (
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 text-center`}>
        <RefreshCw className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-400'} mx-auto mb-2 animate-spin`} />
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading restaurants...</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme('bg-gray-50', 'bg-gray-900')} p-4 transition-colors`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${theme('text-gray-900', 'text-white')} mb-1`}>Restaurant Management</h1>
        <p className={`text-sm ${theme('text-gray-600', 'text-gray-400')}`}>Manage approved restaurants, credits and their franchises</p>
        
        {state.error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
            {state.error}
          </div>
        )}
        {/* Search and Filter Controls */}
        <div className={`relative mb-6 rounded-lg p-4 max-w`}>
          <div className="space-y-3">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme('text-gray-400', 'text-gray-500')}`} />
              <input 
                type="text"
                placeholder="Search restaurants..."
                value={state.search}
                onChange={(e) => setState(prev => ({ ...prev, search: e.target.value, currentPage: 1 }))}
                className={`w-full pl-9 pr-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-lg focus:outline-none`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((stat, i) => {
          const IconComponent = stat.icon
          return (
            <div 
              key={i} 
              onClick={() => setState(prev => ({ ...prev, filter: stat.filter, currentPage: 1 }))}
              className={`rounded-lg p-3 shadow-sm border cursor-pointer transition-all duration-200 hover:shadow-md ${theme('bg-white border-gray-200 hover:bg-gray-50', 'bg-gray-800 border-gray-700 hover:bg-gray-750')} ${state.filter === stat.filter ? 'ring-2 ring-amber-400' : ''}`}
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

      {/* Table */}
      <div className={`rounded-lg border shadow-sm overflow-hidden ${theme('bg-white border-gray-200', 'bg-gray-800 border-gray-700')}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${theme('bg-gray-50', 'bg-gray-700')}`}>
              <tr>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme('text-gray-500', 'text-gray-300')}`}>Sr. No.</th>
                {TABLE_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme('text-gray-500', 'text-gray-300')} ${col.sortable ? 'cursor-pointer hover:bg-opacity-75' : ''}`}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && <SortIcon column={col.key} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${theme('divide-gray-200', 'divide-gray-700')}`}>
              {processedData.paginated.length === 0 ? (
                <tr>
                  <td colSpan={TABLE_COLUMNS.length + 1} className="px-4 py-12 text-center">
                    <Store className="w-12 h-12 mx-auto mb-4 opacity-50 text-gray-400" />
                    <p className={`text-lg font-medium ${theme('text-gray-900', 'text-white')}`}>No restaurants found</p>
                  </td>
                </tr>
              ) : (
                processedData.paginated.map((r, index) => (
                  <tr key={r.id} className={`${theme('hover:bg-gray-50', 'hover:bg-gray-750')}`}>
                    <td className={`px-4 py-3 text-sm ${theme('text-gray-900', 'text-gray-300')}`}>{processedData.startIndex + index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {r.profileImg ? (<img src={r.profileImg} alt="" className="w-12 h-12 rounded-full object-cover" />) : (<BiSolidUserCircle className="w-12 h-12 text-gray-400" />)}
                        <div>
                          <div className={`font-medium ${theme('text-gray-900', 'text-white')}`}>{r.name}</div>
                          <div className={`text-xs ${theme('text-gray-500', 'text-gray-400')}`}>{r.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-sm ${theme('text-gray-900', 'text-gray-300')}`}>{r.owner}</td>
                    <td className={`px-4 py-3 text-sm ${theme('text-gray-900', 'text-gray-300')}`}>{r.outlet_type}</td>
                    <td className={`px-4 py-3 text-sm ${theme('text-gray-900', 'text-gray-300')}`}>{r.city?.split(',')[0] || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        r.status === 'active' 
                          ? theme('bg-emerald-50 text-emerald-700', 'bg-emerald-900/30 text-emerald-300')
                          : theme('bg-gray-100 text-gray-600', 'bg-gray-700 text-gray-400')
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className={`font-medium ${theme('text-gray-900', 'text-white')}`}>
                          ₹{r.credits || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {r.franchises?.length > 0 ? (
                        <span className={`px-2 py-1 rounded-full text-xs ${theme('bg-purple-50 text-purple-700', 'bg-purple-900/30 text-purple-300')}`}>
                          {r.franchises.length}
                        </span>
                      ) : (
                        <span className={`text-xs ${theme('text-gray-400', 'text-gray-500')}`}>-</span>
                      )}
                    </td>
                    <td className={`px-4 py-3 text-sm ${theme('text-gray-900', 'text-gray-300')}`}>{r.joinedDate}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setState(prev => ({ ...prev, selected: r, modal: 'view' }))} 
                          className={`p-1.5 rounded transition-colors ${theme('bg-gray-100 hover:bg-gray-200 text-gray-700', 'bg-gray-700 hover:bg-gray-600 text-gray-200')}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setState(prev => ({ ...prev, editData: { ...r }, modal: 'edit' }))} 
                          className="p-1.5 text-white rounded transition-colors hover:opacity-80"
                          style={{ backgroundColor: '#c79e73' }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination />
      </div>

      {/* Edit Modal */}
      {state.modal === 'edit' && state.editData && (
        <Modal title={`Edit ${state.editData.name}`} onClose={() => setState(prev => ({ ...prev, modal: '', editData: null }))} isDark={isDark}>
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              {[
                ['name', 'Restaurant Name'],
                ['owner', 'Owner Name'],
                ['email', 'Email'],
                ['phone', 'Phone'],
                ['city', 'City'],
                ['businessType', 'Business Type'],
                ['outlet_type', 'Outlet Type', 'outlet_select'],
                ['legal_entity_name', 'Legal Entity Name'],
                ['franchise_code', 'Franchise Code'],
                ['status', 'Status', 'status_select']
              ].map(([field, label, type]) => (
                <FormField 
                  key={field}
                  field={field} 
                  label={label} 
                  value={state.editData[field]}
                  onChange={handleInputChange}
                  type={type}
                  className={field === 'address' ? 'col-span-2' : ''}
                  isDark={isDark}
                  outletTypes={state.outletTypes}
                  loadingOutlets={state.loadingOutlets}
                />
              ))}
              <FormField 
                field="address" 
                label="Address" 
                value={state.editData.address}
                onChange={handleInputChange}
                className="col-span-2"
                isDark={isDark}
              />
            </div>

            {/* Credit Assignment */}
            {!state.editData.user_id && (
              <div className={`rounded-lg p-3 ${theme('bg-gray-50', 'bg-gray-700')}`}>
                <h4 className={`font-medium mb-2 ${theme('text-gray-900', 'text-white')}`}>Assign Credits</h4>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    placeholder="Amount to add"
                    value={state.creditAmount}
                    onChange={(e) => setState(prev => ({ ...prev, creditAmount: e.target.value }))}
                    className={`flex-1 p-2 border rounded text-sm ${theme('border-gray-200 bg-white text-gray-900', 'border-gray-600 bg-gray-600 text-white')}`}
                  />
                  <button 
                    onClick={handleCreditAssign}
                    disabled={!state.creditAmount || state.saving}
                    className="px-4 py-2 text-white rounded-lg text-sm disabled:opacity-50 hover:opacity-80"
                    style={{ backgroundColor: '#c79e73' }}
                  >
                    Add Credits
                  </button>
                </div>
                <p className={`text-xs mt-1 ${theme('text-gray-600', 'text-gray-400')}`}>
                  Current: ₹{state.editData.credits || 0}
                </p>
              </div>
            )}

            {/* Franchises - Only show if user_id is not null */}
            {!state.editData.user_id && (
              <div>
                <h3 className={`font-semibold mb-3 ${theme('text-gray-900', 'text-white')}`}>Franchises</h3>
                
                {/* Add New Franchise */}
                <div className={`rounded-lg p-3 mb-3 ${theme('bg-gray-50', 'bg-gray-700')}`}>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {[
                      ['business_name', 'Business Name'],
                      ['owner_name', 'Owner Name'],
                      ['email', 'Email'],
                      ['mobile_number', 'Mobile Number']
                    ].map(([field, placeholder]) => (
                      <input 
                        key={field}
                        type="text"
                        placeholder={placeholder}
                        value={state.newFranchise[field]}
                        onChange={(e) => handleNewFranchiseChange(field, e.target.value)}
                        className={`p-2 border rounded text-sm ${theme('border-gray-200 bg-white text-gray-900', 'border-gray-600 bg-gray-600 text-white')}`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <select 
                      value={state.newFranchise.outlet_type} 
                      onChange={(e) => handleNewFranchiseChange('outlet_type', e.target.value)}
                      className={`flex-1 p-2 border rounded text-sm ${theme('border-gray-200 bg-white text-gray-900', 'border-gray-600 bg-gray-600 text-white')}`}
                      disabled={state.loadingOutlets}
                    >
                      <option value="">Select Outlet Type</option>
                      {Array.isArray(state.outletTypes) && state.outletTypes
                        .filter(type => type.is_active === true)
                        .map((cat) => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                    <button 
                      onClick={addFranchise}
                      disabled={!state.newFranchise.business_name || !state.newFranchise.email}
                      className="px-4 py-2 text-white rounded-lg text-sm disabled:opacity-50 hover:opacity-80"
                      style={{ backgroundColor: '#c79e73' }}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Existing Franchises */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {state.editData.franchises && state.editData.franchises.length > 0 ? (
                    state.editData.franchises.map((franchise, index) => (
                      <div key={index} className="relative">
                        <FranchiseCard franchise={franchise} isDark={isDark} />
                        <button 
                          onClick={() => setState(prev => ({
                            ...prev,
                            editData: {
                              ...prev.editData,
                              franchises: prev.editData.franchises.filter((_, i) => i !== index)
                            }
                          }))}
                          className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className={`text-sm ${theme('text-gray-500', 'text-gray-400')} text-center py-4`}>
                      No franchises added yet
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-2 pt-4">
              <button 
                onClick={() => setState(prev => ({ ...prev, modal: '', editData: null }))}
                className={`px-4 py-2 rounded-lg text-sm ${theme('bg-gray-100 hover:bg-gray-200 text-gray-700', 'bg-gray-600 hover:bg-gray-500 text-gray-200')}`}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={state.saving}
                className="px-4 py-2 text-white rounded-lg text-sm disabled:opacity-50 hover:opacity-80 flex items-center gap-2"
                style={{ backgroundColor: '#c79e73' }}
              >
                {state.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {state.saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Modal */}
      {state.modal === 'view' && state.selected && (
        <Modal title={`${state.selected.name} Details`} onClose={() => setState(prev => ({ ...prev, modal: '', selected: null }))} isDark={isDark}>
          <div className="space-y-6">
            {/* Restaurant Header */}
            <div className="flex items-start gap-4">
              {state.selected.profileImg ? (<img src={state.selected.profileImg} alt="" className="w-12 h-12 rounded-full object-cover" />) : (<BiSolidUserCircle className="w-12 h-12 text-gray-400" />)}
              <div className="flex-1">
                <h3 className={`text-xl font-bold ${theme('text-gray-900', 'text-white')}`}>
                  {state.selected.name}
                </h3>
                <p className={`${theme('text-gray-600', 'text-gray-400')}`}>
                  {state.selected.owner}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    state.selected.status === 'active' 
                      ? theme('bg-emerald-50 text-emerald-700', 'bg-emerald-900/30 text-emerald-300')
                      : theme('bg-gray-100 text-gray-600', 'bg-gray-700 text-gray-400')
                  }`}>
                    {state.selected.status}
                  </span>
                  <div className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className={`font-medium ${theme('text-gray-900', 'text-white')}`}>
                      ₹{state.selected.credits || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Restaurant Image */}
            <div className="flex justify-center">
              <img 
                src={state.selected.restaurantImg} 
                alt="Restaurant"
                className="w-60 h-40 rounded-lg object-cover"
              />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                [Mail, 'Email', state.selected.email],
                [Phone, 'Phone', state.selected.phone],
                [MapPin, 'City', state.selected.city],
                [Store, 'Outlet Type', state.selected.outlet_type],
                [Building2, 'Business Type', state.selected.businessType],
                [FileText, 'Legal Entity', state.selected.legal_entity_name],
                [Key, 'Franchise Code', state.selected.franchise_code],
                [FileText, 'FSSAI No', state.selected.fssai_no],
                [FileText, 'GST No', state.selected.gst_no],
                [MoveUpRight, 'Lift Available', state.selected.lift],
                [CalendarDays, 'Joined Date', state.selected.joinedDate]
              ].map(([Icon, label, value], i) => (
                <div key={i} className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${theme('text-gray-500', 'text-gray-400')}`} />
                  <div>
                    <p className={`text-xs ${theme('text-gray-500', 'text-gray-400')}`}>{label}</p>
                    <p className={`font-medium ${theme('text-gray-900', 'text-white')}`}>{value || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Address */}
            <div>
              <h4 className={`font-medium mb-2 ${theme('text-gray-900', 'text-white')}`}>Address</h4>
              <p className={`${theme('text-gray-600', 'text-gray-400')}`}>
                {state.selected.address || 'No address provided'}
              </p>
            </div>

            {/* Franchises */}
            {state.selected.franchises && state.selected.franchises.length > 0 && (
              <div>
                <h4 className={`font-medium mb-3 ${theme('text-gray-900', 'text-white')}`}>
                  Franchises ({state.selected.franchises.length})
                </h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {state.selected.franchises.map((franchise, index) => (
                    <FranchiseCard key={index} franchise={franchise} isDark={isDark} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}