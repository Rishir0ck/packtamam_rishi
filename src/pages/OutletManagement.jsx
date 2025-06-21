import React, { useState, useEffect, useContext } from 'react'
import { Store, Plus, Search, Loader2, X, Save, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { ThemeContext } from '../context/ThemeContext'
import AdminService from '../Firebase/services/adminApiService'

export default function OutletManagement() {
  const { isDark } = useContext(ThemeContext)
  const [state, setState] = useState({
    outlets: [], loading: true, error: '', search: '', statusFilter: 'all',
    modal: '', newOutlet: '', saving: false, sortBy: 'name', sortOrder: 'asc',
    currentPage: 1, itemsPerPage: 10
  })

  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }))
  const themeClass = (light, dark = '') => isDark ? `${dark} dark` : light

  useEffect(() => { fetchOutlets() }, [])

  const fetchOutlets = async () => {
    try {
      updateState({ loading: true, error: '' })
      const result = await AdminService.getOutlets()
      
      if (result.success) {
        const outlets = result.data.data?.map((o, index) => ({
          id: o.id, name: o.name || 'N/A', is_active: o.is_active, index: index + 1
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
    } finally {
      updateState({ saving: false })
    }
  }

  const handleSort = (column) => {
    const newOrder = state.sortBy === column && state.sortOrder === 'asc' ? 'desc' : 'asc'
    updateState({ sortBy: column, sortOrder: newOrder, currentPage: 1 })
  }

  const getSortedAndFilteredOutlets = () => {
    let filtered = state.outlets.filter(o => 
      o.name?.toLowerCase().includes(state.search.toLowerCase()) &&
      (state.statusFilter === 'all' || 
       (state.statusFilter === 'active' && o.is_active) ||
       (state.statusFilter === 'inactive' && !o.is_active))
    )

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[state.sortBy], bVal = b[state.sortBy]
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }
      const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return state.sortOrder === 'asc' ? result : -result
    })

    return filtered
  }

  const getPaginatedData = () => {
    const filtered = getSortedAndFilteredOutlets()
    const startIndex = (state.currentPage - 1) * state.itemsPerPage
    const endIndex = startIndex + state.itemsPerPage
    return {
      data: filtered.slice(startIndex, endIndex),
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / state.itemsPerPage)
    }
  }

  const getStats = () => {
    const total = state.outlets.length
    const active = state.outlets.filter(o => o.is_active).length
    return [
      { label: 'Total', value: total, color: '#c79e73', filter: 'all', isActive: state.statusFilter === 'all' },
      { label: 'Active', value: active, color: '#10b981', filter: 'active', isActive: state.statusFilter === 'active' },
      { label: 'Inactive', value: total - active, color: '#ef4444', filter: 'inactive', isActive: state.statusFilter === 'inactive' }
    ]
  }

  const SortIcon = ({ column }) => {
    if (state.sortBy !== column) return <ChevronUp className="w-4 h-4 opacity-30" />
    return state.sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

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

  const { data: paginatedOutlets, total, totalPages } = getPaginatedData()
  const stats = getStats()

  return (
    <div className={`min-h-screen ${themeClass('bg-gray-50', 'bg-gray-900')} p-6`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${themeClass('text-gray-900', 'text-white')} mb-2`}>Outlet Management</h1>
        <p className={`${themeClass('text-gray-600', 'text-gray-400')}`}>Manage outlet types and their status</p>
        
        {state.error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
            {state.error}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            onClick={() => updateState({ statusFilter: stat.filter, currentPage: 1 })}
            className={`rounded-lg p-4 shadow-sm border cursor-pointer transition-all ${
              stat.isActive ? 'ring-2 ring-opacity-50' : ''
            } ${themeClass('bg-white border-gray-200 hover:shadow-md', 'bg-gray-800 border-gray-700 hover:shadow-lg')}`}
            style={stat.isActive ? { ringColor: stat.color } : {}}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${themeClass('text-gray-600', 'text-gray-400')}`}>{stat.label}</p>
                <p className={`text-2xl font-bold ${themeClass('text-gray-900', 'text-white')}`}>{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color }}>
                <Store className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" 
            placeholder="Search outlets..." 
            value={state.search} 
            onChange={(e) => updateState({ search: e.target.value, currentPage: 1 })}
            className={`pl-10 pr-4 py-2 w-80 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClass('border-gray-300 bg-white', 'border-gray-600 bg-gray-700 text-white')}`}
          />
        </div>
        <button 
          onClick={() => updateState({ modal: 'add' })}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
          style={{ backgroundColor: '#c79e73' }}
        >
          <Plus className="w-4 h-4" />
          Add Outlet
        </button>
      </div>

      {/* Table */}
      <div className={`rounded-lg shadow-sm border overflow-hidden ${themeClass('bg-white border-gray-200', 'bg-gray-800 border-gray-700')}`}>
        <table className="w-full">
          <thead className={`${themeClass('bg-gray-50', 'bg-gray-700')}`}>
            <tr>
              {[
                { key: 'index', label: 'Sr.No.', sortable: true },
                { key: 'name', label: 'Outlet Name', sortable: true },
                { key: 'is_active', label: 'Status', sortable: true },
                { key: 'actions', label: 'Actions', sortable: false }
              ].map(col => (
                <th key={col.key} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClass('text-gray-500', 'text-gray-300')}`}>
                  {col.sortable ? (
                    <button 
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      {col.label}
                      <SortIcon column={col.key} />
                    </button>
                  ) : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${themeClass('divide-gray-200', 'divide-gray-600')}`}>
            {paginatedOutlets.map((outlet) => (
              <tr key={outlet.id} className={`hover:bg-opacity-50 ${themeClass('hover:bg-gray-50', 'hover:bg-gray-700')}`}>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClass('text-gray-900', 'text-white')}`}>
                  {outlet.index}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap ${themeClass('text-gray-900', 'text-white')}`}>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: '#c79e73' }}>
                      <Store className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">{outlet.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    outlet.is_active
                      ? themeClass('bg-green-100 text-green-800', 'bg-green-900 text-green-300')
                      : themeClass('bg-gray-100 text-gray-800', 'bg-gray-700 text-gray-300')
                  }`}>
                    {outlet.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => updateOutletStatus(outlet.id, !outlet.is_active)}
                    disabled={state.saving}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors disabled:opacity-50 ${
                      outlet.is_active
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {outlet.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`px-6 py-3 border-t flex items-center justify-between ${themeClass('border-gray-200', 'border-gray-600')}`}>
            <div className={`text-sm ${themeClass('text-gray-700', 'text-gray-300')}`}>
              Showing {((state.currentPage - 1) * state.itemsPerPage) + 1} to {Math.min(state.currentPage * state.itemsPerPage, total)} of {total} results
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => updateState({ currentPage: Math.max(1, state.currentPage - 1) })}
                disabled={state.currentPage === 1}
                className={`p-2 rounded disabled:opacity-50 ${themeClass('hover:bg-gray-100', 'hover:bg-gray-700')}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className={`px-3 py-1 text-sm ${themeClass('text-gray-700', 'text-gray-300')}`}>
                {state.currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => updateState({ currentPage: Math.min(totalPages, state.currentPage + 1) })}
                disabled={state.currentPage === totalPages}
                className={`p-2 rounded disabled:opacity-50 ${themeClass('hover:bg-gray-100', 'hover:bg-gray-700')}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {total === 0 && (
        <div className="text-center py-12">
          <Store className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
          <p className={`text-lg font-medium ${themeClass('text-gray-900', 'text-white')}`}>No outlets found</p>
          <p className={`text-sm ${themeClass('text-gray-600', 'text-gray-400')}`}>
            {state.search || state.statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'Try adding a new outlet'}
          </p>
        </div>
      )}

      {/* Add Modal */}
      {state.modal === 'add' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className={`rounded-xl max-w-md w-full shadow-2xl ${themeClass('bg-white', 'bg-gray-800')}`}>
            <div className={`p-4 border-b flex items-center justify-between ${themeClass('border-gray-200', 'border-gray-700')}`}>
              <h2 className={`text-lg font-bold ${themeClass('text-gray-900', 'text-white')}`}>Add New Outlet</h2>
              <button onClick={() => updateState({ modal: '', newOutlet: '' })} className={`p-2 rounded-lg ${themeClass('hover:bg-gray-100', 'hover:bg-gray-700')}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClass('text-gray-700', 'text-gray-300')}`}>Outlet Name</label>
                <input 
                  value={state.newOutlet} 
                  onChange={(e) => updateState({ newOutlet: e.target.value })}
                  placeholder="Enter outlet name"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClass('border-gray-300 bg-white', 'border-gray-600 bg-gray-700 text-white')}`}
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={addOutlet}
                  disabled={state.saving || !state.newOutlet.trim()}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg disabled:opacity-50 hover:opacity-90"
                  style={{ backgroundColor: '#c79e73' }}
                >
                  {state.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {state.saving ? 'Adding...' : 'Add Outlet'}
                </button>
                <button 
                  onClick={() => updateState({ modal: '', newOutlet: '' })}
                  className={`px-4 py-2 rounded-lg ${themeClass('bg-gray-200 hover:bg-gray-300 text-gray-700', 'bg-gray-700 hover:bg-gray-600 text-gray-200')}`}
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