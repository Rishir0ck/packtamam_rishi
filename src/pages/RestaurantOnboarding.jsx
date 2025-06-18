import React, { useState, useEffect } from 'react'
import { Eye, Check, X, MessageSquare, Search, Download, FileText, Store, Clock, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import useTheme from '../hooks/useTheme'
import AdminService from '../Firebase/services/adminApiService'

export default function RestaurantOnboarding() {
  const { isDark } = useTheme()
  const [allRestaurants, setAllRestaurants] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState('')
  const [query, setQuery] = useState('')
  const [queryTarget, setQueryTarget] = useState(null)

  useEffect(() => { loadRestaurants() }, [])
  useEffect(() => { filterRestaurants() }, [filter, allRestaurants])

  const loadRestaurants = async () => {
    setLoading(true)
    setError('')
    try {
      const [pending, approved, rejected, queryList] = await Promise.all([
        AdminService.getPendingBusinessList(1, 100),
        AdminService.getApprovedBusinessList(1, 100),
        AdminService.getRejectedBusinessList(1, 100),
        AdminService.getQueryBusinessList(1, 100)
      ])
      
      if (pending.success && approved.success && rejected.success && queryList.success) {
        const allData = [
          ...(pending.data.data || []).map(item => ({ ...item, status: 'pending' })),
          ...(approved.data.data || []).map(item => ({ ...item, status: 'approved' })),
          ...(rejected.data.data || []).map(item => ({ ...item, status: 'rejected' })),
          ...(queryList.data.data || []).map(item => ({ ...item, status: 'query' }))
        ]
        
        const transformedData = allData.map(item => ({
          id: item.id,
          name: item.business_name || item.name || 'N/A',
          owner: item.owner_name || item.contact_person || 'N/A',
          email: item.email || 'N/A',
          phone: item.mobile_number || item.contact_number || 'N/A',
          address: [item.address, item.location, item.landmark, item.city, item.pincode].filter(Boolean).join(', ') || 'N/A',
          cuisine: item.cuisine_type || item.business_type || 'N/A',
          outlet: item.outlet_type || 'N/A',
          entity_name: item.legal_entity_name || 'N/A',
          franchise_code: item.franchise_code || 'N/A',
          appliedDate: item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          status: item.status,
          liftInfo: item.is_lift_available && item.is_lift_access ? 'Yes' : 'No',
          profileImg: item.profile_picture || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          documents: item.documents || {},
          queryHistory: item.query_history || []
        }))
        setAllRestaurants(transformedData)
      } else throw new Error('Failed to load restaurant data')
    } catch (err) {
      setError(err.message || 'Failed to load restaurants')
    } finally {
      setLoading(false)
    }
  }

  const filterRestaurants = () => setRestaurants(filter === 'all' ? allRestaurants : allRestaurants.filter(r => r.status === filter))
  const filtered = restaurants.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.owner.toLowerCase().includes(search.toLowerCase()))

  const handleAction = async (id, action) => {
    if (action === 'query') {
      setQueryTarget(allRestaurants.find(r => r.id === id))
      setModal('query')
      return
    }
    
    setLoading(true)
    setError('')
    try {
      const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1)
      const result = await AdminService.updateBusinessStatus(id, capitalizedAction)
      if (result.success) {
        await loadRestaurants() // Reload to get fresh data
      } else throw new Error(result.error || 'Failed to update status')
    } catch (err) {
      setError(err.message || 'Failed to update restaurant status')
    } finally {
      setLoading(false)
    }
  }

  const sendQuery = async () => {
    if (!query.trim() || !queryTarget) return
    
    setLoading(true)
    setError('')
    try {
      const result = await AdminService.updateBusinessStatus(queryTarget.id, 'Query', query.trim())
      if (result.success) {
        await loadRestaurants() // Reload to get fresh data
        setModal('')
        setQuery('')
        setQueryTarget(null)
      } else throw new Error(result.error || 'Failed to send query')
    } catch (err) {
      setError(err.message || 'Failed to send query')
    } finally {
      setLoading(false)
    }
  }

  const downloadDocument = async (url, fileName) => {
    if (!url || url === '#') return
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    } catch (error) {
      window.open(url, '_blank')
    }
  }

  const statusColors = {
    pending: isDark ? 'bg-amber-900/30 text-amber-300 border-amber-600' : 'bg-amber-50 text-amber-700 border-amber-200',
    approved: isDark ? 'bg-emerald-900/30 text-emerald-300 border-emerald-600' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: isDark ? 'bg-red-900/30 text-red-300 border-red-600' : 'bg-red-50 text-red-700 border-red-200',
    query: isDark ? 'bg-blue-900/30 text-blue-300 border-blue-600' : 'bg-blue-50 text-blue-700 border-blue-200'
  }

  const stats = [
    { label: 'Total', value: allRestaurants.length, icon: Store, color: '#c79e73', filter: 'all' },
    { label: 'Pending', value: allRestaurants.filter(r => r.status === 'pending').length, icon: Clock, color: '#f59e0b', filter: 'pending' },
    { label: 'Query', value: allRestaurants.filter(r => r.status === 'query').length, icon: AlertCircle, color: '#8b5cf6', filter: 'query' },
    { label: 'Approved', value: allRestaurants.filter(r => r.status === 'approved').length, icon: CheckCircle, color: '#10b981', filter: 'approved' },
    { label: 'Rejected', value: allRestaurants.filter(r => r.status === 'rejected').length, icon: XCircle, color: '#ef4444', filter: 'rejected' }
  ]

  const DocCard = ({ docArray, name }) => {
    if (!docArray || docArray.length === 0) {
      return (
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-3`}>
          <div className={`aspect-[4/3] ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded mb-2 flex items-center justify-center`}>
            <FileText className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          </div>
          <h4 className={`font-medium text-sm mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{name}</h4>
          <button className={`w-full p-1 text-xs rounded ${isDark ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`}>N/A</button>
        </div>
      )
    }

    const doc = docArray[0]
    const ext = doc.path?.split('.').pop()?.toLowerCase() || 'unknown'
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)

    return (
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-3`}>
        <div className={`aspect-[4/3] ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded mb-2 flex items-center justify-center overflow-hidden`}>
          {isImage ? <img src={doc.path} alt={name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} /> : null}
          <div className="text-center" style={{ display: !isImage ? 'flex' : 'none' }}>
            <FileText className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          </div>
        </div>
        <h4 className={`font-medium text-sm mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{name}</h4>
        <div className="flex gap-1">
          <button onClick={() => window.open(doc.path, '_blank')} className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs rounded ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
            <Eye className="w-3 h-3" /> View
          </button>
          <button onClick={() => downloadDocument(doc.path, `${name}.${ext}`)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs rounded" style={{ backgroundColor: '#c79e73', color: 'white' }}>
            <Download className="w-3 h-3" /> Get
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4`}>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>Restaurant Onboarding</h1>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Review and manage restaurant applications</p>
        {error && <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'} border text-sm`}>{error}</div>}
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          <input type="text" placeholder="Search restaurants..." value={search} onChange={(e) => setSearch(e.target.value)} className={`w-full pl-9 pr-4 py-2.5 border ${isDark ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-lg focus:outline-none`} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {stats.map((stat, i) => {
          const IconComponent = stat.icon
          return (
            <div key={i} onClick={() => setFilter(stat.filter)} className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-3 border cursor-pointer hover:shadow-md ${filter === stat.filter ? 'ring-2' : ''}`} style={{ ringColor: filter === stat.filter ? '#c79e73' : 'transparent' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color }}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {loading && (
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 text-center`}>
          <RefreshCw className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-400'} mx-auto mb-2 animate-spin`} />
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading restaurants...</p>
        </div>
      )}

      {!loading && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 text-center`}>
              <Store className={`w-12 h-12 ${isDark ? 'text-gray-400' : 'text-gray-400'} mx-auto mb-3`} />
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No restaurants found</p>
            </div>
          ) : (
            filtered.map((r) => (
              <div key={r.id} className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={r.profileImg} alt={r.owner} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{r.name}</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{r.owner} • {r.cuisine}</p>
                      {r.status === 'query' && r.queryHistory?.length > 0 && (
                        <p className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'} mt-1`}>
                          Last Query: {r.queryHistory[r.queryHistory.length - 1]?.message?.substring(0, 50)}...
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[r.status]}`}>
                      {r.status === 'query' ? 'Query Sent' : r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                    <button onClick={() => { setSelected(r); setModal('details') }} className={`p-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg`}>
                      <Eye className="w-4 h-4" />
                    </button>
                    {(r.status === 'pending' || r.status === 'query') && (
                      <>
                        <button onClick={() => handleAction(r.id, 'approved')} className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleAction(r.id, 'rejected')} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg">
                          <X className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleAction(r.id, 'query')} className="p-2 text-white rounded-lg" style={{ backgroundColor: '#c79e73' }}>
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Detail Modal */}
      {modal === 'details' && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <img src={selected.profileImg} alt={selected.owner} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selected.name}</h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>by {selected.owner}</p>
                </div>
              </div>
              <button onClick={() => setModal('')} className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg`}>
                <X className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Contact</h3>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>📧 {selected.email}</div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>📞 {selected.phone}</div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>📍 {selected.address}</div>
                </div>
                <div className="space-y-2">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Details</h3>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>🍽️ {selected.cuisine}</div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>🏬 {selected.outlet}</div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>🏢 {selected.entity_name}</div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>🏷️ {selected.franchise_code}</div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>🛗 {selected.liftInfo}</div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>📅 {selected.appliedDate}</div>
                </div>
              </div>

              <div>
                <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Documents</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(selected.documents).map(([key, docs]) => (
                    <DocCard key={key} docArray={docs} name={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} />
                  ))}
                </div>
              </div>

              {selected.queryHistory?.length > 0 && (
                <div>
                  <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Query History</h3>
                  <div className="space-y-2">
                    {selected.queryHistory.map((q, i) => (
                      <div key={i} className={`${isDark ? 'bg-yellow-900/30 border-yellow-700/50' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-3 text-sm`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className={`font-medium ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>Query #{i + 1}</span>
                          <span className={`text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>{q.date}</span>
                        </div>
                        <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{q.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(selected.status === 'pending' || selected.status === 'query') && (
                <div className={`flex gap-2 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button onClick={() => { handleAction(selected.id, 'approved'); setModal('') }} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm">Approve</button>
                  <button onClick={() => { handleAction(selected.id, 'rejected'); setModal('') }} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm">Reject</button>
                  <button onClick={() => { setQueryTarget(selected); setModal('query') }} className="px-4 py-2 text-white rounded-lg text-sm" style={{ backgroundColor: '#c79e73' }}>Send Query</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Query Modal */}
      {modal === 'query' && queryTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-md w-full`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Send Query</h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>to {queryTarget.name}</p>
            </div>
            <div className="p-4">
              <textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Write your query here..." className={`w-full h-24 p-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900'} rounded-lg resize-none focus:outline-none text-sm`} />
              <div className="flex gap-2 mt-3">
                <button onClick={sendQuery} disabled={!query.trim() || loading} className={`flex-1 px-4 py-2 text-sm ${!query.trim() || loading ? (isDark ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500') : 'text-white'} rounded-lg`} style={{ backgroundColor: !query.trim() || loading ? undefined : '#c79e73' }}>
                  {loading ? 'Sending...' : 'Send Query'}
                </button>
                <button onClick={() => { setModal(''); setQuery(''); setQueryTarget(null) }} className={`px-4 py-2 text-sm ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg`}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}