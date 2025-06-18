import React, { useState, useEffect, useContext } from 'react'
import { Store, Plus, Search, Loader2, RefreshCw, Save, X, Filter } from 'lucide-react'
import { ThemeContext } from '../context/ThemeContext'
import AdminService from '../Firebase/services/adminApiService'

export default function OutletManagement() {
  const { isDark } = useContext(ThemeContext)
  const [state, setState] = useState({
    outlets: [],
    loading: true,
    error: '',
    search: '',
    statusFilter: 'all',
    modal: '',
    newOutlet: '',
    saving: false
  })

  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }))

  useEffect(() => { fetchOutlets() }, [])

  const fetchOutlets = async () => {
    try {
      updateState({ loading: true, error: '' })
      const result = await AdminService.getOutlets()
      
      if (result.success) {
        const outlets = result.data.data?.map(o => ({
          id: o.id,
          name: o.name || 'N/A',
          is_active: o.is_active
        }))
        updateState({ outlets })
      } else {
        updateState({ error: result.error || 'Failed to fetch outlets' })
      }
    } catch (err) {
      updateState({ error: 'Failed to load outlets' })
      console.error('Error:', err)
    } finally {
      updateState({ loading: false })
    }
  }

  const addOutlet = async () => {
    if (!state.newOutlet.trim()) return
    
    try {
      updateState({ saving: true })
      const result = await AdminService.addOutlet(state.newOutlet.trim())
      
      if (result.success) {
        await fetchOutlets()
        updateState({ modal: '', newOutlet: '' })
      } else {
        updateState({ error: result.error || 'Failed to add outlet' })
      }
    } catch (err) {
      updateState({ error: 'Failed to add outlet' })
      console.error('Error:', err)
    } finally {
      updateState({ saving: false })
    }
  }

  const updateOutletStatus = async (id, isActive) => {
    try {
      updateState({ saving: true })
      const result = await AdminService.updateOutlet(id, isActive)
      
      if (result.success) {
        updateState({ 
          outlets: state.outlets.map(o => o.id === id ? { ...o, is_active: isActive } : o)
        })
      } else {
        updateState({ error: result.error || 'Failed to update outlet status' })
      }
    } catch (err) {
      updateState({ error: 'Failed to update outlet status' })
      console.error('Error:', err)
    } finally {
      updateState({ saving: false })
    }
  }

  const getFilteredOutlets = () => {
    let filtered = state.outlets.filter(o => 
      o.name?.toLowerCase().includes(state.search.toLowerCase())
    )

    if (state.statusFilter === 'active') {
      filtered = filtered.filter(o => o.is_active)
    } else if (state.statusFilter === 'inactive') {
      filtered = filtered.filter(o => !o.is_active)
    }

    return filtered
  }

  const filtered = getFilteredOutlets()

  const getStats = () => {
    const total = state.outlets.length
    const active = state.outlets.filter(o => o.is_active).length
    const inactive = total - active
    
    return [
      { label: 'Total', value: total, color: '#c79e73', icon: Store, filter: 'all', isActive: state.statusFilter === 'all' },
      { label: 'Active', value: active, color: '#10b981', icon: Store, filter: 'active', isActive: state.statusFilter === 'active' },
      { label: 'Inactive', value: inactive, color: '#ef4444', icon: Store, filter: 'inactive', isActive: state.statusFilter === 'inactive' }
    ]
  }

  const stats = getStats()
  const themeClass = (light, dark = '') => isDark ? `${dark} dark` : light

  if (state.loading) {
    return (
      <div className={`min-h-screen ${themeClass('bg-gray-50', 'bg-gray-900')} flex items-center justify-center`}>
        <div className="text-center">
          <Loader2 className={`w-8 h-8 animate-spin mx-auto mb-4 ${themeClass('text-gray-900', 'text-white')}`} />
          <p className={`text-lg font-medium ${themeClass('text-gray-900', 'text-white')}`}>Loading outlets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${themeClass('bg-gray-50', 'bg-gray-900')} p-4 transition-colors`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${themeClass('text-gray-900', 'text-white')} mb-1`}>Outlet Management</h1>
            <p className={`text-sm ${themeClass('text-gray-600', 'text-gray-400')}`}>Manage outlet types and their status</p>
          </div>
        </div>
        
        {state.error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
            {state.error}
          </div>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" 
            placeholder="Search outlets..." 
            value={state.search} 
            onChange={(e) => updateState({ search: e.target.value })}
            className={`w-full pl-9 pr-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${themeClass('border-gray-200 bg-white text-gray-900 placeholder-gray-500', 'border-gray-600 bg-gray-800 text-white placeholder-gray-400')}`}
          />
        </div>
        <div className="flex gap-2">
            <button 
              onClick={() => updateState({ modal: 'add' })}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors hover:opacity-80"
              style={{ backgroundColor: '#c79e73' }}
            >
              <Plus className="w-4 h-4" />
              Add Outlet
            </button>
          </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((stat, i) => {
          const IconComponent = stat.icon
          return (
            <div 
              key={i} 
              onClick={() => updateState({ statusFilter: stat.filter })}
              className={`rounded-lg p-4 shadow-sm border cursor-pointer transition-all duration-200 hover:shadow-md ${
                stat.isActive ? 'ring-2 ring-opacity-50' : ''
              } ${themeClass('bg-white border-gray-200', 'bg-gray-800 border-gray-700')}`}
              style={stat.isActive ? { ringColor: stat.color } : {}}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${themeClass('text-gray-600', 'text-gray-400')}`}>{stat.label}</p>
                  <p className={`text-xl ${themeClass('text-gray-900', 'text-white')}`}>{stat.value}</p>
                </div>
                <div 
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${stat.isActive ? 'scale-110 shadow-lg' : 'hover:scale-110'}`}
                  style={{ backgroundColor: stat.color }}
                >
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Outlet List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Store className="w-12 h-12 mx-auto mb-4 opacity-50 text-gray-400" />
            <p className={`text-lg font-medium ${themeClass('text-gray-900', 'text-white')}`}>No outlets found</p>
            <p className={`text-sm ${themeClass('text-gray-600', 'text-gray-400')}`}>
              {state.search || state.statusFilter !== 'all' 
                ? 'Try adjusting your search terms or filters' 
                : 'Try adding a new outlet'}
            </p>
          </div>
        ) : (
          filtered.map((outlet, index) => (
            <div key={outlet.id} className={`rounded-lg border shadow-sm p-4 transition-all duration-200 hover:shadow-md ${themeClass('bg-white border-gray-200 hover:border-gray-300', 'bg-gray-800 border-gray-700 hover:border-gray-600')}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${themeClass('bg-gray-100 text-gray-700', 'bg-gray-700 text-gray-300')}`}>
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105" style={{ backgroundColor: '#c79e73' }}>
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`font-semibold text-lg ${themeClass('text-gray-900', 'text-white')}`}>{outlet.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                        outlet.is_active
                          ? themeClass('bg-emerald-50 text-emerald-700 border border-emerald-200', 'bg-emerald-900/30 text-emerald-300 border border-emerald-700')
                          : themeClass('bg-gray-100 text-gray-600 border border-gray-200', 'bg-gray-700 text-gray-400 border border-gray-600')
                      }`}>
                        {outlet.is_active ? '● Active' : '● Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateOutletStatus(outlet.id, !outlet.is_active)}
                    disabled={state.saving}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 ${
                      outlet.is_active
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md'
                        : 'bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md'
                    }`}
                  >
                    {state.saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                    {outlet.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Outlet Modal */}
      {state.modal === 'add' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className={`rounded-xl max-w-md w-full shadow-2xl ${themeClass('bg-white', 'bg-gray-800')} transform transition-all duration-300`}>
            <div className={`p-4 border-b flex items-center justify-between ${themeClass('border-gray-200', 'border-gray-700')}`}>
              <h2 className={`text-lg font-bold ${themeClass('text-gray-900', 'text-white')}`}>Add New Outlet</h2>
              <button 
                onClick={() => updateState({ modal: '' })} 
                className={`p-2 rounded-lg transition-colors hover:scale-110 ${themeClass('hover:bg-gray-100', 'hover:bg-gray-700')}`}
              >
                <X className={`w-5 h-5 ${themeClass('text-gray-700', 'text-gray-300')}`} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClass('text-gray-700', 'text-gray-300')}`}>
                  Outlet Name
                </label>
                <input 
                  value={state.newOutlet} 
                  onChange={(e) => updateState({ newOutlet: e.target.value })}
                  placeholder="Enter outlet name"
                  className={`w-full p-3 border rounded-lg text-sm transition-colors focus:ring-2 focus:ring-opacity-50 ${themeClass('border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500', 'border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-400')}`}
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={addOutlet}
                  disabled={state.saving || !state.newOutlet.trim()}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all duration-200 disabled:opacity-50 hover:opacity-80 hover:scale-105"
                  style={{ backgroundColor: '#c79e73' }}
                >
                  {state.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {state.saving ? 'Adding...' : 'Add Outlet'}
                </button>
                <button 
                  onClick={() => updateState({ modal: '', newOutlet: '' })}
                  disabled={state.saving}
                  className={`px-4 py-2 text-sm disabled:opacity-50 rounded-lg transition-all duration-200 hover:scale-105 ${themeClass('bg-gray-200 hover:bg-gray-300 text-gray-700', 'bg-gray-700 hover:bg-gray-600 text-gray-200')}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}