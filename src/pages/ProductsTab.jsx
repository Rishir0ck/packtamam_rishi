import React, { useState, useMemo, useCallback } from 'react'
import { Search, Plus, Package, TrendingUp, TrendingDown, Layers, Eye, Edit, Power, Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Modal from './Modal'
import ActionButton from './ActionButton'
import adminService from '../Firebase/services/adminApiService'
import Slider from 'react-slick'
import useTheme from '../hooks/useTheme'

export default function ProductsTab({ data = [], loading, apiCall }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState('')
  const [selected, setSelected] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const navigate = useNavigate()
  const { isDark } = useTheme()

  // Theme configuration
  const theme = isDark ? {
    bg: 'bg-gray-900', card: 'bg-gray-800 border-gray-700', text: 'text-white', muted: 'text-gray-300',
    border: 'border-gray-700', input: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400',
    hover: 'hover:bg-gray-700', tableHeader: 'bg-gray-700', tableRow: 'hover:bg-gray-750', btn: 'bg-gray-700 hover:bg-gray-600 text-white'
  } : {
    bg: 'bg-gray-50', card: 'bg-white border-gray-200', text: 'text-gray-900', muted: 'text-gray-600',
    border: 'border-gray-200', input: 'bg-white border-gray-300 placeholder-gray-500', hover: 'hover:bg-gray-50',
    tableHeader: 'bg-gray-50', tableRow: 'hover:bg-gray-50', btn: 'bg-gray-100 hover:bg-gray-200 text-gray-700'
  }

  const imageSliderSettings = {
    dots: true, infinite: true, speed: 500, slidesToShow: 1, slidesToScroll: 1,
    autoplay: true, autoplaySpeed: 1500, arrows: false
  }

  const getPrimaryInventory = useCallback((product) => product.inventories?.[0] || {}, [])
  const getPrice = useCallback((product) => {
    const inv = getPrimaryInventory(product)
    return inv.priceWithGst || inv.sellPrice || 0
  }, [getPrimaryInventory])

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
    setCurrentPage(1)
  }, [])

  const filteredData = useMemo(() => 
    data.filter(p => {
      const searchMatch = !search || [p.name, p.hsn_code, p.shape, p.colour, p.category?.name, p.material?.name]
        .some(field => field?.toLowerCase().includes(search.toLowerCase()))
      
      const filterMatch = filter === 'all' ||
        (filter === 'premium' && p.quality === 'Premium') ||
        (filter === 'active' && p.is_active) ||
        (filter === 'inactive' && !p.is_active)
      
      return searchMatch && filterMatch
    }), [data, search, filter])

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData
    
    return [...filteredData].sort((a, b) => {
      let aVal, bVal
      switch (sortConfig.key) {
        case 'category': aVal = a.category?.name || ''; bVal = b.category?.name || ''; break
        case 'material': aVal = a.material?.name || ''; bVal = b.material?.name || ''; break
        case 'price': aVal = getPrice(a); bVal = getPrice(b); break
        default: aVal = a[sortConfig.key] || ''; bVal = b[sortConfig.key] || ''
      }
      return aVal < bVal ? (sortConfig.direction === 'asc' ? -1 : 1) : 
             aVal > bVal ? (sortConfig.direction === 'asc' ? 1 : -1) : 0
    })
  }, [filteredData, sortConfig, getPrice])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return sortedData.slice(start, start + itemsPerPage)
  }, [sortedData, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

  const stats = useMemo(() => [
    { label: 'Total', value: data.length, icon: Package, color: '#c79e73', filter: 'all' },
    { label: 'Active', value: data.filter(p => p.is_active).length, icon: TrendingUp, color: '#10b981', filter: 'active' },
    { label: 'Inactive', value: data.filter(p => !p.is_active).length, icon: TrendingDown, color: '#ef4444', filter: 'inactive' },
    { label: 'Premium', value: data.filter(p => p.quality === 'Premium').length, icon: Layers, color: '#8b5cf6', filter: 'premium' }
  ], [data])

  const toggleStatus = useCallback((id, status) => 
    apiCall(() => adminService.updateProductStatus(id, !status)), [apiCall])

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronUp className="w-4 h-4 opacity-30" />
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-500" />
      : <ChevronDown className="w-4 h-4 text-blue-500" />
  }

  const tableColumns = [
    { key: 'name', label: 'Product', sortable: true },
    { key: 'hsn_code', label: 'HSN', sortable: true },
    { key: 'quality', label: 'Quality', sortable: true },
    { key: 'is_active', label: 'Status', sortable: true }
  ]

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-2xl font-semibold ${theme.text}`}>Products</h2>
            <p className={`${theme.muted}`}>Manage Products</p>
          </div>
          <button
            onClick={() => navigate('/product')}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#c79e73' }}
          >
            <Plus className="w-5 h-5" />Add Product
          </button>
        </div>

        {!data.length ? (
          <div className="text-center py-16">
            <Package className={`w-16 h-16 mx-auto mb-4 ${theme.muted}`} />
            <h3 className={`text-xl font-semibold mb-2 ${theme.text}`}>No products found</h3>
            <p className={`${theme.muted}`}>Start by adding your first product</p>
          </div>
        ) : (
          <>
            {/* Search & Stats */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 border ${theme.input} rounded-lg focus:outline-none`}
              />
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {stats.map((stat, i) => {
                const Icon = stat.icon
                return (
                  <div
                    key={i}
                    onClick={() => setFilter(stat.filter)}
                    className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${theme.card} ${
                      filter === stat.filter ? 'ring-2 ring-amber-400' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${theme.muted}`}>{stat.label}</p>
                        <p className={`text-2xl font-bold ${theme.text}`}>{stat.value}</p>
                      </div>
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color }}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Table */}
            <div className={`border rounded-lg overflow-hidden shadow-sm ${theme.card}`}>
              <table className="w-full">
                <thead className={theme.tableHeader}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>Sr. No.</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>Image</th>
                    {tableColumns.map(({ key, label, sortable }) => (
                      <th key={key} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>
                        {sortable ? (
                          <button onClick={() => handleSort(key)} className="flex items-center gap-1">
                            {label}<SortIcon column={key} />
                          </button>
                        ) : label}
                      </th>
                    ))}
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {paginatedData.map((item, index) => {
                    const serialNumber = (currentPage - 1) * itemsPerPage + index + 1
                    return (
                      <tr key={item.id} className={`${theme.tableRow} transition-colors`}>
                        <td className={`px-4 py-3 text-sm ${theme.text}`}>{serialNumber}</td>
                        <td className={`px-4 py-3 text-sm ${theme.text}`}>
                          {item.images?.[0]?.image_url ? (
                            <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                              <img src={item.images[0].image_url} alt="Product" className="max-w-full max-h-full object-contain" />
                            </div>
                          ) : (
                            <div className={`w-10 h-10 ${isDark ? 'bg-gray-600' : 'bg-gray-200'} rounded flex items-center justify-center`}>
                              <Package className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className={`px-4 py-3 ${theme.text}`}>
                          <div className="font-medium">{item.name}</div>
                          {(item.category.name || item.sub_category || item.material.name) && (
                            <div className={`text-sm ${theme.muted}`}>
                              {[item.category.name, item.sub_category, item.material.name].filter(Boolean).join(' • ')}
                            </div>
                          )}
                        </td>
                        <td className={`px-4 py-3 text-sm ${theme.text}`}>{item.hsn_code || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            item.quality === 'Premium' 
                              ? isDark ? 'bg-purple-900 text-purple-200 border border-purple-700' : 'bg-purple-100 text-purple-700 border border-purple-200'
                              : isDark ? 'bg-gray-700 text-gray-200 border border-gray-600' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                            {item.quality}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            item.is_active 
                              ? isDark ? 'bg-green-900 text-green-200 border border-green-700' : 'bg-green-100 text-green-700 border border-green-200'
                              : isDark ? 'bg-red-900 text-red-200 border border-red-700' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <ActionButton onClick={() => { setSelected(item); setModal('view') }} color="#6b7280" icon={Eye} title="View" />
                            <ActionButton 
                              onClick={() => navigate('/discount', { state: { editData: item } })} 
                              color="#c79e73" 
                              icon={Edit} 
                              title="Edit" 
                            />
                            <ActionButton onClick={() => toggleStatus(item.id, item.is_active)} color={item.is_active ? '#ef4444' : '#10b981'} icon={Power} title={item.is_active ? 'Deactivate' : 'Activate'} />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              
              {/* Pagination */}
              <div className={`flex items-center justify-between px-4 py-3 border-t ${theme.border}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${theme.muted}`}>Rows per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1) }}
                    className={`px-2 py-1 border rounded text-sm ${theme.input}`}
                  >
                    {[5, 10, 20, 50].map(size => <option key={size} value={size}>{size}</option>)}
                  </select>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`text-sm ${theme.muted}`}>
                    {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`p-1 rounded transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : theme.hover}`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={`p-1 rounded transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : theme.hover}`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal */}
            <Modal isOpen={modal === 'view'} onClose={() => setModal('')} title={selected?.name} theme={theme}>
              {selected && (
                <div className="p-6 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="col-span-3">
                      <p className={`text-sm font-medium ${theme.muted}`}>Images</p>
                      {selected.images?.length > 0 ? (
                        <div className="mt-2 flex space-x-4 max-w-xl">
                          {selected.images.slice(0, 4).map((img, idx) => (
                            <div key={idx} className="w-48 h-48 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                              <img src={img.image_url} alt={`Image ${idx + 1}`} className="max-w-full max-h-full object-contain" />
                            </div>
                          ))}
                          {Array.from({ length: 4 - selected.images.length }, (_, i) => (
                            <div key={`placeholder-${i}`} className="w-48 h-48 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                              No Image
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={`${theme.text} mt-2`}>No images available</p>
                      )}
                    </div>

                    {[
                      ['Name', selected.name],
                      ['Category', selected.category?.name || 'N/A'],
                      ['Sub Category', selected.sub_category?.name || 'N/A'],
                      ['Material', selected.material?.name || 'N/A'],
                      ['HSN Code', selected.hsn_code || 'N/A'],
                      ['Shape', selected.shape || 'N/A'],
                      ['Colour', selected.colour || 'N/A'],
                      ['Quality', selected.quality],
                      ['Status', selected.is_active ? 'Active' : 'Inactive']
                    ].map(([label, value], i) => (
                      <div key={i}>
                        <p className={`text-sm font-medium ${theme.muted}`}>{label}</p>
                        <p className={`mt-1 ${theme.text}`}>{value || '-'}</p>
                      </div>
                    ))}

                    {selected.specs && (
                      <div className="col-span-3">
                        <p className={`text-sm font-medium ${theme.muted}`}>Description</p>
                        {/* <p className={`mt-1 ${theme.text}`} style={{ whiteSpace: 'pre-line' }}>{selected.specs}</p> */}
                        <p className={`mt-1 ${theme.text}`}>{selected.specs}</p>
                      </div>
                    )}
                    {selected.features && (
                      <div className="col-span-3">
                        <p className={`text-sm font-medium ${theme.muted}`}>Features</p>
                        <p className={`mt-1 ${theme.text}`}>{selected.features}</p>
                      </div>
                    )}
                  </div>

                  {selected.inventories?.length > 0 && (
                    <div>
                      <h4 className={`text-lg font-semibold mb-4 ${theme.text}`}>Inventory Details</h4>
                      <div className="space-y-4">
                        {selected.inventories.map((inventory, index) => (
                          <div key={inventory.id || index} className={`border rounded-lg p-4 ${theme.card}`}>
                            <div className="grid grid-cols-4 gap-4">
                              {[
                                ['Size', inventory.size || 'N/A'],
                                ['Inventory Code', inventory.inventory_code || 'N/A'],
                                ['Quantity', inventory.quantity || 'N/A'],
                                ['Cost Price', `₹${inventory.costPrice || 0}`]
                              ].map(([label, value], i) => (
                                <div key={i}>
                                  <p className={`text-sm font-medium ${theme.muted}`}>{label}</p>
                                  <p className={`mt-1 ${theme.text}`}>{value}</p>
                                </div>
                              ))}
                            </div>

                            {inventory.price_slabs?.length > 0 && (
                              <div className="mt-4">
                                <p className={`text-sm font-medium ${theme.muted} mb-2`}>Price Slabs</p>
                                <div className="space-y-2">
                                  {inventory.price_slabs.map((slab, slabIndex) => (
                                    <div key={slab.id || slabIndex} className={`flex gap-4 text-sm ${theme.text}`}>
                                      <span>Quantity of Pack: {slab.packOff}</span>
                                      <span>Pack Off: {slab.minPack}</span>
                                      <span>Cost Price: ₹{slab.costPrice}</span>
                                      <span>Final Price: ₹{slab.sellPrice}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Modal>
          </>
        )}
      </div>
    </div>
  )
}