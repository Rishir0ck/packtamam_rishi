import React, { useState, useEffect } from 'react'
import { Eye, Check, X, MessageSquare, Search, Download, FileText, Store, Clock, AlertCircle, CheckCircle, XCircle, RefreshCw, Upload, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Mail, Phone, MapPin, Briefcase, Building, Building2, Key, MoveUpRight, CalendarDays, User2  } from 'lucide-react'
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadType, setUploadType] = useState('')
  const [uploadPreview, setUploadPreview] = useState(null)
  
  // Document types for dynamic upload
  const documentTypes = ['fssai_certificate', 'gst_certificate', 'pan_card']

  // Table state
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

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
          fssaiNo: item.fssai_no || 'N/A',
          gstNo: item.gst_no || 'N/A',
          appliedDate: item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          status: item.status,
          liftInfo: item.is_lift_available && item.is_lift_access ? 'Yes' : 'No',
          profileImg: item.profile_picture || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          documents: item.documents || {},
          franchise: item.franchise || {},
          queryHistory: item.query_message || []
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

  const handleAction = async (id, action) => {
    if (action === 'query') {
      setQueryTarget(allRestaurants.find(r => r.id === id))
      setModal('query')
      return
    }
    
    setLoading(true)
    setError('')
    try {
      const result = await AdminService.updateBusinessStatus(id, action.charAt(0).toUpperCase() + action.slice(1))
      if (result.success) {
        await loadRestaurants()
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
        await loadRestaurants()
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

  const uploadDocument = async () => {
  if ( !selected || !uploadType || !uploadFile) return;
  
  setLoading(true)
  setError('')
  try {
    // Convert file to FormData for proper binary upload
    const formData = { id: selected.id, type: uploadType, document: uploadFile }
    // new FormData()
    // formData.append('id', selected.id)
    // formData.append('type', uploadType)
    // formData.append('document', uploadFile) // File object will be properly serialized
    
    const result = await AdminService.uploadDocumentation(formData)
    console.log(result)
    if (result.success) {
      await loadRestaurants()
      setUploadFile(null)
      setUploadType('')
      setUploadPreview(null)
      setModal('')
    } else throw new Error(result.error || 'Failed to upload document')
  } catch (err) {
    setError(err.message || 'Failed to upload document')
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

  // Table sorting and pagination
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
    setCurrentPage(1)
  }

  const sortedData = [...restaurants].filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.owner.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    const aVal = a[sortBy]?.toString().toLowerCase() || ''
    const bVal = b[sortBy]?.toString().toLowerCase() || ''
    if (sortOrder === 'asc') return aVal.localeCompare(bVal)
    return bVal.localeCompare(aVal)
  })

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage)

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

  const TableHeader = ({ label, sortKey }) => (
    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-80 ${isDark ? 'text-gray-300 bg-gray-700' : 'text-gray-500 bg-gray-50'}`} onClick={() => handleSort(sortKey)}>
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {sortBy === sortKey && (
          sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </th>
  )

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
        <>
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Sr. No.</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Restaurant</th>
                    <TableHeader label="Owner" sortKey="owner" />
                    <TableHeader label="Buisness Type" sortKey="cuisine" />
                    <TableHeader label="Applied Date" sortKey="appliedDate" />
                    <TableHeader label="Status" sortKey="status" />
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`${isDark ? 'bg-gray-800' : 'bg-white'} divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center">
                        <Store className={`w-12 h-12 ${isDark ? 'text-gray-400' : 'text-gray-400'} mx-auto mb-3`} />
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No restaurants found</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((r,index) => {
                      const serialNumber = startIndex + index + 1;
                      return(
                      <tr key={r.id} className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{serialNumber}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img src={r.profileImg} alt="" className="w-10 h-10 rounded-full object-cover" />
                            <div className="ml-3">
                              <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{r.name}</div>
                              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{r.email}</div>
                              {r.status === 'query' && r.queryHistory?.length > 0 && (
                                <div className={`text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-600'} mt-1`}>
                                  Query: {r.queryHistory.slice(0, 30)}...
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{r.owner}</td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{r.cuisine}</td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{r.appliedDate}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${statusColors[r.status]}`}>
                            {r.status === 'query' ? 'Query Sent' : r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
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
                            <button onClick={() => { setSelected(r); setModal('details') }} className={`p-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg`}>
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      )})
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} px-4 py-3 border-t flex items-center justify-between`}>
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${currentPage === 1 ? (isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400') : (isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700')}`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className={`px-3 py-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${currentPage === totalPages ? (isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400') : (isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700')}`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Detail Modal */}
      {modal === 'details' && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <img src={selected.profileImg} alt="" className="w-12 h-12 rounded-full object-cover" />
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
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}><strong>Contact</strong></h3>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}><div className="flex items-center gap-2"><Mail className="w-4 h-4" /><strong>Email:</strong> {selected.email}</div></div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}><div className="flex items-center gap-2"><Phone className="w-4 h-4" /><strong>Phone:</strong> {selected.phone}</div></div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}><div className="flex items-center gap-2"><MapPin className="w-8 h-8" /><strong>Address:</strong> {selected.address}</div></div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}><div className="flex items-center gap-2"><FileText className="w-4 h-4" /><strong>FSSAI:</strong> {selected.fssaiNo}</div></div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}><div className="flex items-center gap-2"><FileText className="w-4 h-4" /> <strong>GST:</strong> {selected.gstNo}</div></div>
                </div>
                <div className="space-y-2">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}><strong>Details</strong></h3>  
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}><div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /><strong>Business Type:</strong> {selected.cuisine}</div></div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}><div className="flex items-center gap-2"><Store className="w-4 h-4" /><strong>Outlet Type:</strong> {selected.outlet}</div></div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}><div className="flex items-center gap-2"><Building2 className="w-4 h-4" /><strong>Legal Entity:</strong> {selected.entity_name}</div></div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}><div className="flex items-center gap-2"><Key className="w-4 h-4" /><strong>Franchise Code:</strong> {selected.franchise_code}</div></div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}><div className="flex items-center gap-2"><MoveUpRight className="w-4 h-4" /><strong>Lift Available:</strong> {selected.liftInfo}</div></div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}><div className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /><strong>Applied Date:</strong> {selected.appliedDate}</div></div>
                </div>
                
                {selected.queryHistory && selected.queryHistory.length > 0 && (
                  <div>
                    <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}><strong>Query History</strong></h3>
                    <div className={`${isDark ? 'bg-yellow-900/30 border-yellow-700/50' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-3 text-sm`}>
                      <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{selected.queryHistory}</p>
                    </div>
                  </div>
                )}

                {selected.franchise && selected.franchise.length > 0 && (
                  <div>
                    <h3 onClick={() => setIsModalOpen(true)} className={`font-semibold mb-3 cursor-pointer underline ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <strong>Franchise Info</strong>
                    </h3>
                  </div>
                )}
              </div>

              <div>
                <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}><strong>Documents</strong></h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(selected.documents).map(([key, docs]) => (
                    <DocCard key={key} docArray={docs} name={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} />
                  ))}
                </div>
              </div>

                {/* Upload Document Button */}
                <div className="relative">
                  <input
                    type="file"
                    id="upload-doc"
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (file) {
                        setUploadFile(file)
                        // Create preview
                        const reader = new FileReader()
                        reader.onload = (e) => setUploadPreview(e.target.result)
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  {(selected.status === 'pending' || selected.status === 'query') && (
                  <div className={`flex gap-2 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <button onClick={() => { handleAction(selected.id, 'approved'); setModal('') }} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm">Approve</button>
                    <button onClick={() => { handleAction(selected.id, 'rejected'); setModal('') }} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm">Reject</button>
                    <button onClick={() => { setQueryTarget(selected); setModal('query') }} className="px-4 py-2 text-white rounded-lg text-sm" style={{ backgroundColor: '#c79e73' }}>Send Query</button>
                    
                    {/* Upload Document Section */}
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id="upload-doc"
                        onChange={(e) => {
                          const file = e.target.files[0]
                          if (file) {
                            setUploadFile(file)
                            const reader = new FileReader()
                            reader.onload = (e) => setUploadPreview(e.target.result)
                            reader.readAsDataURL(file)
                          }
                        }}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                      <label htmlFor="upload-doc" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm cursor-pointer flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Upload Doc
                      </label>
                      
                      {uploadFile && (
                        <>
                          <select
                            value={uploadType}
                            onChange={(e) => setUploadType(e.target.value)}
                            className={`px-3 py-2 text-sm rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          >
                            <option value="">Select Type</option>
                            {documentTypes.map(type => (
                              <option key={type} value={type}>
                                {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </option>
                            ))}
                          </select>
                          <button 
                            onClick={uploadDocument}
                            disabled={loading || !uploadType}
                            className={`px-4 py-2 text-sm rounded-lg ${loading || !uploadType ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} text-white`}
                          >
                            {loading ? 'Uploading...' : 'Save'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
                {/* Document Preview Modal - Add this right after the upload section */}
                  {uploadPreview && (
                    <div className={`mt-4 p-4 border rounded-lg ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                      <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Preview: {uploadFile?.name}</h4>
                      <div className="max-h-40 overflow-hidden rounded">
                        {uploadFile?.type.startsWith('image/') ? (
                          <img src={uploadPreview} alt="Preview" className="max-w-full h-auto" />
                        ) : (
                          <div className={`p-4 text-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded`}>
                            <FileText className={`w-12 h-12 mx-auto mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{uploadFile?.name}</p>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {(uploadFile?.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => {
                          setUploadFile(null)
                          setUploadPreview(null)
                          setUploadType('')
                        }}
                        className={`mt-2 px-3 py-1 text-xs rounded ${isDark ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                      >
                        Remove
                      </button>
                    </div>
                  )}     
                </div>
              </div>
            </div>
          </div>
      )}

      {/* Franchise Modal */}
      {isModalOpen && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white '} p-6 rounded-lg max-w-md w-full `}>
            <button onClick={() => setIsModalOpen(false)} className="text-right w-full mb-4 text-xl font-bold">&times;</button>
            <div className="space-y-4">
              {selected.franchise.map(fr => (
                <div key={fr.id} className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  <div className="flex items-center gap-3">
                    <img src={fr.profile_picture || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"} alt={""} className="w-20 h-20 object-cover rounded mb-2" />
                    <div>
                      <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{fr.business_name}</h2>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>by {fr.owner_name}</p>
                    </div>
                  </div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}><div className="flex items-center gap-2"><User2 className="w-4 h-4" /><strong>Owner:</strong> {fr.owner_name}</div></div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}><div className="flex items-center gap-2"><Mail className="w-4 h-4" /><strong>Email:</strong> {fr.email}</div></div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}><div className="flex items-center gap-2"><Phone className="w-4 h-4" /><strong>Phone:</strong> {fr.mobile_number}</div></div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}><div className="flex items-center gap-2"><Store className="w-4 h-4" /><strong>Outlet Type:</strong> {fr.outlet_type}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Query Modal */}
      {modal === 'query' && queryTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
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