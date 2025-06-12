import React, { useState } from 'react'
import { Eye, Check, X, MessageSquare, Search, Filter, Download, FileText } from 'lucide-react'

const mockData = [
  {
    id: 1, name: "Spice Garden Restaurant", owner: "Raj Patel", email: "raj@spicegarden.com", 
    phone: "+91 98765 43210", address: "123 Main Street, Vadodara", cuisine: "Indian, Chinese",
    appliedDate: "2025-06-10", status: "pending", rating: 4.5,
    profileImg: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    restaurantImg: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
    documents: {
      panCard: { type: "image", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop" },
      fssai: { type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      gst: { type: "image", url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop" }
    }, queryHistory: []
  },
  {
    id: 2, name: "Pizza Corner", owner: "Maria Rodriguez", email: "maria@pizzacorner.com",
    phone: "+91 87654 32109", address: "456 Park Avenue, Vadodara", cuisine: "Italian, Fast Food",
    appliedDate: "2025-06-08", status: "approved", rating: 4.2,
    profileImg: "https://images.unsplash.com/photo-1494790108755-2616b612b639?w=150&h=150&fit=crop&crop=face",
    restaurantImg: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
    documents: {
      panCard: { type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      fssai: { type: "image", url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=250&fit=crop" },
      gst: { type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
    }, queryHistory: []
  },
  {
    id: 3, name: "Burger House", owner: "John Smith", email: "john@burgerhouse.com",
    phone: "+91 76543 21098", address: "789 Food Street, Vadodara", cuisine: "American, Burgers",
    appliedDate: "2025-06-05", status: "query", rating: 4.0,
    profileImg: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    restaurantImg: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop",
    documents: {
      panCard: { type: "image", url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop" },
      fssai: { type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      gst: { type: "image", url: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=250&fit=crop" }
    },
    queryHistory: [{ date: "2025-06-11", message: "Please provide clearer images of GST certificate." }]
  }
]

export default function RestaurantOnboarding() {
  const [restaurants, setRestaurants] = useState(mockData)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState('')
  const [preview, setPreview] = useState(null)
  const [query, setQuery] = useState('')
  const [queryTarget, setQueryTarget] = useState(null)

  const filtered = restaurants.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.owner.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || r.status === filter
    return matchSearch && matchFilter
  })

  const handleAction = (id, action) => {
    if (action === 'query') {
      setQueryTarget(restaurants.find(r => r.id === id))
      setModal('query')
    } else {
      setRestaurants(prev => prev.map(r => r.id === id ? { ...r, status: action } : r))
    }
  }

  const sendQuery = () => {
    if (query.trim() && queryTarget) {
      setRestaurants(prev => prev.map(r => 
        r.id === queryTarget.id ? { 
          ...r, status: 'query',
          queryHistory: [...(r.queryHistory || []), { date: new Date().toISOString().split('T')[0], message: query.trim() }]
        } : r
      ))
      setModal('')
      setQuery('')
      setQueryTarget(null)
    }
  }

  const downloadDocument = async (url, fileName) => {
    try {
      // For PDFs, we need to handle cross-origin issues differently
      if (fileName.endsWith('.pdf')) {
        // Create a link element for PDF download
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        link.setAttribute('download', fileName)
        
        // For better browser support with PDFs
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // For images, use blob method
        const response = await fetch(url)
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = fileName
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Clean up the blob URL
        window.URL.revokeObjectURL(downloadUrl)
      }
    } catch (error) {
      console.error('Download failed:', error)
      // Fallback: try direct download approach
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const statusColors = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
    query: 'bg-blue-100 text-blue-800'
  }

  const stats = [
    { label: 'Total', value: restaurants.length, color: 'bg-blue-500' },
    { label: 'Pending', value: restaurants.filter(r => r.status === 'pending').length, color: 'bg-amber-500' },
    { label: 'Query', value: restaurants.filter(r => r.status === 'query').length, color: 'bg-purple-500' },
    { label: 'Approved', value: restaurants.filter(r => r.status === 'approved').length, color: 'bg-emerald-500' },
    { label: 'Rejected', value: restaurants.filter(r => r.status === 'rejected').length, color: 'bg-red-500' }
  ]

  const DocCard = ({ doc, name }) => {
    const getFileExtension = (type) => {
      return type === 'pdf' ? 'pdf' : 'jpg'
    }

    const handleDownload = () => {
      const fileName = `${name.replace(/\s+/g, '_')}.${getFileExtension(doc.type)}`
      downloadDocument(doc.url, fileName)
    }

    return (
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="aspect-video bg-gray-100 flex items-center justify-center">
          {doc.type === 'image' ? (
            <img src={doc.url} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <span className="text-sm text-gray-500">PDF</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h4 className="font-medium mb-2">{name}</h4>
          <div className="flex gap-2">
            <button onClick={() => window.open(doc.url, '_blank')} className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded">
              <Eye className="w-4 h-4" /> Preview
            </button>
            <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 rounded">
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurant Onboarding</h1>
        <p className="text-gray-600">Review and manage restaurant applications</p>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text" placeholder="Search restaurants or owners..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="query">Query Sent</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`w-8 h-8 ${stat.color} rounded-lg`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Restaurant Cards */}
      <div className="space-y-4">
        {filtered.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <img src={r.profileImg} alt={r.owner} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h3 className="text-xl font-semibold">{r.name}</h3>
                  <p className="text-gray-600">by {r.owner}</p>
                  <p className="text-sm text-gray-500">{r.cuisine}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[r.status]}`}>
                {r.status === 'query' ? '🔄 Query Sent' : r.status.charAt(0).toUpperCase() + r.status.slice(1)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span>{r.phone}</span>
                <span>{r.address}</span>
                <span>Applied: {r.appliedDate}</span>
              </div>
              
              <div className="flex gap-2">
                <button onClick={() => { setSelected(r); setModal('details') }} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg">
                  <Eye className="w-4 h-4" />
                </button>
                
                {(r.status === 'pending' || r.status === 'query') && (
                  <>
                    <button onClick={() => handleAction(r.id, 'approved')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleAction(r.id, 'rejected')} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleAction(r.id, 'query')} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {modal === 'details' && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={selected.profileImg} alt={selected.owner} className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <h2 className="text-2xl font-bold">{selected.name}</h2>
                  <p className="text-gray-600">Owner: {selected.owner}</p>
                </div>
              </div>
              <button onClick={() => setModal('')} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Restaurant Image */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Restaurant Image</h3>
                <div className="bg-gray-50 rounded-xl overflow-hidden max-w-md">
                  <img src={selected.restaurantImg} alt={selected.name} className="w-full h-48 object-cover" />
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-2">
                    <div><span className="text-gray-500">Email:</span> {selected.email}</div>
                    <div><span className="text-gray-500">Phone:</span> {selected.phone}</div>
                    <div><span className="text-gray-500">Address:</span> {selected.address}</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Restaurant Details</h3>
                  <div className="space-y-2">
                    <div><span className="text-gray-500">Cuisine:</span> {selected.cuisine}</div>
                    <div><span className="text-gray-500">Rating:</span> {selected.rating} ⭐</div>
                    <div><span className="text-gray-500">Applied:</span> {selected.appliedDate}</div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <DocCard doc={selected.documents.panCard} name="PAN Card" />
                  <DocCard doc={selected.documents.fssai} name="FSSAI Certificate" />
                  <DocCard doc={selected.documents.gst} name="GST Certificate" />
                </div>
              </div>

              {/* Query History */}
              {selected.queryHistory?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Query History</h3>
                  <div className="space-y-3">
                    {selected.queryHistory.map((q, i) => (
                      <div key={i} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-yellow-800">Query #{i + 1}</span>
                          <span className="text-sm text-yellow-600">{q.date}</span>
                        </div>
                        <p className="text-gray-700">{q.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {(selected.status === 'pending' || selected.status === 'query') && (
                <div className="flex gap-3 pt-6 border-t">
                  <button onClick={() => { handleAction(selected.id, 'approved'); setModal('') }} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg">
                    Approve
                  </button>
                  <button onClick={() => { handleAction(selected.id, 'rejected'); setModal('') }} className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg">
                    Reject
                  </button>
                  <button onClick={() => { setQueryTarget(selected); setModal('query') }} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
                    Send Query
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">{preview.name}</h3>
              <button onClick={() => setPreview(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 h-96 overflow-auto">
              {preview.type === 'image' ? (
                <img src={preview.url} alt={preview.name} className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <FileText className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-600 text-center">PDF Preview not available.<br />Please download to view.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Query Modal */}
      {modal === 'query' && queryTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Send Query</h3>
              <p className="text-gray-600 text-sm mt-1">to {queryTarget.name}</p>
            </div>
            <div className="p-6">
              <textarea
                value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Write your query here..."
                className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-3 mt-4">
                <button onClick={sendQuery} disabled={!query.trim()} className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg">
                  Send Query
                </button>
                <button onClick={() => { setModal(''); setQuery(''); setQueryTarget(null) }} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg">
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